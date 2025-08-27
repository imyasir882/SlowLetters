import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SlowLetters - Romance in Every Word',
  description: 'A romantic slow letter-writing app for two hearts, one story.',
  keywords: ['romance', 'letters', 'slow', 'vintage', 'love', 'correspondence'],
  authors: [{ name: 'SlowLetters Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'SlowLetters - Romance in Every Word',
    description: 'A romantic slow letter-writing app for two hearts, one story.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-vintage-cream`}>
        <div className="min-h-full bg-vintage-paper">
          {children}
        </div>
      </body>
    </html>
  )
}
