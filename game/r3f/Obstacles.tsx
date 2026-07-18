import { useRef, useState } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { CollisionEnterPayload, RapierRigidBody } from '@react-three/rapier'
import { COLORS } from '@/game/config/theme'
import {
  BLOCK_DENSITY,
  BLOCK_FRICTION,
  BLOCK_RESTITUTION,
  BREAK_SPEED,
  SHAKE_BLOCK,
} from '@/game/config/gameBalance'
import type { LevelConfig, ObstacleSpec } from '@/game/config/levelData'
import DebrisBurst from './Debris'

interface Props {
  level: LevelConfig
  width: number
  height: number
  onImpact: (intensity: number) => void
}

function ObstacleBlock({
  spec,
  worldX,
  worldY,
  onImpact,
}: {
  spec: ObstacleSpec
  worldX: number
  worldY: number
  onImpact: (intensity: number) => void
}) {
  const rbRef = useRef<RapierRigidBody>(null)
  const [broken, setBroken] = useState(false)
  const [showDebris, setShowDebris] = useState(false)
  const breakPos = useRef<[number, number, number]>([worldX, worldY, 0])

  const handleCollision = (payload: CollisionEnterPayload) => {
    if (broken) return
    const name = payload.other.rigidBodyObject?.name
    if (name !== 'projectile') return
    const otherRb = payload.other.rigidBody
    if (!otherRb) return
    const v = otherRb.linvel()
    const speed = Math.sqrt(v.x * v.x + v.y * v.y)
    if (speed < BREAK_SPEED) return
    const rb = rbRef.current
    if (rb) {
      const t = rb.translation()
      breakPos.current = [t.x, t.y, 0]
    }
    setBroken(true)
    setShowDebris(true)
    onImpact(SHAKE_BLOCK)
  }

  const isWood = spec.material === 'wood'
  const color = isWood ? '#5d4037' : '#616161'

  return (
    <>
      {showDebris && (
        <DebrisBurst
          position={breakPos.current}
          onComplete={() => setShowDebris(false)}
        />
      )}
      {!broken && (
        <RigidBody
          ref={rbRef}
          name="obstacle"
          type="dynamic"
          position={[worldX, worldY, 0]}
          colliders={false}
          density={BLOCK_DENSITY}
          friction={BLOCK_FRICTION}
          restitution={BLOCK_RESTITUTION}
        >
          <CuboidCollider
            args={[spec.w / 2, spec.h / 2, spec.d / 2]}
            onCollisionEnter={handleCollision}
          />
          <mesh castShadow receiveShadow>
            <boxGeometry args={[spec.w, spec.h, spec.d]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
        </RigidBody>
      )}
    </>
  )
}

export default function Obstacles({ level, width, height, onImpact }: Props) {
  const platformY = level.platformY * height
  const centerX = width / 2

  return (
    <group>
      {/* Platform (fixed) */}
      <RigidBody type="fixed" colliders={false} position={[centerX, platformY, 0]}>
        <CuboidCollider args={[width / 2, 10, 20]} />
        <mesh position={[0, 10, 0]} receiveShadow>
          <boxGeometry args={[width, 20, 40]} />
          <meshStandardMaterial color={COLORS.TREE_TRUNK} roughness={0.9} flatShading />
        </mesh>
      </RigidBody>

      {/* Obstacle blocks */}
      {level.obstacles.map((spec, i) => (
        <ObstacleBlock
          key={i}
          spec={spec}
          worldX={centerX + spec.x}
          worldY={platformY + spec.y}
          onImpact={onImpact}
        />
      ))}
    </group>
  )
}
