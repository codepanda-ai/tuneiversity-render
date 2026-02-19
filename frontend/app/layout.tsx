import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_SC } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sc',
})

export const metadata: Metadata = {
  title: 'ToneCoach - AI Mandarin Pronunciation Tutor',
  description:
    'Practice Mandarin pronunciation with Chinese song lyrics. AI-powered clarity scoring and feedback.',
}

export const viewport: Viewport = {
  themeColor: '#47b89a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${notoSansSC.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
