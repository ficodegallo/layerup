import Link from 'next/link'
import SignUpForm from '@/components/landing/SignUpForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight text-balance">
            Know exactly what to wear. Every morning.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto text-balance">
            A plain-English morning email that tells you what to wear today,
            based on your local weather. No apps. No radar maps. Just clear
            advice before you head out the door.
          </p>
          <div className="mt-10 flex justify-center">
            <SignUpForm />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sign up</h3>
              <p className="text-gray-600">
                Enter your email and ZIP code. Pick when you want your email
                delivered.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                We check the weather
              </h3>
              <p className="text-gray-600">
                Every morning, we pull real-time forecast data for your area and
                translate it into outfit advice.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Get your guide by 8 AM
              </h3>
              <p className="text-gray-600">
                Open your inbox and know exactly what to wear — head to toe, no
                guessing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Email Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Here&apos;s what you&apos;ll get
          </h2>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-sm text-gray-500">Inbox</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-500">
                From: <span className="text-gray-700">LayerUp</span>
              </div>
              <div className="text-sm text-gray-500">
                Subject:{' '}
                <span className="font-medium text-gray-900">
                  Cool and breezy — light jacket weather
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold text-lg">Good morning, Jess!</p>
                <p>
                  It&apos;s <span className="font-medium">58&deg;F</span> right
                  now in <span className="font-medium">Brooklyn, NY</span> and
                  heading up to{' '}
                  <span className="font-medium">64&deg;F</span> by afternoon.
                  Light breeze from the west.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-blue-900">
                    What to wear today:
                  </p>
                  <ul className="space-y-1 text-blue-800">
                    <li>- Light jacket or hoodie for the morning</li>
                    <li>- T-shirt underneath is fine</li>
                    <li>- Jeans or chinos</li>
                    <li>- Sneakers work great</li>
                    <li>- Skip the umbrella</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Vibe: Goldilocks day — not too hot, not too cold.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions? We&apos;ve got answers.
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Is it free?
              </h3>
              <p className="mt-1 text-gray-600">
                Yes, completely free. No credit card, no hidden fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                What weather data do you use?
              </h3>
              <p className="mt-1 text-gray-600">
                We pull forecasts from Open-Meteo and severe weather alerts from
                the National Weather Service to give you the most accurate
                picture for your area.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                How often will I get emails?
              </h3>
              <p className="mt-1 text-gray-600">
                Once a day, every morning. You choose whether you want it at
                6 AM, 7 AM, or 8 AM.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Can I unsubscribe?
              </h3>
              <p className="mt-1 text-gray-600">
                Of course. Every email has a one-click unsubscribe link. No
                hoops to jump through.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Which ZIP codes are supported?
              </h3>
              <p className="mt-1 text-gray-600">
                We support all US ZIP codes. International support is on the
                roadmap.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                What if I want to change my preferences?
              </h3>
              <p className="mt-1 text-gray-600">
                Each email includes a link to your preferences page where you
                can update your ZIP code, delivery time, and style preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">LayerUp</p>
          <p>
            <Link href="/privacy" className="hover:text-gray-700">
              Privacy Policy
            </Link>
          </p>
          <p>
            Every email includes a one-click unsubscribe link. We never share
            your data.
          </p>
        </div>
      </footer>
    </div>
  )
}
