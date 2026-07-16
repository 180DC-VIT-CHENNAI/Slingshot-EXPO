'use client'

import dynamic from 'next/dynamic'

const WallClient = dynamic(() => import('./WallClient'), { ssr: false })

export default function WallPage() {
  return <WallClient />
}
