import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useGameStore } from './store'
import {
  MAX_PULL,
  TOUCH_RADIUS,
  ZOOM_PER_PULL,
  getPowerFactor,
} from '@/game/config/gameBalance'
import type { GameRefs } from './useGameRefs'
import type { PlayfieldLayout } from '@/game/config/layout'

const ZERO_REST_Y_OFFSET = -78
const FRAME_RATE = 60

export function useGameInput(refs: GameRefs, layout: PlayfieldLayout) {
  const gl = useThree((s) => s.gl)

  const zeroStartX = layout.slingshotX
  const zeroStartY = layout.slingshotY + ZERO_REST_Y_OFFSET

  useEffect(() => {
    refs.position.current.x = zeroStartX
    refs.position.current.y = zeroStartY
    refs.velocity.current.vx = 0
    refs.velocity.current.vy = 0
    refs.dragOffset.current.dx = 0
    refs.dragOffset.current.dy = 0
    refs.zeroRotation.current = 0
    refs.pullFactor.current = 0
    refs.isDragging.current = false
    refs.hasLaunched.current = false
    refs.hasScored.current = false
    refs.cameraTargetZoom.current = 1
    refs.sensorHit.current = false
    const rb = refs.rigidBody.current
    if (rb) {
      rb.setNextKinematicTranslation({ x: zeroStartX, y: zeroStartY, z: 0 })
    }
    const store = useGameStore.getState()
    store.setPullFactor(0)
    store.setFlightPhase('aim')
  }, [zeroStartX, zeroStartY, refs])

  useEffect(() => {
    const canvas = gl.domElement as HTMLCanvasElement

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { px: e.clientX - rect.left, py: rect.height - (e.clientY - rect.top) }
    }

    const onDown = (e: PointerEvent) => {
      if (!useGameStore.getState().canDrag || refs.hasLaunched.current) return
      const { px, py } = toLocal(e)
      const dx = px - refs.position.current.x
      const dy = py - refs.position.current.y
      if (Math.sqrt(dx * dx + dy * dy) < TOUCH_RADIUS) {
        refs.isDragging.current = true
        try {
          canvas.setPointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!refs.isDragging.current || refs.hasLaunched.current) return
      const { px, py } = toLocal(e)
      let dx = px - zeroStartX
      let dy = py - zeroStartY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > MAX_PULL) {
        dx = (dx / dist) * MAX_PULL
        dy = (dy / dist) * MAX_PULL
      }
      const newX = zeroStartX + dx
      const newY = zeroStartY + dy
      refs.position.current.x = newX
      refs.position.current.y = newY
      refs.dragOffset.current.dx = dx
      refs.dragOffset.current.dy = dy
      const rb = refs.rigidBody.current
      if (rb) {
        rb.setNextKinematicTranslation({ x: newX, y: newY, z: 0 })
      }
      const pf = dist / MAX_PULL
      refs.pullFactor.current = pf
      refs.cameraTargetZoom.current = 1 + pf * ZOOM_PER_PULL

      const store = useGameStore.getState()
      if (Math.abs(pf - store.pullFactor) > 0.02) {
        store.setPullFactor(pf)
      }
    }

    const onUp = (e: PointerEvent) => {
      if (!refs.isDragging.current || refs.hasLaunched.current) return
      refs.isDragging.current = false
      refs.hasLaunched.current = true
      refs.cameraTargetZoom.current = 1

      const dx = refs.position.current.x - zeroStartX
      const dy = refs.position.current.y - zeroStartY
      const power = getPowerFactor(layout.width, layout.height)
      const impX = -dx * power * FRAME_RATE
      const impY = -dy * power * FRAME_RATE

      const rb = refs.rigidBody.current
      if (rb) {
        rb.setBodyType(0, true)
        rb.applyImpulse({ x: impX, y: impY, z: 0 }, true)
        refs.velocity.current.vx = -dx * power
        refs.velocity.current.vy = -dy * power
      }

      refs.dragOffset.current.dx = 0
      refs.dragOffset.current.dy = 0
      refs.pullFactor.current = 0

      const store = useGameStore.getState()
      store.setPullFactor(0)
      store.setCanDrag(false)
      store.setFlightPhase('flying')

      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId)
        }
      } catch {
        /* ignore */
      }
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [gl, zeroStartX, zeroStartY, layout, refs])
}
