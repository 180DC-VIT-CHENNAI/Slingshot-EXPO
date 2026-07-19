'use client'

import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { useAudio, type SoundName } from '@/components/AudioManager'
import { getMissionConfig, createMissionScene } from '@/lib/missions'

interface GameProps {
  onResult: (hit: boolean, distance: number) => void
  levelId?: number
}

export default function GameCanvas({ onResult, levelId = 1 }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const { play } = useAudio()
  const playRef = useRef(play)
  useEffect(() => { playRef.current = play }, [play])

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const w = containerRef.current.clientWidth
    const h = containerRef.current.clientHeight
    const missionConfig = getMissionConfig(levelId)
    const SceneClass = createMissionScene(
      missionConfig,
      (n: SoundName) => playRef.current(n),
      onResult,
    )

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: containerRef.current,
      width: w,
      height: h,
      backgroundColor: '#000000',
      scene: SceneClass,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: { antialias: true, pixelArt: false },
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [onResult, levelId])

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ touchAction: 'none' }}
    />
  )
}
