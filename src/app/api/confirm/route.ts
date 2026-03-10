import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
  }

  try {
    const subscriber = await db.subscriber.findUnique({
      where: { confirmToken: token },
    })

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/confirm/invalid', request.nextUrl.origin)
      )
    }

    await db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
        confirmToken: null,
      },
    })

    return NextResponse.redirect(
      new URL('/confirm/success', request.nextUrl.origin)
    )
  } catch (err) {
    console.error('Confirm error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
