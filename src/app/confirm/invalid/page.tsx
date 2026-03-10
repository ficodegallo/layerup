import Link from 'next/link'

export const metadata = {
  title: 'Invalid Link - LayerUp',
}

export default function ConfirmInvalidPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LayerUp</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Invalid or expired link
          </h2>
          <p className="text-gray-600 mb-6">
            This confirmation link is no longer valid. It may have already been
            used or expired. Try signing up again.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign up again
          </Link>
        </div>
      </div>
    </div>
  )
}
