'use client'

import { useGameStore } from '@/game/r3f/store'

export default function HitFlash() {
  const phase = useGameStore((s) => s.flightPhase)
  if (phase !== 'hit') return null
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 90 }}
    >
      <div
        key="flash"
        className="absolute inset-0 animate-hit-flash"
        style={{ background: '#ffffff' }}
      />
      <div
        key="text"
        className="absolute left-1/2 animate-hit-pop"
        style={{
          top: '38%',
          fontSize: '44px',
          color: '#FFD700',
          WebkitTextStroke: '5px #1B5E20',
          paintOrder: 'stroke',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 900,
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        PERFECT!
      </div>
    </div>
  )
}
