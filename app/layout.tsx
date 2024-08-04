import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: {
    default: 'AI-900 Quiz',
  },
  description: 'A chatbot to help you prepare for the AI-900 exam by Microsoft.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'AI-900 Quiz',
    description: 'A chatbot to help you prepare for the AI-900 exam by Microsoft.',
    type: 'website',
    url: 'https://ai900.iand.dev',
    image: 'https://ai900.iand.dev/opengraph-image.png',
    site_name: 'AI-900 Quiz',
    locale: 'en_US'
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1 bg-primary-foreground">{children}</main>
          </div>
          <Analytics />
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
