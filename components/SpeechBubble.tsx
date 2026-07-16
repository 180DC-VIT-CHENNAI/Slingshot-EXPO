'use client'

import { useEffect, useState } from 'react'

interface BubbleData {
  id: string
  name: string
  comment: string
  score: number
}

interface FloatingBubble extends BubbleData {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  vr: number
  scale: number
  opacity: number
  entering: boolean
  size: 'sm' | 'md' | 'lg'
}

function SpeechBubbleShape({ name, comment, size }: { name: string; comment: string; size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'px-3 py-2 max-w-[130px] min-w-[80px]',
    md: 'px-4 py-3 max-w-[160px] min-w-[100px]',
    lg: 'px-5 py-3.5 max-w-[190px] min-w-[120px]',
  }

  const textSizes = {
    sm: { name: 'text-xs', comment: 'text-[10px]' },
    md: { name: 'text-sm', comment: 'text-xs' },
    lg: { name: 'text-base', comment: 'text-xs' },
  }

  const colors = [
    { bg: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', tail: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' },
    { bg: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)', tail: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)' },
    { bg: 'linear-gradient(135deg, #33691E 0%, #558B2F 100%)', tail: 'linear-gradient(135deg, #558B2F 0%, #33691E 100%)' },
    { bg: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)', tail: 'linear-gradient(135deg, #66BB6A 0%, #2E7D32 100%)' },
  ]

  const colorIndex = (name.charCodeAt(0) + (comment.charCodeAt(0) || 0)) % colors.length
  const { bg, tail } = colors[colorIndex]

  return (
    <div
      className={`relative rounded-2xl text-center ${sizeClasses[size]}`}
      style={{
        background: bg,
        boxShadow: '0 6px 25px rgba(46, 125, 50, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      <div className={`font-display font-bold text-white leading-tight ${textSizes[size].name}`}>{name}</div>
      <div className={`text-white/80 mt-0.5 leading-tight ${textSizes[size].comment}`}>{comment}</div>
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm"
        style={{ background: tail }}
      />
    </div>
  )
}

export default function FloatingWall() {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchBubbles() {
      try {
        const res = await fetch('/api/bubbles')
        if (!res.ok) return
        const data: BubbleData[] = await res.json()

        const w = window.innerWidth
        const h = window.innerHeight

        const newBubbles: FloatingBubble[] = data.map((b) => {
          const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']
          const sizeWeights = [0.2, 0.55, 0.25]
          const rand = Math.random()
          let sizeIdx = 1
          if (rand < sizeWeights[0]) sizeIdx = 0
          else if (rand < sizeWeights[0] + sizeWeights[1]) sizeIdx = 1
          else sizeIdx = 2

          return {
            ...b,
            x: 50 + Math.random() * (w - 100),
            y: 70 + Math.random() * (h - 140),
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            rotation: (Math.random() - 0.5) * 5,
            vr: (Math.random() - 0.5) * 0.08,
            scale: 0,
            opacity: 0,
            entering: true,
            size: sizes[sizeIdx],
          }
        })

        setBubbles(newBubbles.slice(0, 100))
        setLoaded(true)
      } catch {
        setLoaded(true)
      }
    }

    fetchBubbles()
    const interval = setInterval(fetchBubbles, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!loaded) return

    let animId: number
    function animate() {
      setBubbles((prev) => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 800
        const h = typeof window !== 'undefined' ? window.innerHeight : 600

        return prev.map((b) => {
          let { x, y, vx, vy, rotation, vr, scale, opacity, entering } = b

          if (entering) {
            scale = Math.min(scale + 0.05, 1)
            opacity = Math.min(opacity + 0.035, 1)
            if (scale >= 1) entering = false
          }

          x += vx
          y += vy
          rotation += vr

          if (x < 15 || x > w - 15) vx *= -1
          if (y < 15 || y > h - 15) vy *= -1
          if (Math.abs(rotation) > 6) vr *= -1

          x = Math.max(15, Math.min(w - 15, x))
          y = Math.max(15, Math.min(h - 15, y))

          return { ...b, x, y, vx, vy, rotation, vr, scale, opacity, entering }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [loaded])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute"
          style={{
            left: b.x,
            top: b.y,
            transform: `translate(-50%, -50%) scale(${b.scale}) rotate(${b.rotation}deg)`,
            opacity: b.opacity,
            transition: b.entering ? 'none' : undefined,
          }}
        >
          <SpeechBubbleShape name={b.name} comment={b.comment} size={b.size} />
        </div>
      ))}

      {bubbles.length === 0 && loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-white/70 font-display text-lg">No consultants yet!</p>
            <p className="text-white/50 text-sm mt-2">Play the game to add your bubble</p>
          </div>
        </div>
      )}
    </div>
  )
}
