import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processAndSendEmail } from '@/lib/email/engine'

function authenticateCron(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  return authHeader === `Bearer ${cronSecret}`
}

/**
 * Hourly Vercel Cron — sends emails to subscribers whose local hour matches deliveryHour.
 *
 * SQL: Find all ACTIVE subscribers where their local hour now = deliveryHour
 *      AND no successful send_log exists for today.
 */
export async function GET(request: Request) {
  if (!authenticateCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const todayUtc = new Date().toISOString().slice(0, 10)

  // Timezone-aware subscriber query
  const subscribers = await db.$queryRaw<Array<{ id: string; email: string; zip: string }>>`
    SELECT s.id, s.email, s.zip
    FROM subscribers s
    WHERE s.status = 'ACTIVE'
      AND s.delivery_hour = EXTRACT(HOUR FROM (NOW() AT TIME ZONE s.timezone))::int
      AND NOT EXISTS (
        SELECT 1 FROM send_logs sl
        WHERE sl.subscriber_id = s.id
          AND sl.date_for = CURRENT_DATE
          AND sl.status != 'FAILED'
      )
  `

  if (subscribers.length === 0) {
    return NextResponse.json({ processed: 0, date: todayUtc, message: 'No subscribers due this hour' })
  }

  const results = {
    total: subscribers.length,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Process in batches of 5 to avoid overloading DB + SendGrid
  const BATCH = 5
  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)

    await Promise.allSettled(
      batch.map(async (sub) => {
        // Create a QUEUED send_log first (idempotency guard)
        const log = await db.sendLog.create({
          data: {
            subscriberId: sub.id,
            dateFor: new Date(todayUtc + 'T12:00:00Z'),
            zip: sub.zip,
            status: 'QUEUED',
          },
        })

        try {
          const result = await processAndSendEmail(sub.id, todayUtc)

          await db.sendLog.update({
            where: { id: log.id },
            data: {
              status: result.success ? 'SENT' : 'FAILED',
              sendgridMsgId: result.sendgridMsgId,
              errorMessage: result.error,
            },
          })

          if (result.success) {
            results.sent++
          } else {
            results.failed++
            results.errors.push(`${sub.email}: ${result.error}`)
          }
        } catch (err: any) {
          await db.sendLog.update({
            where: { id: log.id },
            data: { status: 'FAILED', errorMessage: String(err?.message ?? err) },
          })
          results.failed++
          results.errors.push(`${sub.email}: ${err?.message ?? 'Unknown error'}`)
        }
      })
    )
  }

  console.log(`[send-emails] ${todayUtc}: sent=${results.sent}, failed=${results.failed}`)

  return NextResponse.json({
    date: todayUtc,
    ...results,
  })
}
