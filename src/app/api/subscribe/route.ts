import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { zipToCoords } from '@/lib/geo/zip-to-coords'
import { generateToken } from '@/lib/email/tokens'
import { sendConfirmEmail } from '@/lib/email/sendgrid'
import { renderConfirmEmail } from '@/lib/email/renderer'

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, zip, name, deliveryHour } = body

    // Validate email
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Validate zip
    if (!zip || typeof zip !== 'string' || !/^\d{5}$/.test(zip.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid 5-digit ZIP code.' },
        { status: 400 }
      )
    }

    // Look up ZIP in database
    const zipInfo = await zipToCoords(zip.trim())
    if (!zipInfo) {
      return NextResponse.json(
        { error: 'ZIP code not found. Please check and try again.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check for existing subscriber
    const existing = await db.subscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'This email is already subscribed.' },
          { status: 409 }
        )
      }

      if (existing.status === 'PENDING') {
        // Resend confirmation email
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const confirmUrl = `${baseUrl}/api/confirm?token=${existing.confirmToken}`
        const html = renderConfirmEmail({ name: existing.name, confirmUrl }).html

        try {
          await sendConfirmEmail({ to: normalizedEmail, html })
        } catch (err) {
          console.error('Failed to resend confirmation email:', err)
        }

        return NextResponse.json({ success: true })
      }

      // If UNSUBSCRIBED or BOUNCED, allow re-subscription by updating
      const confirmToken = generateToken()
      const unsubscribeToken = generateToken()
      const hour = deliveryHour != null ? Number(deliveryHour) : 7

      await db.subscriber.update({
        where: { email: normalizedEmail },
        data: {
          zip: zip.trim(),
          name: name?.trim() || null,
          deliveryHour: hour,
          timezone: zipInfo.timezone,
          status: 'PENDING',
          confirmToken,
          unsubscribeToken,
          unsubscribedAt: null,
        },
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const confirmUrl = `${baseUrl}/api/confirm?token=${confirmToken}`
      const html = renderConfirmEmail({ name: name?.trim(), confirmUrl }).html

      try {
        await sendConfirmEmail({ to: normalizedEmail, html })
      } catch (err) {
        console.error('Failed to send confirmation email:', err)
      }

      return NextResponse.json({ success: true })
    }

    // Create new subscriber
    const confirmToken = generateToken()
    const unsubscribeToken = generateToken()
    const hour = deliveryHour != null ? Number(deliveryHour) : 7

    await db.subscriber.create({
      data: {
        email: normalizedEmail,
        zip: zip.trim(),
        name: name?.trim() || null,
        deliveryHour: hour,
        timezone: zipInfo.timezone,
        status: 'PENDING',
        confirmToken,
        unsubscribeToken,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const confirmUrl = `${baseUrl}/api/confirm?token=${confirmToken}`
    const html = renderConfirmEmail({ name: name?.trim(), confirmUrl }).html

    try {
      await sendConfirmEmail({ to: normalizedEmail, html })
    } catch (err) {
      console.error('Failed to send confirmation email:', err)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
