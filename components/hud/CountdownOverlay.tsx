'use client'

import { useGameStore } from '@/game/r3f/store'

export default function CountdownOverlay() {
  const step = useGameStore((s) => s.countdownStep)
  if (!step) return null
  const isGo = step === 'GO!'
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 90 }}
    >
      <div
        key={step}
        className="font-display font-black animate-countdown-pop"
        style={{
          fontSize: '80px',
          color: isGo ? '#7CFC00' : '#ffffff',
          WebkitTextStroke: '4px #2E7D32',
          paintOrder: 'stroke',
          textShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {step}
      </div>
    </div>
  )
}
