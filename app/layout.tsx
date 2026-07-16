import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '180DC: Restore the Missing Zero',
  description: 'Launch the missing zero into the 180DC logo using a slingshot! A fun interactive game for the 180DC Club Expo.',
  openGraph: {
    title: '180DC: Restore the Missing Zero',
    description: 'Launch the missing zero into the 180DC logo!',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="animated-bg">
        {children}
      </body>
    </html>
  )
}
