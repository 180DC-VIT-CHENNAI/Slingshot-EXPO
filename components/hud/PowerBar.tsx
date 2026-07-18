'use client'

import { useGameStore } from '@/game/r3f/store'
import {
  POWER_BAR_WIDTH,
  POWER_BAR_HEIGHT,
  POWER_BAR_THRESHOLD_LOW,
  POWER_BAR_THRESHOLD_MID,
} from '@/game/config/gameBalance'
import { COLORS } from '@/game/config/theme'

interface Props {
  slingshotY: number
}

export default function PowerBar({ slingshotY }: Props) {
  const pf = useGameStore((s) => s.pullFactor)
  if (pf <= 0) return null

  let color: string
  if (pf < POWER_BAR_THRESHOLD_LOW) {
    const t = pf / POWER_BAR_THRESHOLD_LOW
    const r = Math.floor(
      COLORS.POWER_GREEN.r + (COLORS.POWER_YELLOW.r - COLORS.POWER_GREEN.r) * t,
    )
    const g = Math.floor(
      COLORS.POWER_GREEN.g + (COLORS.POWER_YELLOW.g - COLORS.POWER_GREEN.g) * t,
    )
    const b = Math.floor(
      COLORS.POWER_GREEN.b + (COLORS.POWER_YELLOW.b - COLORS.POWER_GREEN.b) * t,
    )
    color = `rgb(${r},${g},${b})`
  } else if (pf < POWER_BAR_THRESHOLD_MID) {
    const t = (pf - POWER_BAR_THRESHOLD_LOW) / POWER_BAR_THRESHOLD_LOW
    const r = Math.floor(COLORS.POWER_YELLOW.r - 35 * t)
    const g = Math.floor(COLORS.POWER_YELLOW.g - 50 * t)
    const b = Math.floor(COLORS.POWER_YELLOW.b + 30 * t)
    color = `rgb(${r},${g},${b})`
  } else {
    color = '#e53935'
  }

  const pct = Math.round(pf * 100)

  return (
    <div
      className="fixed left-1/2 pointer-events-none"
      style={{
        zIndex: 70,
        transform: 'translateX(-50%)',
        top: slingshotY + 24,
        width: POWER_BAR_WIDTH,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: POWER_BAR_WIDTH,
          height: POWER_BAR_HEIGHT,
          borderRadius: 4,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.min(100, pf * 100)}%`,
            borderRadius: 4,
            background: color,
          }}
        />
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: 6,
          fontSize: 9,
          fontWeight: 700,
          color: pf > 0.7 ? '#ff5252' : '#ffffff',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {pct}% POWER
      </div>
    </div>
  )
}
