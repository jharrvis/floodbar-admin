import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { ClientAnalytics } from './components/ClientAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Floodbar - Sekat pintu anti banjir',
  description: 'Sekat pintu anti banjir custom untuk rumah Anda. Pre-order sekarang sebelum musim hujan!',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <Script id="openai-oaiq-pixel" strategy="beforeInteractive">{`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"NvqNMEMMjACb9u4ikjNwAp",debug:true});`}</Script>
      </head>
      <body className={inter.className}>
        {children}
        <ClientAnalytics />
        <Script id="cekat-ai-config" strategy="afterInteractive">{`window.CSAIConfig = { widgetId: 'widget-3-GAHVcXuv' };`}</Script>
        <Script src="https://cekat.biz.id/widget/widget.min.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}