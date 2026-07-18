import { useGameStore } from './store'
import Confetti from './effects/Confetti'
import type { PlayfieldLayout } from '@/game/config/layout'

interface Props {
  layout: PlayfieldLayout
}

export default function Effects({ layout }: Props) {
  const phase = useGameStore((s) => s.flightPhase)
  if (phase !== 'hit') return null
  return (
    <Confetti
      centerX={layout.slotX}
      topY={layout.slotY}
      bottomY={layout.height}
    />
  )
}
