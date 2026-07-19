'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react'

export type SoundName = 'launch' | 'hit' | 'miss' | 'click'

interface AudioContextType {
  muted: boolean
  toggleMute: () => void
  play: (name: SoundName) => void
}

const AudioCtx = createContext<AudioContextType>({
  muted: false,
  toggleMute: () => {},
  play: () => {},
})

export function useAudio() {
  return useContext(AudioCtx)
}

/**
 * Synthesize a sound with the Web Audio API.
 * No files, no network — pure oscillators + gain envelopes.
 *
 * Sounds:
 *  - launch: upward swoosh (sine, 200→700 Hz, 0.2s)
 *  - hit: bright major chord (C5+E5+G5 triangle, 0.5s)
 *  - miss: sad descent (square, 200→80 Hz, 0.4s)
 *  - click: short blip (square, 800 Hz, 0.05s)
 */
function synthesize(ctx: AudioContext, name: SoundName): void {
  const now = ctx.currentTime
  const destination = ctx.destination

  switch (name) {
    case 'launch': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.15)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
      osc.connect(gain).connect(destination)
      osc.start(now)
      osc.stop(now + 0.25)
      break
    }
    case 'hit': {
      // C5, E5, G5 — bright major chord
      const freqs = [523.25, 659.25, 783.99]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
        osc.connect(gain).connect(destination)
        osc.start(now + i * 0.03)
        osc.stop(now + 0.6)
      })
      break
    }
    case 'miss': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
      osc.connect(gain).connect(destination)
      osc.start(now)
      osc.stop(now + 0.45)
      break
    }
    case 'click': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
      osc.connect(gain).connect(destination)
      osc.start(now)
      osc.stop(now + 0.06)
      break
    }
  }
}

export function AudioManager({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false)
  // Lazy-init: AudioContext can only be created after a user gesture (autoplay policy)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('180dc-muted')
    if (stored === 'true') setMuted(true)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      localStorage.setItem('180dc-muted', String(next))
      // Unmuting is a user gesture — prime the AudioContext immediately
      if (!next && !ctxRef.current && typeof window !== 'undefined') {
        try {
          ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        } catch {
          // AudioContext unavailable — play() will silently no-op
        }
      }
      return next
    })
  }, [])

  const play = useCallback((name: SoundName) => {
    if (muted) return
    if (typeof window === 'undefined') return

    // Lazy-init AudioContext on first play (must follow a user gesture)
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      } catch {
        return
      }
    }

    const ctx = ctxRef.current
    // Some browsers create the context in 'suspended' state until a gesture resumes it
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    try {
      synthesize(ctx, name)
    } catch {
      // Synthesis failed (oscillator allocation, etc.) — non-fatal
    }
  }, [muted])

  return (
    <AudioCtx.Provider value={{ muted, toggleMute, play }}>
      {children}
      <button
        onClick={toggleMute}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all duration-300 active:scale-90"
        style={{
          background: 'linear-gradient(135deg, #2E7D32, #43A047)',
          boxShadow: '0 0 20px rgba(46, 125, 50, 0.4), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
          border: '2px solid rgba(124, 252, 0, 0.4)',
        }}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </AudioCtx.Provider>
  )
}
