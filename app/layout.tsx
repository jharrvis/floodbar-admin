import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AnalyticsScripts } from './components/AnalyticsScripts'

const inter = Inter({ subsets: ['latin'] })

async function getSettings() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/settings`, {
      cache: 'no-store'
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
  
  return {
    siteName: 'Floodbar - Sekat pintu anti banjir',
    siteDescription: 'Sekat pintu anti banjir custom untuk rumah Anda',
    logoUrl: '',
    facebookPixel: '',
    googleAnalytics: ''
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  
  return {
    title: settings.siteName,
    description: settings.siteDescription,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <html lang="id">
      <head>
        <AnalyticsScripts 
          facebookPixel={settings.facebookPixel} 
          googleAnalytics={settings.googleAnalytics} 
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}