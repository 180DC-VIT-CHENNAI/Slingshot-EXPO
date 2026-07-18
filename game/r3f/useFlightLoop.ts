import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  MAGNET_RADIUS,
  MAGNET_STRENGTH,
  STRETCH_X,
  STRETCH_Y,
  RESET_DELAY,
  MISS_OVERLAY2_DELAY,
  MISS_OVERLAY2_FADE_DURATION,
  AT_REST_VELOCITY,
  AT_REST_DURATION,
  OOB_MARGIN,
  SHAKE_HIT,
  SNAP_LERP,
  SLOWMO_SCALE,
  SLOWMO_DURATION,
  BLOOM_BOOST,
  BLOOM_DECAY_MS,
} from '@/game/config/gameBalance'
import { useGameStore } from './store'
import type { GameRefs } from './useGameRefs'
import type { PlayfieldLayout } from '@/game/config/layout'

const MISS_RESULT_DELAY =
  MISS_OVERLAY2_DELAY + MISS_OVERLAY2_FADE_DURATION + RESET_DELAY

export function useFlightLoop(
  refs: GameRefs,
  layout: PlayfieldLayout,
  onResult: (hit: boolean) => void,
) {
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slowmoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bloomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerHit = (rb: any) => {
    refs.hasScored.current = true
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    rb.setBodyType(2, true) // kinematicPosition
    refs.snapTarget.current = { x: layout.slotX, y: layout.slotY, active: true }
    refs.shakeIntensity.current = SHAKE_HIT
    refs.spotlightBoost.current = 1.5
    const store = useGameStore.getState()
    store.setFlightPhase('hit')
    store.setPhysicsTimeScale(SLOWMO_SCALE)
    store.setBloomIntensity(BLOOM_BOOST)
    slowmoTimerRef.current = setTimeout(() => store.setPhysicsTimeScale(1), SLOWMO_DURATION)
    bloomTimerRef.current = setTimeout(
      () => store.setBloomIntensity(useGameStore.getState().bloomIntensity),
      BLOOM_DECAY_MS,
    )
    resultTimerRef.current = setTimeout(() => onResult(true), RESET_DELAY)
  }

  const triggerMiss = (rb: any) => {
    refs.hasScored.current = true
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    useGameStore.getState().setFlightPhase('miss')
    resultTimerRef.current = setTimeout(() => onResult(false), MISS_RESULT_DELAY)
  }

  useEffect(() => {
    return () => {
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
      if (restTimerRef.current) clearTimeout(restTimerRef.current)
      if (slowmoTimerRef.current) clearTimeout(slowmoTimerRef.current)
      if (bloomTimerRef.current) clearTimeout(bloomTimerRef.current)
    }
  }, [])

  useFrame(() => {
    const rb = refs.rigidBody.current
    if (!rb) return

    const t = rb.translation()
    const v = rb.linvel()
    refs.position.current.x = t.x
    refs.position.current.y = t.y
    refs.velocity.current.vx = v.x
    refs.velocity.current.vy = v.y

    // Snap animation
    const snap = refs.snapTarget.current
    if (snap.active) {
      const newX = t.x + (snap.x - t.x) * SNAP_LERP
      const newY = t.y + (snap.y - t.y) * SNAP_LERP
      rb.setNextKinematicTranslation({ x: newX, y: newY, z: 0 })
      if (Math.abs(newX - snap.x) < 1 && Math.abs(newY - snap.y) < 1) {
        rb.setNextKinematicTranslation({ x: snap.x, y: snap.y, z: 0 })
        snap.active = false
      }
    }

    // Decay spotlight boost
    if (refs.spotlightBoost.current > 0.001) {
      refs.spotlightBoost.current *= 0.95
    }

    const mesh = refs.projectile.current
    if (mesh) {
      if (refs.isDragging.current && !refs.hasLaunched.current) {
        const pf = refs.pullFactor.current
        mesh.scale.set(1 - pf * STRETCH_X, 1 + pf * STRETCH_Y, 1)
      } else if (!refs.hasScored.current) {
        mesh.scale.set(1, 1, 1)
      }
    }

    if (refs.hasLaunched.current && !refs.hasScored.current) {
      const pos = refs.position.current
      const vel = refs.velocity.current
      const slotX = layout.slotX
      const slotY = layout.slotY

      // Magnet
      const dx = pos.x - slotX
      const dy = pos.y - slotY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MAGNET_RADIUS && vel.vy < 0) {
        const pull = Math.max(0, 1 - dist / MAGNET_RADIUS) * MAGNET_STRENGTH
        rb.applyImpulse({ x: -dx * pull, y: -dy * pull, z: 0 }, true)
      }

      // Sensor hit
      if (refs.sensorHit.current) {
        triggerHit(rb)
        return
      }

      // OOB miss
      if (
        pos.y < -OOB_MARGIN ||
        pos.x < -OOB_MARGIN ||
        pos.x > layout.width + OOB_MARGIN
      ) {
        triggerMiss(rb)
        return
      }

      // At-rest miss
      const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy)
      if (speed < AT_REST_VELOCITY) {
        if (!restTimerRef.current) {
          restTimerRef.current = setTimeout(() => {
            if (!refs.hasScored.current) triggerMiss(rb)
          }, AT_REST_DURATION)
        }
      } else {
        if (restTimerRef.current) {
          clearTimeout(restTimerRef.current)
          restTimerRef.current = null
        }
      }
    }
  })
}
