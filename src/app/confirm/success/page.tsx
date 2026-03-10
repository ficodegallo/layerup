import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirmed! — LayerUp',
}

export default function ConfirmSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">LayerUp</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <p className="text-5xl">🎉</p>
          <h2 className="text-2xl font-semibold text-gray-900">
            You&apos;re on the list!
          </h2>
          <p className="text-gray-600">
            Your email is confirmed. You&apos;ll start receiving your daily
            weather outfit guide each morning.
          </p>
          <div className="pt-2 text-sm text-gray-500 space-y-1">
            <p>Here&apos;s what to expect:</p>
            <ul className="text-left space-y-1 pl-4">
              <li>- A plain-English weather summary for your area</li>
              <li>- What to wear from head to toe</li>
              <li>- Delivered before you head out the door</li>
            </ul>
          </div>
        </div>
        <Link
          href="/"
          className="inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          Back to LayerUp
        </Link>
      </div>
    </div>
  )
}
