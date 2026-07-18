import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '@/game/config/theme'
import type { PlayfieldLayout } from '@/game/config/layout'
import Sky from './environment/Sky'
import Stars from './environment/Stars'
import Clouds from './environment/Clouds'
import Hills from './environment/Hills'
import Ground from './environment/Ground'
import Grass from './environment/Grass'
import Trees from './environment/Trees'
import Spotlights from './environment/Spotlights'

interface Props {
  layout: PlayfieldLayout
  spotlightBoostRef: React.RefObject<number>
}

const FOG_NEAR = 110
const FOG_FAR = 260

export default function Environment({ layout, spotlightBoostRef }: Props) {
  const { width, height, slotX, slotY } = layout
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])

  const fogColor = useMemo(() => {
    const c = COLORS.SKY_BOTTOM
    return new THREE.Color(c.r / 255, c.g / 255, c.b / 255)
  }, [])

  useFrame(() => {
    target.position.set(width / 2, height / 2, 0)
    target.updateMatrixWorld()
  })

  return (
    <>
      <fog attach="fog" args={[fogColor, FOG_NEAR, FOG_FAR]} />
      <color attach="background" args={[fogColor]} />

      <ambientLight intensity={0.3} />
      <hemisphereLight args={[new THREE.Color(0x2d5a3d), fogColor, 0.4]} />
      <primitive object={target} />
      <directionalLight
        ref={lightRef}
        target={target}
        position={[width / 2, height * 1.5, 300]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-width}
        shadow-camera-right={width}
        shadow-camera-top={height}
        shadow-camera-bottom={-height}
        shadow-camera-near={1}
        shadow-camera-far={800}
        shadow-bias={-0.0005}
      />

      <Sky width={width} height={height} />
      <Stars width={width} height={height} />
      <Clouds width={width} height={height} />
      <Hills width={width} height={height} />
      <Ground width={width} height={height} />
      <Grass width={width} height={height} />
      <Trees width={width} height={height} />
      <Spotlights slotX={slotX} slotY={slotY} height={height} boostRef={spotlightBoostRef} />
    </>
  )
}
