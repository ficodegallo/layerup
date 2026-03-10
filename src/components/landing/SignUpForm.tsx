'use client'

import { useState, FormEvent } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [zip, setZip] = useState('')
  const [name, setName] = useState('')
  const [deliveryHour, setDeliveryHour] = useState('7')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!/^\d{5}$/.test(zip)) {
      setErrorMessage('Please enter a valid 5-digit ZIP code.')
      setFormState('error')
      return
    }

    setFormState('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          zip: zip.trim(),
          name: name.trim() || undefined,
          deliveryHour: Number(deliveryHour),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong.')
        setFormState('error')
        return
      }

      setFormState('success')
    } catch {
      setErrorMessage('Network error. Please try again.')
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-green-800">Check your email!</p>
        <p className="text-green-700 mt-1">
          We sent a confirmation link. Click it to start receiving your daily
          outfit guide.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP code
          </label>
          <input
            id="zip"
            type="text"
            required
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="90210"
            maxLength={5}
            inputMode="numeric"
            pattern="\d{5}"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="deliveryHour" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery time
          </label>
          <select
            id="deliveryHour"
            value={deliveryHour}
            onChange={(e) => setDeliveryHour(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
          >
            <option value="6">6:00 AM</option>
            <option value="7">7:00 AM</option>
            <option value="8">8:00 AM</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          First name <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jess"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
        />
      </div>

      {formState === 'error' && errorMessage && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={formState === 'loading'}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
      >
        {formState === 'loading' ? 'Signing up...' : 'Sign up — it\u2019s free'}
      </button>
    </form>
  )
}
