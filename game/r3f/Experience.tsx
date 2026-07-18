import { useEffect } from 'react'
import { Physics } from '@react-three/rapier'
import { useGameRefs } from './useGameRefs'
import { useGameInput } from './useGameInput'
import { useFlightLoop } from './useFlightLoop'
import { useGameStore } from './store'
import RendererConfig from './RendererConfig'
import CameraRig from './CameraRig'
import PostProcessing from './PostProcessing'
import Slingshot from './Slingshot'
import Projectile from './Projectile'
import LogoStructure from './LogoStructure'
import Obstacles from './Obstacles'
import Environment from './Environment'
import Effects from './Effects'
import {
  COUNTDOWN_STEPS,
  COUNTDOWN_START_DELAY,
  COUNTDOWN_TWEEN_DURATION,
  COUNTDOWN_STEP_DELAY,
  getGravity,
} from '@/game/config/gameBalance'
import { LEVEL_180DC_EXPO } from '@/game/config/levelData'
import type { PlayfieldLayout } from '@/game/config/layout'

interface Props {
  layout: PlayfieldLayout
  onResult: (hit: boolean) => void
}

const STEP_DURATION = COUNTDOWN_TWEEN_DURATION * 2 + COUNTDOWN_STEP_DELAY
const ZERO_REST_Y_OFFSET = 78
const FRAME_RATE = 60

export default function Experience({ layout, onResult }: Props) {
  const refs = useGameRefs()

  useGameInput(refs, layout)
  useFlightLoop(refs, layout, onResult)

  const gravityY = -getGravity(layout.width, layout.height) * FRAME_RATE * FRAME_RATE
  const zeroStartX = layout.slingshotX
  const zeroStartY = layout.slingshotY + ZERO_REST_Y_OFFSET

  const handleImpact = (intensity: number) => {
    refs.shakeIntensity.current = Math.max(refs.shakeIntensity.current, intensity)
  }

  useEffect(() => {
    const store = useGameStore.getState()
    store.reset()
    refs.sensorHit.current = false
    refs.shakeIntensity.current = 0
    refs.snapTarget.current = { x: 0, y: 0, active: false }
    refs.spotlightBoost.current = 0
    let stepIndex = 0
    let timer: ReturnType<typeof setTimeout>
    const showNext = () => {
      if (stepIndex >= COUNTDOWN_STEPS.length) {
        store.setCountdownStep(null)
        store.setCanDrag(true)
        return
      }
      store.setCountdownStep(COUNTDOWN_STEPS[stepIndex])
      stepIndex++
      timer = setTimeout(showNext, STEP_DURATION)
    }
    timer = setTimeout(showNext, COUNTDOWN_START_DELAY)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <RendererConfig />
      <CameraRig refs={refs} width={layout.width} height={layout.height} />
      <Environment layout={layout} spotlightBoostRef={refs.spotlightBoost} />
      <Slingshot x={layout.slingshotX} y={layout.slingshotY} />
      <Physics gravity={[0, gravityY, 0]} timeStep={1 / FRAME_RATE}>
        <LogoStructure
          x={layout.slotX}
          y={layout.slotY}
          sensorHitRef={refs.sensorHit}
        />
        <Obstacles
          level={LEVEL_180DC_EXPO}
          width={layout.width}
          height={layout.height}
          onImpact={handleImpact}
        />
        <Projectile
          rbRef={refs.rigidBody}
          meshRef={refs.projectile}
          startX={zeroStartX}
          startY={zeroStartY}
        />
      </Physics>
      <Effects layout={layout} />
      <PostProcessing />
    </>
  )
}
