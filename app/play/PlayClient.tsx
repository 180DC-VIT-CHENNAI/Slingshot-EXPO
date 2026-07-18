'use client'

import { useState, useCallback, useRef } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { AudioManager } from '@/components/AudioManager'
import ResultScreen from '@/components/ResultScreen'
import NameModal from '@/components/NameModal'
import { getRandomHitMessage, getRandomMissMessage } from '@/lib/messages'
import { calculateScore } from '@/lib/utils'
import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false })

type GameState = 'playing' | 'name' | 'result'

function PlayContent() {
  const [gameState, setGameState] = useState<GameState>('playing')
  const [isHit, setIsHit] = useState(false)
  const [message, setMessage] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [score, setScore] = useState(0)
  const gameKey = useRef(0)
  const lastDistanceRef = useRef(0)

  const handleResult = useCallback((hit: boolean, distance: number) => {
    setIsHit(hit)
    if (hit) {
      lastDistanceRef.current = distance
      setScore(calculateScore(distance))
      setGameState('name')
    } else {
      setScore(0)
      setMessage(getRandomMissMessage())
      setGameState('result')
    }
  }, [])

  const handleNameSubmit = useCallback(async (name: string) => {
    setPlayerName(name)
    setMessage(getRandomHitMessage())
    setGameState('result')

    if (name) {
      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, distance: lastDistanceRef.current }),
        })
      } catch (e) { console.error('Failed to save session:', e) }
    }
  }, [])

  const handlePlayAgain = useCallback(() => {
    gameKey.current++
    setGameState('playing')
    setIsHit(false)
    setMessage('')
    setPlayerName('')
    setScore(0)
  }, [])

  return (
    <div className="fixed inset-0" style={{ zIndex: 10 }}>
      <AnimatedBackground active={gameState !== 'playing'} />

      {gameState === 'playing' && (
        <div className="fixed inset-0">
          <GameCanvas key={gameKey.current} onResult={handleResult} />
        </div>
      )}

      {gameState === 'name' && (
        <NameModal onSubmit={handleNameSubmit} />
      )}

      {gameState === 'result' && (
        <ResultScreen
          hit={isHit}
          message={message}
          playerName={playerName}
          score={score}
          onPlayAgain={handlePlayAgain}
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
