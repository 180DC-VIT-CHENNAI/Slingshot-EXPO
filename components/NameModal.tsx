'use client'

import { useState, useRef, useEffect } from 'react'

interface NameModalProps {
  onSubmit: (name: string) => void
}

export default function NameModal({ onSubmit }: NameModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => inputRef.current?.focus(), 400)
      return () => clearTimeout(t)
    }
  }, [visible])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name'); return }
    if (trimmed.length > 20) { setError('Max 20 characters'); return }
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) { setError('Only letters and spaces'); return }
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 40 }}>
      <div className={`absolute inset-0 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
           style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }} />
      <div className={`relative glass-card p-8 mx-6 max-w-sm w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}>
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-180dc-green-neon/40 bg-180dc-green/20 text-2xl font-black text-180dc-green-neon animate-scale-in">✓</div>
          <h2 className="font-display font-bold text-xl text-white">
            Identity revealed!
          </h2>
          <p className="text-white/50 text-sm mt-2">
            The release worked. The 180DC mark is uncovered.
          </p>
          <p className="text-white/60 text-xs mt-2">
            Drop your name on the Wall of Consultants
          </p>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder="Your name"
          maxLength={20}
          className="w-full rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-180dc-green-neon/50 font-display text-center text-lg transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />

        {error && (
          <p className="text-red-400 text-xs mt-2 text-center animate-shake">{error}</p>
        )}

        <button onClick={handleSubmit} className="w-full mt-4 btn-primary text-center">
          ADD TO WALL
        </button>

        <button
          onClick={() => onSubmit('')}
          className="w-full mt-2 text-white/50 text-xs text-center hover:text-white/80 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
