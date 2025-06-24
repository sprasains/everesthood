import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Everhood - AI Vibe Hub for Gen-Z',
  description: 'The AI-powered platform for Gen-Z to discover, learn, and grow with the latest tech trends.',
  keywords: ['AI', 'Gen-Z', 'technology', 'news', 'summaries', 'startup', 'culture'],
  authors: [{ name: 'Everhood Team' }],
  creator: 'Everhood',
  publisher: 'Everhood',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://everhood.ai'),
  openGraph: {
    title: 'Everhood - AI Vibe Hub for Gen-Z',
    description: 'The AI-powered platform for Gen-Z to discover, learn, and grow with the latest tech trends.',
    url: 'https://everhood.ai',
    siteName: 'Everhood',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Everhood - AI Vibe Hub for Gen-Z',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Everhood - AI Vibe Hub for Gen-Z',
    description: 'The AI-powered platform for Gen-Z to discover, learn, and grow with the latest tech trends.',
    creator: '@everhood',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}