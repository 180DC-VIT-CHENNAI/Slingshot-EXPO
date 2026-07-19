'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingWall from '@/components/SpeechBubble'
import { AudioManager } from '@/components/AudioManager'

export default function WallClient() {
  const [hidden, setHidden] = useState(false)
  const [titleHidden, setTitleHidden] = useState(false)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const prevCountRef = useRef(0)
  const [animatePlus, setAnimatePlus] = useState(false)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/bubbles')
      if (!res.ok) return
      const data = await res.json()
      const count = data.totalPlayers ?? 0
      if (prevCountRef.current > 0 && count > prevCountRef.current) {
        setAnimatePlus(true)
        setTimeout(() => setAnimatePlus(false), 1500)
      }
      prevCountRef.current = count
      setTotalPlayers(count)
    } catch {}
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 10000)
    return () => clearInterval(interval)
  }, [fetchCount])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setHidden((v) => !v)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        setTitleHidden((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <AudioManager>
      <AnimatedBackground />
      <div className="fixed inset-0" style={{ zIndex: 10 }}>
        <div className={`absolute top-2 left-2 right-14 sm:top-4 sm:left-4 sm:right-16 z-20 transition-all duration-300 ${titleHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="glass-card px-3 py-2 sm:px-4 sm:py-3 text-center">
            <h1 className="font-display font-bold text-sm sm:text-lg text-white">
              Wall of Consultants
            </h1>
            <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">
              Every shot tells a story
            </p>
          </div>
        </div>

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <a
            href="/leaderboard"
            className="glass-card px-2 py-1.5 sm:px-3 sm:py-2 text-center hover:border-yellow-500/30 transition-colors"
            title="Leaderboard"
          >
            <span className="text-lg">🏆</span>
          </a>
          <div className="glass-card px-2 py-1.5 sm:px-3 sm:py-2 text-center min-w-[48px] sm:min-w-[60px]">
            <div className="font-display font-bold text-[9px] sm:text-xs text-white/60 uppercase tracking-wider">Users</div>
            <div className="relative">
              <span className="font-display font-bold text-sm sm:text-lg text-180dc-green-neon">{totalPlayers}</span>
              {animatePlus && (
                <span
                  className="absolute -right-4 top-0 font-display font-bold text-sm sm:text-lg text-180dc-green-neon animate-plus-one"
                >
                  +1
                </span>
              )}
            </div>
          </div>
        </div>

        <FloatingWall totalPlayers={totalPlayers} />

        <div className={`absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex gap-2 sm:gap-3 transition-all duration-300 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <a
            href="/play"
            className="flex-1 btn-primary text-center text-xs sm:text-sm py-2 sm:py-3"
          >
            PLAY
          </a>
          <a
            href="/"
            className="btn-secondary text-xs sm:text-sm py-2 sm:py-3 px-4 sm:px-5"
          >
            HOME
          </a>
        </div>
      </div>
    </AudioManager>
  )
}
