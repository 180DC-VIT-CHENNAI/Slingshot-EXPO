'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AudioManager } from '@/components/AudioManager'

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  comment: string
  createdAt: string
}

function formatScore(score: number): string {
  return score.toLocaleString()
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRankColor(rank: number): string {
  if (rank === 1) return '#FFD54A'
  if (rank === 2) return '#DADADA'
  if (rank === 3) return '#CD7F32'
  return '#8B5CF6'
}

function getRankGlow(rank: number): string {
  if (rank === 1) return '0 0 20px rgba(255,213,74,0.5), 0 0 40px rgba(255,213,74,0.2)'
  if (rank === 2) return '0 0 15px rgba(218,218,218,0.4), 0 0 30px rgba(218,218,218,0.15)'
  if (rank === 3) return '0 0 15px rgba(205,127,50,0.4), 0 0 30px rgba(205,127,50,0.15)'
  return 'none'
}

function getGradientBg(rank: number): string {
  if (rank === 1) return 'linear-gradient(135deg, rgba(255,213,74,0.15) 0%, rgba(255,183,77,0.08) 100%)'
  if (rank === 2) return 'linear-gradient(135deg, rgba(218,218,218,0.12) 0%, rgba(180,180,180,0.06) 100%)'
  if (rank === 3) return 'linear-gradient(135deg, rgba(205,127,50,0.12) 0%, rgba(180,100,40,0.06) 100%)'
  return 'rgba(255,255,255,0.04)'
}

const CROWN_SVG = (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
    <path d="M2 14L4 5L8 9L10 2L12 9L16 5L18 14H2Z" fill="#FFD54A" stroke="#FFA000" strokeWidth="1"/>
    <circle cx="4" cy="5" r="1.5" fill="#FFD54A"/>
    <circle cx="10" cy="2" r="1.5" fill="#FFD54A"/>
    <circle cx="16" cy="5" r="1.5" fill="#FFD54A"/>
  </svg>
)

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="w-8 h-8 rounded-full animate-shimmer-skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded animate-shimmer-skeleton" />
            <div className="h-3 w-16 rounded animate-shimmer-skeleton" />
          </div>
          <div className="h-6 w-14 rounded animate-shimmer-skeleton" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🏆
      </motion.div>
      <h3 className="font-display font-bold text-xl text-white mb-2">No scores yet</h3>
      <p className="text-white/40 text-sm mb-6">Be the first to play!</p>
      <a href="/play" className="inline-block btn-primary text-sm px-8 py-3">
        PLAY NOW
      </a>
    </motion.div>
  )
}

function LeaderboardBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #1a0a3e 0%, #2A124A 25%, #3a1870 50%, #4A1E82 75%, #2A124A 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(107,51,200,0.3) 0%, transparent 60%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(74,30,130,0.2) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10,5,30,0.6) 100%)',
      }} />
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'rgba(255,255,255,0.4)',
            animation: `particle-drift ${8 + Math.random() * 12}s linear ${Math.random() * 8}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function LeaderboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-center mb-6 relative"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full animate-podium-glow" style={{
          background: 'radial-gradient(circle, rgba(255,213,74,0.15) 0%, transparent 70%)',
        }} />
      </div>
      <motion.div
        className="text-5xl mb-3 relative z-10"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        🏆
      </motion.div>
      <h1 className="font-display font-extrabold text-2xl tracking-wider relative z-10" style={{
        color: '#fff',
        textShadow: '0 0 20px rgba(255,213,74,0.3), 0 2px 4px rgba(0,0,0,0.3)',
      }}>
        LEADERBOARD
      </h1>
      <p className="text-white/40 text-xs font-display tracking-widest mt-1 relative z-10">TOP PLAYERS</p>
      <div className="flex justify-center gap-1 mt-2 relative z-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full" style={{
            background: i === 2 ? '#FFD54A' : 'rgba(255,255,255,0.2)',
          }} />
        ))}
      </div>
    </motion.div>
  )
}

function PodiumCard({ entry, delay }: { entry: LeaderboardEntry; delay: number }) {
  const isGold = entry.rank === 1
  const isSilver = entry.rank === 2
  const isBronze = entry.rank === 3

  const medalEmoji = isGold ? '🥇' : isSilver ? '🥈' : '🥉'
  const medalLabel = isGold ? '1ST' : isSilver ? '2ND' : '3RD'

  const cardHeight = isGold ? 'py-6' : 'py-5'
  const avatarSize = isGold ? 'w-16 h-16 text-xl' : 'w-13 h-13 text-base'
  const borderColor = getRankColor(entry.rank)
  const elevations = isGold ? '12px' : isSilver ? '6px' : '3px'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.03 }}
      className={`relative flex flex-col items-center ${cardHeight} px-4 rounded-2xl cursor-default`}
      style={{
        background: getGradientBg(entry.rank),
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${borderColor}40`,
        boxShadow: `${getRankGlow(entry.rank)}, 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
        transform: `translateY(-${elevations})`,
      }}
    >
      {isGold && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-crown-float z-20">
          {CROWN_SVG}
        </div>
      )}

      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
        <span className="text-2xl">{medalEmoji}</span>
      </div>

      <div className={`relative ${avatarSize} rounded-full flex items-center justify-center font-display font-bold mt-2 mb-2`}
        style={{
          background: `linear-gradient(135deg, ${borderColor}30, ${borderColor}15)`,
          border: `2px solid ${borderColor}80`,
          boxShadow: `0 0 12px ${borderColor}30`,
          color: borderColor,
        }}
      >
        {getInitials(entry.name)}
      </div>

      <span className="font-display font-bold text-sm text-white truncate max-w-full mb-1">
        {entry.name}
      </span>

      <span className="font-display font-black text-lg" style={{
        color: borderColor,
        textShadow: `0 0 10px ${borderColor}40`,
      }}>
        {formatScore(entry.score)}
      </span>

      <span className="text-[10px] font-display font-bold tracking-wider mt-1 px-3 py-0.5 rounded-full"
        style={{
          background: `${borderColor}20`,
          color: borderColor,
          border: `1px solid ${borderColor}30`,
        }}
      >
        {medalLabel}
      </span>
    </motion.div>
  )
}

function TopThreePodium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.filter(e => e.rank <= 3)
  if (top3.length === 0) return null

  const first = top3.find(e => e.rank === 1)
  const second = top3.find(e => e.rank === 2)
  const third = top3.find(e => e.rank === 3)

  return (
    <div className="mb-6">
      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-3 sm:hidden">
        {first && <PodiumCard entry={first} delay={0.2} />}
        <div className="flex gap-3">
          {second && <div className="flex-1"><PodiumCard entry={second} delay={0.35} /></div>}
          {third && <div className="flex-1"><PodiumCard entry={third} delay={0.5} /></div>}
        </div>
      </div>

      {/* Desktop: podium layout */}
      <div className="hidden sm:flex items-end justify-center gap-4 px-4">
        {second && <div className="flex-1 max-w-[150px]"><PodiumCard entry={second} delay={0.35} /></div>}
        {first && <div className="flex-1 max-w-[170px]"><PodiumCard entry={first} delay={0.2} /></div>}
        {third && <div className="flex-1 max-w-[150px]"><PodiumCard entry={third} delay={0.5} /></div>}
      </div>
    </div>
  )
}

function LeaderboardRow({ entry, index, isCurrentUser }: {
  entry: LeaderboardEntry
  index: number
  isCurrentUser: boolean
}) {
  const rankColor = getRankColor(entry.rank)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-default transition-all duration-200"
      style={{
        background: isCurrentUser ? 'rgba(255,213,74,0.08)' : 'rgba(255,255,255,0.04)',
        border: isCurrentUser ? '1.5px solid rgba(255,213,74,0.4)' : '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        boxShadow: isCurrentUser ? '0 0 20px rgba(255,213,74,0.15), 0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Rank badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
        style={{
          background: `${rankColor}20`,
          color: rankColor,
          border: `1.5px solid ${rankColor}40`,
          boxShadow: isCurrentUser ? `0 0 8px ${rankColor}30` : 'none',
        }}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
        style={{
          background: `linear-gradient(135deg, ${rankColor}25, ${rankColor}10)`,
          border: `1.5px solid ${rankColor}50`,
          color: rankColor,
        }}
      >
        {getInitials(entry.name)}
      </div>

      {/* Name + comment */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-sm text-white truncate">
            {entry.name}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full shrink-0 animate-rank-pulse"
              style={{
                background: 'rgba(255,213,74,0.15)',
                color: '#FFD54A',
                border: '1px solid rgba(255,213,74,0.3)',
              }}
            >
              YOU
            </span>
          )}
        </div>
        {entry.comment && (
          <span className="text-white/30 text-xs truncate block">{entry.comment}</span>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <span className="font-display font-black text-base" style={{
          color: rankColor,
          textShadow: entry.rank <= 3 ? `0 0 8px ${rankColor}30` : 'none',
        }}>
          {formatScore(entry.score)}
        </span>
      </div>
    </motion.div>
  )
}

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('180dc_campaign')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.playerName) setCurrentUser(parsed.playerName)
      } catch {}
    }

    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setEntries(data.leaderboard ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading && entries.length > 0 && currentUser) {
      const userEntry = entries.find(e => e.name === currentUser)
      if (userEntry && userEntry.rank > 3) {
        setTimeout(() => {
          const el = document.getElementById(`rank-${userEntry.rank}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 800)
      }
    }
  }, [loading, entries, currentUser])

  const remaining = entries.filter(e => e.rank > 3)

  return (
    <AudioManager>
      <LeaderboardBackground />

      <div
        ref={scrollRef}
        className="fixed inset-0 flex flex-col items-center overflow-y-auto"
        style={{ zIndex: 10, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-full max-w-lg px-4 py-6">
          {/* Back link */}
          <motion.a
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            href="/wall"
            className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs mb-4 transition-colors font-display"
          >
            ← Wall of Consultants
          </motion.a>

          <LeaderboardHeader />

          {loading ? (
            <SkeletonLoader />
          ) : entries.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <TopThreePodium entries={entries} />

              {remaining.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-white/30 text-[10px] font-display font-bold tracking-widest">MORE PLAYERS</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  {remaining.map((entry, i) => (
                    <div key={entry.rank} id={`rank-${entry.rank}`}>
                      <LeaderboardRow
                        entry={entry}
                        index={i}
                        isCurrentUser={entry.name === currentUser}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* Bottom nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex gap-3 mt-8 pb-6"
          >
            <a href="/play" className="flex-1 btn-primary text-center text-sm py-3">
              PLAY
            </a>
            <a href="/" className="btn-secondary text-sm py-3 px-5">
              HOME
            </a>
          </motion.div>
        </div>
      </div>
    </AudioManager>
  )
}
