import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthInitializer } from '@/components/layout/AuthInitializer'

export const metadata: Metadata = {
  title: 'LocalCart — Shop Local, Delivered Fresh',
  description: 'Browse grocery shops near you. Order online for delivery or pickup. Supporting local shops in Bangladesh.',
  keywords: 'grocery delivery Bangladesh, local shop, bazar, online grocery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ToastProvider>
          <AuthInitializer />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
