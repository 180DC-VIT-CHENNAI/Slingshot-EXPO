import { useRef } from 'react'
import type { Mesh } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

export interface SnapTarget {
  x: number
  y: number
  active: boolean
}

export interface GameRefs {
  rigidBody: React.RefObject<RapierRigidBody | null>
  projectile: React.RefObject<Mesh | null>
  position: React.RefObject<{ x: number; y: number }>
  velocity: React.RefObject<{ vx: number; vy: number }>
  dragOffset: React.RefObject<{ dx: number; dy: number }>
  zeroRotation: React.RefObject<number>
  pullFactor: React.RefObject<number>
  isDragging: React.RefObject<boolean>
  hasLaunched: React.RefObject<boolean>
  hasScored: React.RefObject<boolean>
  cameraTargetZoom: React.RefObject<number>
  sensorHit: React.RefObject<boolean>
  shakeIntensity: React.RefObject<number>
  snapTarget: React.RefObject<SnapTarget>
  spotlightBoost: React.RefObject<number>
}

export function useGameRefs(): GameRefs {
  const refs = useRef<GameRefs | null>(null)
  if (refs.current === null) {
    refs.current = {
      rigidBody: { current: null },
      projectile: { current: null },
      position: { current: { x: 0, y: 0 } },
      velocity: { current: { vx: 0, vy: 0 } },
      dragOffset: { current: { dx: 0, dy: 0 } },
      zeroRotation: { current: 0 },
      pullFactor: { current: 0 },
      isDragging: { current: false },
      hasLaunched: { current: false },
      hasScored: { current: false },
      cameraTargetZoom: { current: 1 },
      sensorHit: { current: false },
      shakeIntensity: { current: 0 },
      snapTarget: { current: { x: 0, y: 0, active: false } },
      spotlightBoost: { current: 0 },
    }
  }
  return refs.current
}
