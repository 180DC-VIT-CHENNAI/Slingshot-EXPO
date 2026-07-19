'use client'

import { useState, useEffect } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { AudioManager } from '@/components/AudioManager'

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  comment: string
  createdAt: string
}

const RANK_EMOJI: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setEntries(data.leaderboard ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <AudioManager>
      <AnimatedBackground />
      <div className="fixed inset-0 flex flex-col items-center px-4 py-6 overflow-y-auto" style={{ zIndex: 10 }}>
        <div className={`w-full max-w-md transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a href="/wall" className="flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-4 transition-colors font-display">
            ← Wall of Consultants
          </a>

          <div className="glass-card p-6 mb-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h1 className="font-display font-bold text-xl text-white">Leaderboard</h1>
            <p className="text-white/50 text-xs mt-1">Top scorers across all sessions</p>
          </div>

          {loading ? (
            <div className="glass-card p-8 text-center">
              <p className="text-white/40 text-sm font-display">Loading rankings...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-white/40 text-sm font-display">No entries yet. Be the first!</p>
              <a href="/play" className="inline-block btn-primary text-sm px-6 py-2.5 mt-4">
                PLAY NOW
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.rank}
                  className="glass-card px-4 py-3 flex items-center gap-3 transition-all duration-300"
                  style={{
                    borderColor: entry.rank <= 3 ? 'rgba(124,252,0,0.3)' : undefined,
                  }}
                >
                  <div className="w-10 text-center shrink-0">
                    {RANK_EMOJI[entry.rank] ? (
                      <span className="text-xl">{RANK_EMOJI[entry.rank]}</span>
                    ) : (
                      <span className="font-display font-bold text-sm text-white/40">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-bold text-sm text-white truncate block">
                      {entry.name}
                    </span>
                    <span className="text-white/30 text-xs truncate block">{entry.comment}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="font-display font-black text-lg"
                      style={{
                        color: entry.rank <= 3 ? '#7CFC00' : '#fff',
                        opacity: entry.rank <= 3 ? 1 : 0.6,
                      }}
                    >
                      {entry.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <a href="/play" className="flex-1 btn-primary text-center text-sm py-3">
              PLAY
            </a>
            <a href="/" className="btn-secondary text-sm py-3 px-4">
              HOME
            </a>
          </div>
        </div>
      </div>
    </AudioManager>
  )
}
