import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '@/game/config/theme'

interface Props {
  position: [number, number, number]
  onComplete: () => void
}

const LIFETIME = 0.8
const GRAVITY = 800
const DUST_LIFETIME = 0.4

const FRAGMENT_COLORS = [COLORS.SLING_DARK, COLORS.SLING_MEDIUM, COLORS.SLING_LIGHT]

export default function DebrisBurst({ position, onComplete }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const dustRef = useRef<THREE.Mesh>(null)
  const [visible, setVisible] = useState(true)
  const startTime = useRef(0)

  const fragments = useMemo(
    () =>
      Array.from({ length: 6 }, () => ({
        vx: (Math.random() - 0.5) * 300,
        vy: -(Math.random() * 200 + 50),
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
        size: 3 + Math.random() * 5,
        color: FRAGMENT_COLORS[Math.floor(Math.random() * FRAGMENT_COLORS.length)],
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (startTime.current === 0) startTime.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - startTime.current
    if (elapsed > LIFETIME) {
      setVisible(false)
      onComplete()
      return
    }
    const group = groupRef.current
    if (group) {
      group.children.forEach((child, i) => {
        const f = fragments[i]
        if (!f) return
        child.position.set(
          f.vx * elapsed,
          f.vy * elapsed + 0.5 * GRAVITY * elapsed * elapsed,
          0,
        )
        child.rotation.z = f.rot + f.rotSpeed * elapsed
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, 1 - elapsed / LIFETIME)
      })
    }
    const dust = dustRef.current
    if (dust) {
      const dustT = Math.min(1, elapsed / DUST_LIFETIME)
      const scale = 1 + dustT * 2.5
      dust.scale.set(scale, scale, scale)
      const mat = dust.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.4 * (1 - dustT))
    }
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={position}>
      {fragments.map((f, i) => (
        <mesh key={i}>
          <boxGeometry args={[f.size, f.size, f.size]} />
          <meshBasicMaterial color={f.color} transparent />
        </mesh>
      ))}
      <mesh ref={dustRef}>
        <sphereGeometry args={[12, 8, 6]} />
        <meshBasicMaterial color="#8d6e63" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}
