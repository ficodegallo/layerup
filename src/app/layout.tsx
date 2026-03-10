import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LayerUp — Your daily weather outfit guide',
  description:
    'A plain-English morning email that tells you exactly what to wear today, based on your local weather. Sign up free.',
  openGraph: {
    title: 'LayerUp — Your daily weather outfit guide',
    description:
      'A plain-English morning email that tells you exactly what to wear today, based on your local weather.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LayerUp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LayerUp — Your daily weather outfit guide',
    description: 'A plain-English morning email that tells you exactly what to wear today.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
