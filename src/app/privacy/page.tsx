import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LayerUp',
  description: 'How LayerUp collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to LayerUp
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: March 8, 2024</p>

        <div className="mt-10 prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">What we collect</h2>
            <p className="mt-3">
              When you sign up for LayerUp, we collect:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1">
              <li>Your email address (required to send your daily email)</li>
              <li>Your ZIP code (required to fetch local weather data)</li>
              <li>Your name (optional, used to personalize your email greeting)</li>
              <li>Your preferred delivery time (6 AM, 7 AM, or 8 AM)</li>
            </ul>
            <p className="mt-3">
              We also collect anonymized analytics (page views, sign-up conversions) via
              Plausible Analytics, which is privacy-friendly and does not use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">How we use your data</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1">
              <li>To send you one daily weather outfit email</li>
              <li>To look up weather forecasts for your ZIP code</li>
              <li>To confirm your subscription via double opt-in</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal data with any third parties,
              except as described below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Third-party services</h2>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>
                <strong>SendGrid</strong> — used to deliver your daily emails. SendGrid
                processes your email address on our behalf.
              </li>
              <li>
                <strong>Open-Meteo</strong> — an open-source weather API we use to fetch
                forecast data. We send your ZIP code&apos;s latitude/longitude to this service.
                Open-Meteo does not log or store these queries.
              </li>
              <li>
                <strong>Plausible Analytics</strong> — privacy-first analytics with no cookies
                and no personal data collection.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Data retention</h2>
            <p className="mt-3">
              We keep your data for as long as you are subscribed. When you unsubscribe,
              your data is marked as inactive. You can request deletion at any time by
              emailing us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Unsubscribing</h2>
            <p className="mt-3">
              Every email includes a one-click unsubscribe link. You can also unsubscribe
              by emailing us directly. We process unsubscribes immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">CAN-SPAM compliance</h2>
            <p className="mt-3">
              LayerUp complies with the CAN-SPAM Act. Every email includes:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1">
              <li>A clear identification of the sender (LayerUp)</li>
              <li>An honest subject line</li>
              <li>A physical mailing address</li>
              <li>A prominent unsubscribe link</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
            <p className="mt-3">
              Questions about this policy? Email us at{' '}
              <a
                href="mailto:hello@layerup.email"
                className="text-blue-600 hover:underline"
              >
                hello@layerup.email
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
