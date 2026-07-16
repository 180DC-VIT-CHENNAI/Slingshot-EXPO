'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react'

interface AudioContextType {
  muted: boolean
  toggleMute: () => void
  play: (name: string) => void
}

const AudioCtx = createContext<AudioContextType>({
  muted: false,
  toggleMute: () => {},
  play: () => {},
})

export function useAudio() {
  return useContext(AudioCtx)
}

export function AudioManager({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false)
  const soundsRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  useEffect(() => {
    const stored = localStorage.getItem('180dc-muted')
    if (stored === 'true') setMuted(true)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      localStorage.setItem('180dc-muted', String(next))
      return next
    })
  }, [])

  const play = useCallback(
    (name: string) => {
      if (muted) return

      let audio = soundsRef.current.get(name)
      if (!audio) {
        audio = new Audio(`/sounds/${name}.mp3`)
        audio.volume = 0.5
        soundsRef.current.set(name, audio)
      }
      audio.currentTime = 0
      audio.play().catch(() => {})
    },
    [muted]
  )

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
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </AudioCtx.Provider>
  )
}
