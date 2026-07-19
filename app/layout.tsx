import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '180DC: Reveal the Identity',
  description: 'Hit the rope release with a slingshot arrow and uncover the 180DC identity in this interactive Club Expo game.',
  openGraph: {
    title: '180DC: Reveal the Identity',
    description: 'Take the shot. Break the release. Reveal 180DC.',
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
