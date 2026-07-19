'use client'

import { useState, useCallback, useRef } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { AudioManager } from '@/components/AudioManager'
import ResultScreen from '@/components/ResultScreen'
import NameModal from '@/components/NameModal'
import CampaignScreen from '@/components/CampaignScreen'
import { getRandomHitMessage, getRandomMissMessage } from '@/lib/messages'
import { calculateScore } from '@/lib/utils'
import {
  MISSIONS,
  loadProgress,
  clearProgress,
  updateLevelResult,
  calculateStars,
  getTotalStars,
  getCurrentRank,
  type CampaignProgress,
} from '@/lib/levels'
import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false })

type Screen = 'campaign' | 'playing' | 'name' | 'result'

function PlayContent() {
  const [screen, setScreen] = useState<Screen>('campaign')
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [isHit, setIsHit] = useState(false)
  const [message, setMessage] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [score, setScore] = useState(0)
  const [earnedStars, setEarnedStars] = useState(0)
  const [progress, setProgress] = useState<CampaignProgress>(loadProgress())
  const gameKey = useRef(0)
  const lastDistanceRef = useRef(0)

  const mission = MISSIONS.find(m => m.id === currentLevelId) ?? MISSIONS[0]

  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId)
    gameKey.current++
    setScreen('playing')
  }, [])

  const handleResult = useCallback((hit: boolean, distance: number) => {
    setIsHit(hit)
    if (hit) {
      lastDistanceRef.current = distance
      const s = calculateScore(distance)
      setScore(s)
      setEarnedStars(calculateStars(s, true))

      const p = loadProgress()
      if (!p.playerName && currentLevelId === 1) {
        setScreen('name')
      } else {
        updateLevelResult(currentLevelId, calculateStars(s, true), s)
        setProgress(loadProgress())
        setMessage(getRandomHitMessage())
        setScreen('result')
      }
    } else {
      setScore(0)
      setEarnedStars(0)
      setMessage(getRandomMissMessage())
      setScreen('result')
    }
  }, [currentLevelId])

  const handleNameSubmit = useCallback(async (name: string) => {
    setPlayerName(name)
    const stars = earnedStars
    updateLevelResult(currentLevelId, stars, score)
    setProgress(loadProgress())
    setMessage(getRandomHitMessage())
    setScreen('result')

    if (name) {
      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, distance: lastDistanceRef.current }),
        })
        const p = loadProgress()
        p.playerName = name
        const { saveProgress } = await import('@/lib/levels')
        saveProgress(p)
      } catch (e) { console.error('Failed to save session:', e) }
    }
  }, [currentLevelId, earnedStars, score])

  const handlePlayAgain = useCallback(() => {
    gameKey.current++
    setScreen('playing')
    setIsHit(false)
    setMessage('')
    setScore(0)
    setEarnedStars(0)
  }, [])

  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1
    if (nextId <= MISSIONS.length) {
      setCurrentLevelId(nextId)
      gameKey.current++
      setIsHit(false)
      setMessage('')
      setScore(0)
      setEarnedStars(0)
      setScreen('playing')
    } else {
      setScreen('campaign')
    }
  }, [currentLevelId])

  const handleBackToCampaign = useCallback(() => {
    setProgress(loadProgress())
    setScreen('campaign')
    setIsHit(false)
    setMessage('')
    setScore(0)
    setEarnedStars(0)
  }, [])

  const handleLogout = useCallback(async () => {
    const name = loadProgress().playerName
    try {
      await fetch('/api/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
    } catch {}
    clearProgress()
    setProgress(loadProgress())
    setPlayerName('')
    setScreen('campaign')
  }, [])

  const campaignScore = Object.values(progress.levelScores).reduce((a, b) => a + b, 0)

  return (
    <div className="fixed inset-0" style={{ zIndex: 10 }}>
      <AnimatedBackground active={screen !== 'playing'} />

      {screen === 'campaign' && (
        <CampaignScreen
          onSelectLevel={handleSelectLevel}
          onBack={() => window.location.href = '/'}
          onLogout={handleLogout}
        />
      )}

      {screen === 'playing' && (
        <div className="fixed inset-0">
          <GameCanvas key={gameKey.current} onResult={handleResult} levelId={currentLevelId} />
          <div className="absolute top-3 left-3" style={{ zIndex: 100 }}>
            <button
              onClick={handleBackToCampaign}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-bold text-white/60 hover:text-white/90 transition-colors"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ← MENU
            </button>
          </div>
          <div className="absolute top-3 right-3" style={{ zIndex: 100 }}>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-display font-bold text-white/60"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Mission {currentLevelId}: {mission.title}
            </div>
          </div>
        </div>
      )}

      {screen === 'name' && (
        <NameModal onSubmit={handleNameSubmit} />
      )}

      {screen === 'result' && (
        <ResultScreen
          hit={isHit}
          message={message}
          playerName={playerName}
          score={score}
          stars={earnedStars}
          levelId={currentLevelId}
          levelName={mission.title}
          campaignScore={campaignScore}
          rank={getCurrentRank(progress)}
          onPlayAgain={handlePlayAgain}
          onNextLevel={handleNextLevel}
          onBackToCampaign={handleBackToCampaign}
          hasNextLevel={currentLevelId < MISSIONS.length}
        />
      )}
    </div>
  )
}

export default function PlayClient() {
  return (
    <AudioManager>
      <PlayContent />
    </AudioManager>
  )
}
