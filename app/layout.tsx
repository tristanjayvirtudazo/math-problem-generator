import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import '@/styles/globals.css'

const lexend = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Math Problem Generator',
  description: 'AI-powered math problem generator for Primary 5 students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={lexend.className}>
      <body>{children}</body>
    </html>
  )
}