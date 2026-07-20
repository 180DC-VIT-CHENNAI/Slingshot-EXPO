'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingWall from '@/components/SpeechBubble'
import { AudioManager } from '@/components/AudioManager'

function WallBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2017 25%, #132b1e 50%, #0d2017 75%, #0a1628 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(124,252,0,0.1) 0%, transparent 60%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(46,125,50,0.08) 0%, transparent 70%)',
      }} />
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'rgba(124,252,0,0.25)',
            animation: `particle-drift ${8 + Math.random() * 12}s linear ${Math.random() * 8}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    if (value === prev.current) return
    const start = prev.current
    const diff = value - start
    const duration = 600
    const startTime = Date.now()

    function tick() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    prev.current = value
  }, [value])

  return <span>{display.toLocaleString()}</span>
}

export default function WallClient() {
  const [hidden, setHidden] = useState(false)
  const [titleHidden, setTitleHidden] = useState(false)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const prevCountRef = useRef(0)
  const [showPlus, setShowPlus] = useState(false)
  const [recentName, setRecentName] = useState<string | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/bubbles')
      if (!res.ok) return
      const data = await res.json()
      const count = data.totalPlayers ?? 0
      const bubbles = data.bubbles ?? []

      if (prevCountRef.current > 0 && count > prevCountRef.current) {
        setShowPlus(true)
        const newest = bubbles.find((b: { name: string }) => b.name && !b.name.startsWith('Pilot '))
        if (newest) setRecentName(newest.name)
        setTimeout(() => setShowPlus(false), 2500)
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
      <WallBackground />
      <div className="fixed inset-0" style={{ zIndex: 10 }}>
        {/* Top-left: Title card */}
        <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-20 transition-all duration-300 ${titleHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div
            className="rounded-2xl px-3 py-2 sm:px-5 sm:py-3 text-left"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(124,252,0,0.2)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(124,252,0,0.2), rgba(46,125,50,0.15))',
                border: '1px solid rgba(124,252,0,0.3)',
              }}>
                <span className="text-base sm:text-lg">💬</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-sm sm:text-base text-white leading-tight">
                  Wall of Consultants
                </h1>
                <p className="text-white/40 text-[9px] sm:text-[10px] font-display tracking-wider">
                  EVERY SHOT TELLS A STORY
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top-right: Stats + nav */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <a
            href="/leaderboard"
            className="rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(124,252,0,0.2)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}
            title="Leaderboard"
          >
            <span className="text-base sm:text-lg">🏆</span>
            <span className="font-display font-bold text-[10px] sm:text-xs text-white/70 hidden sm:inline">RANKS</span>
          </a>

          <div
            className="rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 text-center min-w-[52px] sm:min-w-[64px]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(124,252,0,0.15)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div className="font-display font-bold text-[8px] sm:text-[9px] text-white/40 uppercase tracking-widest">Players</div>
            <div className="relative flex items-center justify-center gap-1">
              <span className="font-display font-extrabold text-base sm:text-xl" style={{ color: '#7CFC00', textShadow: '0 0 12px rgba(124,252,0,0.3)' }}>
                <AnimatedCounter value={totalPlayers} />
              </span>
              <AnimatePresence>
                {showPlus && (
                  <motion.span
                    initial={{ opacity: 0, x: -4, y: 4 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -right-1 -top-1 font-display font-bold text-[10px] sm:text-xs"
                    style={{ color: '#7CFC00' }}
                  >
                    +1
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Floating bubbles */}
        <FloatingWall totalPlayers={totalPlayers} />

        {/* Recent arrival toast */}
        <AnimatePresence>
          {showPlus && recentName && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <div
                className="rounded-2xl px-5 py-3 text-center"
                style={{
                  background: 'rgba(124,252,0,0.1)',
                  border: '1.5px solid rgba(124,252,0,0.3)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 30px rgba(124,252,0,0.15)',
                }}
              >
                <p className="font-display font-bold text-sm sm:text-base" style={{ color: '#7CFC00' }}>
                  {recentName} just joined!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom buttons */}
        <div className={`absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex gap-2 sm:gap-3 transition-all duration-300 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <a
            href="/play"
            className="flex-1 rounded-xl py-2.5 sm:py-3 text-center font-display font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(124,252,0,0.15) 0%, rgba(46,125,50,0.12) 100%)',
              border: '1.5px solid rgba(124,252,0,0.3)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 20px rgba(124,252,0,0.1), 0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ color: '#7CFC00' }}>PLAY</span>
          </a>
          <a
            href="/"
            className="rounded-xl py-2.5 sm:py-3 px-4 sm:px-5 text-center font-display font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            HOME
          </a>
        </div>
      </div>
    </AudioManager>
  )
}
