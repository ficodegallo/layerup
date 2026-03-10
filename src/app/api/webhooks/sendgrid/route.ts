import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

/**
 * Verify SendGrid's ECDSA webhook signature.
 * See: https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
 */
function verifySendGridSignature(
  payload: string,
  timestamp: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const timestampedPayload = timestamp + payload
    const verify = crypto.createVerify('SHA256')
    verify.update(timestampedPayload)
    return verify.verify(
      { key: publicKey, format: 'pem' },
      Buffer.from(signature, 'base64')
    )
  } catch {
    return false
  }
}

interface SendGridEvent {
  event: string
  email: string
  timestamp: number
  sg_message_id?: string
  'smtp-id'?: string
  subscriber_id?: string
  date_for?: string
  reason?: string
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Verify webhook signature if secret is configured
  const webhookSecret = process.env.SENDGRID_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-twilio-email-event-webhook-signature') ?? ''
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp') ?? ''

    if (!verifySendGridSignature(rawBody, timestamp, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let events: SendGridEvent[]
  try {
    events = JSON.parse(rawBody)
    if (!Array.isArray(events)) events = [events]
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  for (const event of events) {
    const msgId = event.sg_message_id?.split('.')[0] ?? event['smtp-id']
    const eventType = event.event
    const occurredAt = new Date(event.timestamp * 1000)

    // Store raw event for audit trail
    if (msgId) {
      await db.emailEvent.create({
        data: {
          sendgridMsgId: msgId,
          eventType,
          occurredAt,
          metadata: event as any,
        },
      }).catch(() => {}) // Non-critical — don't fail webhook on this
    }

    // Handle subscriber-level events
    try {
      switch (eventType) {
        case 'bounce':
        case 'blocked': {
          await db.subscriber.updateMany({
            where: { email: event.email },
            data: { status: 'BOUNCED' },
          })
          break
        }

        case 'unsubscribe':
        case 'spamreport': {
          await db.subscriber.updateMany({
            where: { email: event.email },
            data: { status: 'UNSUBSCRIBED', unsubscribedAt: occurredAt },
          })
          break
        }

        case 'open': {
          if (msgId) {
            await db.sendLog.updateMany({
              where: { sendgridMsgId: msgId },
              data: { status: 'OPENED', opens: { increment: 1 } },
            })
          }
          break
        }

        case 'click': {
          if (msgId) {
            await db.sendLog.updateMany({
              where: { sendgridMsgId: msgId },
              data: { status: 'CLICKED', clicks: { increment: 1 } },
            })
          }
          break
        }
      }
    } catch (err) {
      console.error('[webhook] Error processing event:', eventType, err)
    }
  }

  return NextResponse.json({ received: events.length })
}
