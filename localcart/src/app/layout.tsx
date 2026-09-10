import type { Metadata } from 'next'
import { Hind_Siliguri } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthInitializer } from '@/components/layout/AuthInitializer'

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
})

export const metadata: Metadata = {
  title: 'LocalCart — Shop Local, Delivered Fresh',
  description: 'Browse grocery shops near you. Order online for delivery or pickup. Supporting local shops in Bangladesh.',
  keywords: 'grocery delivery Bangladesh, local shop, bazar, online grocery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#faf8f5] text-[#222222] antialiased ${hindSiliguri.className} ${hindSiliguri.variable}`}>
        <ToastProvider>
          <AuthInitializer />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
