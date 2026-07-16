'use client'

import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingWall from '@/components/SpeechBubble'
import { AudioManager } from '@/components/AudioManager'

export default function WallClient() {
  return (
    <AudioManager>
      <AnimatedBackground />
      <div className="fixed inset-0" style={{ zIndex: 10 }}>
        <div className="absolute top-4 left-4 right-16 z-20">
          <div className="glass-card px-4 py-3 text-center">
            <h1 className="font-display font-bold text-lg text-white">
              Wall of Consultants
            </h1>
            <p className="text-white/60 text-xs mt-0.5">
              Every shot tells a story
            </p>
          </div>
        </div>

        <FloatingWall />

        <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-3">
          <a
            href="/play"
            className="flex-1 btn-primary text-center text-sm py-3"
          >
            PLAY
          </a>
          <a
            href="/"
            className="btn-secondary text-sm py-3 px-5"
          >
            HOME
          </a>
        </div>
      </div>
    </AudioManager>
  )
}
