'use client'

import { useState, useEffect } from 'react'
import { MISSIONS, RANKS, loadProgress, clearProgress, getTotalStars, getCurrentRank, type CampaignProgress } from '@/lib/levels'

interface CampaignScreenProps {
  onSelectLevel: (levelId: number) => void
  onBack: () => void
  onLogout: () => void
}

const STAGE_COLORS: Record<string, string> = {
  Research: '#4CAF50',
  Analysis: '#2196F3',
  Strategy: '#FF9800',
  Implementation: '#f44336',
  Impact: '#FFD700',
}

const STAGE_ICONS: Record<string, string> = {
  Research: '🔍',
  Analysis: '📊',
  Strategy: '🎯',
  Implementation: '⚙️',
  Impact: '🏆',
}

export default function CampaignScreen({ onSelectLevel, onBack, onLogout }: CampaignScreenProps) {
  const [progress, setProgress] = useState<CampaignProgress | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  if (!progress) return null

  const totalStars = getTotalStars(progress)
  const maxStars = MISSIONS.length * 3
  const currentRank = getCurrentRank(progress)

  let nextRankIdx = RANKS.findIndex(r => r.name === currentRank) + 1
  if (nextRankIdx >= RANKS.length) nextRankIdx = RANKS.length - 1
  const nextRank = RANKS[nextRankIdx]

  const groupedStages = MISSIONS.reduce<Record<string, typeof MISSIONS>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = []
    acc[m.stage].push(m)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 flex flex-col items-center px-4 py-6 overflow-y-auto" style={{ zIndex: 20 }}>
      <div className={`w-full max-w-md transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-3 transition-colors font-display">
          ← Back
        </button>

        <div className="glass-card p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-lg text-white">Consultant Journey</h2>
            <button
              onClick={() => {
                const label = progress.playerName || 'Anonymous'
                if (window.confirm(`Switch away from "${label}"? All unsaved progress will be lost.`)) {
                  onLogout()
                }
              }}
              className="text-xs text-white/50 hover:text-red-400 font-display transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-white/5"
              title="Switch user"
            >
              {progress.playerName ? `${progress.playerName} ✕` : 'New Player ✕'}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${(totalStars / maxStars) * 100}%`,
                  background: 'linear-gradient(90deg, #7CFC00, #facc15)',
                }}
              />
            </div>
            <span className="text-white/60 text-xs font-display whitespace-nowrap">{totalStars}/{maxStars} ★</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50 font-display">
              Rank: <span className="text-180dc-green-neon font-bold">{currentRank}</span>
            </span>
            {nextRank && nextRank.name !== currentRank && (
              <span className="text-white/40 font-display">
                {nextRank.name} ({nextRank.minStars - totalStars}★ away)
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          {Object.entries(groupedStages).map(([stage, missions], stageIdx) => (
            <div key={stage} className="mb-4">
              <div className="flex items-center gap-2 mb-2 ml-2">
                <span className="text-lg">{STAGE_ICONS[stage]}</span>
                <span
                  className="font-display font-bold text-xs uppercase tracking-wider"
                  style={{ color: STAGE_COLORS[stage] }}
                >
                  {stage}
                </span>
                <div className="flex-1 h-px" style={{ background: `${STAGE_COLORS[stage]}33` }} />
              </div>

              <div className="space-y-2.5 ml-4 relative">
                {stageIdx < Object.keys(groupedStages).length - 1 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: `${STAGE_COLORS[stage]}20` }}
                  />
                )}

                {missions.map((mission) => {
                  const unlocked = mission.id === 1 || progress.completedLevels.includes(mission.id - 1)
                  const stars = progress.levelStars[mission.id] ?? 0
                  const bestScore = progress.levelScores[mission.id] ?? 0
                  const isCompleted = progress.completedLevels.includes(mission.id)
                  const isCurrent = unlocked && !isCompleted

                  return (
                    <button
                      key={mission.id}
                      onClick={() => unlocked && onSelectLevel(mission.id)}
                      disabled={!unlocked}
                      className={`w-full glass-card p-3.5 text-left transition-all duration-300 relative ${
                        unlocked
                          ? isCurrent
                            ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                            : isCompleted
                              ? 'border-green-500/30'
                              : 'hover:border-white/30'
                          : 'opacity-35 cursor-not-allowed'
                      }`}
                      style={isCurrent ? { borderColor: `${STAGE_COLORS[mission.stage]}60` } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 relative"
                          style={{
                            background: isCompleted
                              ? `linear-gradient(135deg, ${STAGE_COLORS[mission.stage]}30, ${STAGE_COLORS[mission.stage]}15)`
                              : unlocked
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(255,255,255,0.03)',
                            border: isCompleted
                              ? `1px solid ${STAGE_COLORS[mission.stage]}50`
                              : unlocked
                                ? '1px solid rgba(255,255,255,0.15)'
                                : '1px solid rgba(255,255,255,0.05)',
                            color: isCompleted ? STAGE_COLORS[mission.stage] : unlocked ? '#fff' : '#555',
                          }}
                        >
                          {isCompleted ? '✓' : mission.id}
                          {isCurrent && (
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                              style={{ background: STAGE_COLORS[mission.stage] }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-sm text-white truncate">{mission.title}</span>
                          </div>
                          <p className="text-white/35 text-xs mt-0.5">{mission.description}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {[1, 2, 3].map(s => (
                              <span key={s} className={`text-xs ${s <= stars ? 'opacity-100' : 'opacity-20'}`}>★</span>
                            ))}
                            {bestScore > 0 && (
                              <span className="text-white/25 text-xs ml-1 font-display">Best: {bestScore}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {progress.completedLevels.length === MISSIONS.length && (
          <div className="glass-card p-6 mt-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-display font-bold text-lg text-180dc-green-neon">Journey Complete!</h3>
            <p className="text-white/50 text-sm mt-1">You earned the rank of Managing Partner.</p>
          </div>
        )}
      </div>
    </div>
  )
}
