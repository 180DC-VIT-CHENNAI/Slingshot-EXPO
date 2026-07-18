import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { IntersectionEnterPayload } from '@react-three/rapier'
import { COLORS } from '@/game/config/theme'

interface Props {
  x: number
  y: number
  sensorHitRef: React.RefObject<boolean>
}

export default function LogoStructure({ x, y, sensorHitRef }: Props) {
  const handleSlotEnter = (payload: IntersectionEnterPayload) => {
    const name = payload.other.rigidBodyObject?.name
    if (name === 'projectile') {
      sensorHitRef.current = true
    }
  }

  return (
    <group position={[x, y, 0]}>
      {/* Sensor slot */}
      <RigidBody type="fixed" name="slot" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[30, 30, 30]} sensor onIntersectionEnter={handleSlotEnter} />
      </RigidBody>

      {/* Visual: outer glow */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[340, 150]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>
      {/* White platform */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[300, 112, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Green inset */}
      <mesh position={[0, 0, 6.5]}>
        <boxGeometry args={[284, 100, 2]} />
        <meshStandardMaterial color={COLORS.GREEN} roughness={0.5} />
      </mesh>
      {/* Slot (where zero lands) */}
      <mesh position={[0, 0, 8]}>
        <boxGeometry args={[56, 56, 4]} />
        <meshStandardMaterial
          color={COLORS.GREEN_DARK}
          emissive="#7cfc00"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Slot glow ring */}
      <mesh position={[0, 0, 9]}>
        <ringGeometry args={[28, 34, 32]} />
        <meshBasicMaterial color={COLORS.GREEN_NEON} transparent opacity={0.4} side={2} />
      </mesh>
    </group>
  )
}
