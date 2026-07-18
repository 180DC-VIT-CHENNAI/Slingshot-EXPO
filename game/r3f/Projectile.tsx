import type { Mesh } from 'three'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'

interface Props {
  rbRef: React.RefObject<RapierRigidBody | null>
  meshRef: React.RefObject<Mesh | null>
  startX: number
  startY: number
}

export default function Projectile({ rbRef, meshRef, startX, startY }: Props) {
  return (
    <RigidBody
      ref={rbRef as React.RefObject<RapierRigidBody>}
      name="projectile"
      type="kinematicPosition"
      position={[startX, startY, 0]}
      colliders="ball"
      restitution={0.3}
      linearDamping={0}
      angularDamping={0}
      canSleep={false}
    >
      <mesh ref={meshRef}>
        <torusGeometry args={[22, 7, 16, 36]} />
        <meshStandardMaterial
          color="#7cfc00"
          emissive="#2e7d32"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
    </RigidBody>
  )
}
