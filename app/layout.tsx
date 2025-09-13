import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientAnalytics } from './components/ClientAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Floodbar - Sekat pintu anti banjir',
  description: 'Sekat pintu anti banjir custom untuk rumah Anda. Pre-order sekarang sebelum musim hujan!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <ClientAnalytics />
      </body>
    </html>
  )
}