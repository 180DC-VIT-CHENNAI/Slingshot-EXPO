import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { ZOOM_LERP, ZOOM_THRESHOLD, SHAKE_DECAY } from '@/game/config/gameBalance'
import type { GameRefs } from './useGameRefs'

interface Props {
  refs: GameRefs
  width: number
  height: number
}

export default function CameraRig({ refs, width, height }: Props) {
  const camRef = useRef<any>(null)

  useFrame(() => {
    const cam = camRef.current
    if (!cam) return
    const target = refs.cameraTargetZoom.current
    if (Math.abs(cam.zoom - target) > ZOOM_THRESHOLD) {
      cam.zoom = cam.zoom + (target - cam.zoom) * ZOOM_LERP
    }
    const shake = refs.shakeIntensity.current
    if (shake > 0.001) {
      cam.position.x = (Math.random() - 0.5) * shake * 30
      cam.position.y = (Math.random() - 0.5) * shake * 30
      refs.shakeIntensity.current = shake * SHAKE_DECAY
    } else {
      cam.position.x = 0
      cam.position.y = 0
    }
    cam.updateProjectionMatrix()
  })

  return (
    <OrthographicCamera
      ref={camRef}
      makeDefault
      left={0}
      right={width}
      top={height}
      bottom={0}
      near={-1000}
      far={1000}
      position={[0, 0, 100]}
      zoom={1}
    />
  )
}
