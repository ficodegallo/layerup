import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
  }

  try {
    const subscriber = await db.subscriber.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/unsubscribe/invalid', request.nextUrl.origin)
      )
    }

    if (subscriber.status !== 'UNSUBSCRIBED') {
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
        },
      })
    }

    return NextResponse.redirect(
      new URL(`/unsubscribe/${token}`, request.nextUrl.origin)
    )
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
