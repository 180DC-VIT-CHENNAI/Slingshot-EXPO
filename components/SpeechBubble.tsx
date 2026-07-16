'use client'

import { useEffect, useRef, useState } from 'react'

interface BubbleData {
  id: string
  name: string
  comment: string
  score: number
}

interface FloatingBubble extends BubbleData {
  x: number
  y: number
  rotation: number
  vr: number
  scale: number
  targetScale: number
  opacity: number
  targetOpacity: number
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  depth: number
}

const CLOUD_COLORS = [
  { bg: 'rgba(46,125,50,0.85)', border: 'rgba(76,175,80,0.4)' },
  { bg: 'rgba(27,94,32,0.9)', border: 'rgba(56,142,60,0.4)' },
  { bg: 'rgba(51,105,30,0.85)', border: 'rgba(85,139,47,0.4)' },
  { bg: 'rgba(46,125,50,0.8)', border: 'rgba(102,187,106,0.4)' },
  { bg: 'rgba(67,160,71,0.85)', border: 'rgba(129,199,132,0.4)' },
]

const SIZE_MAP = {
  xs: { px: 'px-2 py-1 sm:px-3 sm:py-1.5', name: 'text-[9px] sm:text-[10px]', comment: 'text-[8px] sm:text-[9px]', minW: 55, maxW: 80 },
  sm: { px: 'px-3 py-1.5 sm:px-4 sm:py-2', name: 'text-[10px] sm:text-xs', comment: 'text-[9px] sm:text-[10px]', minW: 70, maxW: 110 },
  md: { px: 'px-3 py-2 sm:px-5 sm:py-2.5', name: 'text-xs sm:text-sm', comment: 'text-[10px] sm:text-xs', minW: 85, maxW: 140 },
  lg: { px: 'px-4 py-2 sm:px-6 sm:py-3', name: 'text-sm sm:text-base', comment: 'text-[10px] sm:text-xs', minW: 110, maxW: 175 },
  xl: { px: 'px-5 py-2.5 sm:px-7 sm:py-3.5', name: 'text-base sm:text-lg', comment: 'text-xs sm:text-sm', minW: 140, maxW: 215 },
}

function CloudBubble({ name, comment, size }: { name: string; comment: string; size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
  const s = SIZE_MAP[size]
  const colorIdx = (name.charCodeAt(0) * 7 + (comment.charCodeAt(0) || 42)) % CLOUD_COLORS.length
  const { bg, border } = CLOUD_COLORS[colorIdx]

  return (
    <div
      className={`relative rounded-full text-center ${s.px} whitespace-nowrap`}
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className={`font-display font-bold text-white leading-tight ${s.name}`}>{name}</div>
      <div className={`text-white/70 mt-0.5 leading-tight ${s.comment}`}>{comment}</div>
    </div>
  )
}

function getDensityScale(count: number): number {
  if (count <= 60) return 1
  return Math.max(0.6, 1 - (count - 60) * 0.0015)
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640
}

function getMaxBubbles(): number {
  if (typeof window === 'undefined') return 80
  return window.innerWidth < 640 ? 50 : 80
}

export default function FloatingWall({ totalPlayers = 0 }: { totalPlayers?: number }) {
  const bubblesRef = useRef<FloatingBubble[]>([])
  const renderCountRef = useRef(0)
  const [, forceRender] = useState(0)
  const animRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchBubbles() {
      try {
        const res = await fetch('/api/bubbles')
        if (!res.ok) return
        const json = await res.json()
        const data: BubbleData[] = json.bubbles ?? json

        const w = window.innerWidth
        const h = window.innerHeight
        const cx = w / 2
        const cy = h / 2
        const mobile = w < 640

        const sizePattern: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = mobile
          ? ['xs', 'xs', 'sm', 'sm', 'md']
          : ['xs', 'sm', 'sm', 'md', 'md', 'lg', 'xl']

        const existingIds = new Set(bubblesRef.current.map((b) => b.id))
        const newBubbles: FloatingBubble[] = []

        data.forEach((b, i) => {
          if (existingIds.has(b.id)) return

          const spreadX = w * 0.48
          const spreadY = h * 0.46

          newBubbles.push({
            ...b,
            x: cx + (Math.random() - 0.5) * spreadX * 2,
            y: cy + (Math.random() - 0.5) * spreadY * 2,
            rotation: (Math.random() - 0.5) * 6,
            vr: (Math.random() - 0.5) * 0.08,
            scale: 0,
            targetScale: 1,
            opacity: 0,
            targetOpacity: 0.85 + Math.random() * 0.15,
            size: sizePattern[i % sizePattern.length],
            depth: Math.random(),
          })
        })

        if (newBubbles.length > 0) {
          bubblesRef.current = [...bubblesRef.current, ...newBubbles]
            .sort((a, b) => a.depth - b.depth)
            .slice(0, getMaxBubbles())
          renderCountRef.current++
          forceRender(renderCountRef.current)
        }

        if (!loaded) setLoaded(true)
      } catch {
        if (!loaded) setLoaded(true)
      }
    }

    fetchBubbles()
    const interval = setInterval(fetchBubbles, 5000)
    return () => clearInterval(interval)
  }, [loaded])

  useEffect(() => {
    const densityScale = getDensityScale(totalPlayers)
    bubblesRef.current.forEach((b) => {
      b.targetScale = densityScale
    })
  }, [totalPlayers])

  useEffect(() => {
    if (!loaded) return

    let lastTime = performance.now()

    function animate(now: number) {
      const dt = Math.min(now - lastTime, 50)
      lastTime = now

      const bubbles = bubblesRef.current
      let needsRender = false

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i]

        const newScale = b.scale + (b.targetScale - b.scale) * 0.04
        if (Math.abs(newScale - b.scale) > 0.0001) {
          b.scale = newScale
          needsRender = true
        } else if (b.scale !== b.targetScale) {
          b.scale = b.targetScale
          needsRender = true
        }

        const newOpacity = b.opacity + (b.targetOpacity - b.opacity) * 0.04
        if (Math.abs(newOpacity - b.opacity) > 0.0001) {
          b.opacity = newOpacity
          needsRender = true
        } else if (b.opacity !== b.targetOpacity) {
          b.opacity = b.targetOpacity
          needsRender = true
        }

        let newRotation = b.rotation + b.vr * (dt / 16)
        if (Math.abs(newRotation) > 10) {
          b.vr *= -1
          newRotation = b.rotation + b.vr * (dt / 16)
        }
        if (Math.abs(newRotation - b.rotation) > 0.001) {
          b.rotation = newRotation
          needsRender = true
        }
      }

      if (needsRender) {
        renderCountRef.current++
        forceRender(renderCountRef.current)
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [loaded])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {bubblesRef.current.map((b) => (
        <div
          key={b.id}
          className="absolute pointer-events-none"
          style={{
            left: b.x,
            top: b.y,
            transform: `translate(-50%, -50%) scale(${b.scale}) rotate(${b.rotation}deg)`,
            opacity: b.opacity,
            willChange: 'transform, opacity',
          }}
        >
          <CloudBubble name={b.name} comment={b.comment} size={b.size} />
        </div>
      ))}

      {bubblesRef.current.length === 0 && loaded && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-4">💬</div>
            <p className="text-white/70 font-display text-base sm:text-lg">No consultants yet!</p>
            <p className="text-white/50 text-xs sm:text-sm mt-2">Play the game to add your bubble</p>
          </div>
        </div>
      )}
    </div>
  )
}
