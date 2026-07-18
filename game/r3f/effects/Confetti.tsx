import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CONFETTI_COLORS } from '@/game/config/theme'
import { CONFETTI_COUNT, CONFETTI_LIFETIME } from '@/game/config/gameBalance'

const GRAVITY = 400

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rotSpeed: number
  size: number
  color: number
}

export default function Confetti({ centerX, topY, bottomY }: { centerX: number; topY: number; bottomY: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const [visible, setVisible] = useState(true)
  const startTime = useRef(0)

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }, () => ({
        x: centerX + (Math.random() - 0.5) * 300,
        y: topY,
        vx: (Math.random() - 0.5) * 200,
        vy: -(Math.random() * 100 + 50),
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        size: 5 + Math.random() * 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      })),
    [centerX, topY],
  )

  useFrame(({ clock }) => {
    if (startTime.current === 0) startTime.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - startTime.current
    if (elapsed > CONFETTI_LIFETIME) {
      setVisible(false)
      return
    }
    const group = groupRef.current
    if (!group) return
    group.children.forEach((child, i) => {
      const p = pieces[i]
      if (!p) return
      child.position.x = p.x + p.vx * elapsed
      child.position.y = p.y + p.vy * elapsed + 0.5 * GRAVITY * elapsed * elapsed
      child.rotation.z = p.rot + p.rotSpeed * elapsed
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 1 - elapsed / CONFETTI_LIFETIME)
    })
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {pieces.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 50]}>
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial color={p.color} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}
