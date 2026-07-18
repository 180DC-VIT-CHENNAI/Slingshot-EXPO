'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/game/r3f/store'

export default function MissOverlay() {
  const phase = useGameStore((s) => s.flightPhase)
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const [showEnd, setShowEnd] = useState(false)
  const [showSub, setShowSub] = useState(false)

  useEffect(() => {
    if (phase !== 'miss') {
      setOverlayOpacity(0)
      setShowEnd(false)
      setShowSub(false)
      return
    }
    const t1 = setTimeout(() => setOverlayOpacity(0.6), 0)
    const t2 = setTimeout(() => setOverlayOpacity(1), 600)
    const t3 = setTimeout(() => setShowEnd(true), 1600)
    const t4 = setTimeout(() => setShowSub(true), 2100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [phase])

  if (phase !== 'miss') return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{
        zIndex: 95,
        background: `rgba(0,0,0,${overlayOpacity})`,
        transition: 'background 0.6s ease-out',
      }}
    >
      {showEnd && (
        <div
          key="end"
          className="animate-end-pop"
          style={{
            fontSize: '72px',
            color: '#ffffff',
            WebkitTextStroke: '6px #7CFC00',
            paintOrder: 'stroke',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 900,
          }}
        >
          THE END
        </div>
      )}
      {showSub && (
        <div
          className="animate-fade-in"
          style={{
            fontSize: '18px',
            color: '#aaaaaa',
            marginTop: '14px',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          that 0 was not the one...
        </div>
      )}
    </div>
  )
}
