import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Unsubscribed — LayerUp',
}

interface Props {
  params: { token: string }
}

export default async function UnsubscribePage({ params }: Props) {
  const { token } = params

  const subscriber = await db.subscriber.findUnique({
    where: { unsubscribeToken: token },
  })

  if (!subscriber) {
    notFound()
  }

  // Perform the unsubscription if not already done
  if (subscriber.status !== 'UNSUBSCRIBED') {
    await db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">LayerUp</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            You&apos;ve been unsubscribed
          </h2>
          <p className="text-gray-600">
            You won&apos;t receive any more emails from LayerUp. We&apos;re
            sorry to see you go!
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Unsubscribed by mistake?{' '}
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Re-subscribe here
          </Link>
        </p>
      </div>
    </div>
  )
}
