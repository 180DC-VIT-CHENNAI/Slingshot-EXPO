'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { createLayout, type PlayfieldLayout } from '@/game/config/layout'
import Experience from '@/game/r3f/Experience'
import CountdownOverlay from '@/components/hud/CountdownOverlay'
import PowerBar from '@/components/hud/PowerBar'
import HitFlash from '@/components/hud/HitFlash'
import MissOverlay from '@/components/hud/MissOverlay'

interface GameProps {
  onResult: (hit: boolean) => void
}

function makeLayout(w: number, h: number): PlayfieldLayout {
  const width = w > 0 ? w : (typeof window !== 'undefined' ? window.innerWidth : 800)
  const height = h > 0 ? h : (typeof window !== 'undefined' ? window.innerHeight : 600)
  return createLayout(width, height)
}

export default function GameCanvas({ onResult }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<PlayfieldLayout>(() => makeLayout(0, 0))

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setLayout(makeLayout(el.clientWidth, el.clientHeight))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ touchAction: 'none' }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      >
        <Experience layout={layout} onResult={onResult} />
      </Canvas>
      <CountdownOverlay />
      <PowerBar slingshotY={layout.height - layout.slingshotY} />
      <HitFlash />
      <MissOverlay />
    </div>
  )
}
