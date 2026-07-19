'use client'

import { useEffect, useState } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { AudioManager } from '@/components/AudioManager'
import { loadProgress, clearProgress } from '@/lib/levels'

export default function HomePage() {
  const [visible, setVisible] = useState(false)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    const p = loadProgress()
    if (p.playerName) setPlayerName(p.playerName)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    const name = loadProgress().playerName
    try {
      await fetch('/api/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
    } catch {}
    clearProgress()
    setPlayerName('')
  }

  return (
    <AudioManager>
      <AnimatedBackground />
      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          backgroundColor: '#01245d',
          backgroundImage: 'url(/images/image.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
        }}
      />
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ zIndex: 10 }}>
        <div className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-10">
            <div className="relative inline-block animate-float-gentle">
              <div className="w-36 h-36 mx-auto rounded-3xl flex items-center justify-center shadow-2xl animate-glow-breathe"
                   style={{
                     background: 'rgba(15, 20, 35, 0.85)',
                     backdropFilter: 'blur(20px)',
                     border: '1px solid rgba(255,255,255,0.15)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 25px rgba(46, 125, 50, 0.3)',
                   }}>
                <span className="font-display font-black text-5xl tracking-tighter text-white">
                  1<span className="text-180dc-green-neon">80</span>DC
                </span>
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                   style={{
                     background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                     border: '2px solid rgba(255,255,255,0.3)',
                     boxShadow: '0 4px 15px rgba(46, 125, 50, 0.5)',
                   }}>
                →
              </div>
            </div>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight text-white">
            Pull the release.
            <br />
            <span className="text-180dc-green-neon" style={{ textShadow: '0 0 20px rgba(124,252,0,0.6), 0 2px 4px rgba(0,0,0,0.3)' }}>Reveal 180DC.</span>
          </h1>

          <p className="text-sm sm:text-base mb-12 max-w-xs mx-auto leading-relaxed text-white/70">
            Send an arrow into the release board and uncover the identity.
          </p>

          <a
            href="/play"
            className="inline-block btn-primary text-xl px-14 py-5 rounded-2xl"
          >
            START JOURNEY
          </a>

          {playerName && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-xs text-white/40 font-display">
                Playing as <span className="text-white/70">{playerName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-white/40 hover:text-red-400 font-display transition-colors cursor-pointer"
              >
                Not you? Switch user
              </button>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-6 text-xs">
            <a href="/wall" className="text-white/50 hover:text-white/80 transition-colors">
              Wall of Consultants
            </a>
          </div>
        </div>
      </div>
    </AudioManager>
  )
}
