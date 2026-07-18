import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  width: number
  height: number
}

interface CloudSpec {
  x: number
  y: number
  s: number
  speed: number
  phase: number
}

const CLOUDS: CloudSpec[] = [
  { x: 0.05, y: 0.03, s: 1.4, speed: 14, phase: 0.0 },
  { x: 0.20, y: 0.11, s: 0.7, speed: 10, phase: 1.2 },
  { x: 0.35, y: 0.06, s: 1.0, speed: 11, phase: 2.5 },
  { x: 0.45, y: 0.14, s: 0.6, speed: 11, phase: 0.8 },
  { x: 0.55, y: 0.08, s: 0.9, speed: 13, phase: 3.1 },
  { x: 0.65, y: 0.04, s: 1.1, speed: 14, phase: 1.8 },
  { x: 0.72, y: 0.12, s: 0.8, speed: 12, phase: 0.5 },
  { x: 0.82, y: 0.07, s: 0.7, speed: 10, phase: 2.0 },
  { x: 0.92, y: 0.02, s: 1.2, speed: 13, phase: 0.3 },
  { x: 0.12, y: 0.16, s: 0.5, speed: 9, phase: 2.8 },
  { x: 0.30, y: 0.18, s: 0.6, speed: 9, phase: 1.5 },
  { x: 0.50, y: 0.15, s: 0.45, speed: 8, phase: 0.9 },
  { x: 0.68, y: 0.17, s: 0.55, speed: 10, phase: 2.3 },
  { x: 0.88, y: 0.15, s: 0.5, speed: 11, phase: 1.1 },
  { x: 0.78, y: 0.05, s: 0.9, speed: 12, phase: 3.5 },
]

const PUFFS = [
  { dx: 0, dy: 0, sx: 80, sy: 38 },
  { dx: -32, dy: -5, sx: 55, sy: 32 },
  { dx: 32, dy: -3, sx: 46, sy: 28 },
]

export default function Clouds({ width, height }: Props) {
  const cloudRefs = useRef<THREE.Group[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    cloudRefs.current.forEach((group, i) => {
      if (!group) return
      const c = CLOUDS[i]
      group.position.x = c.x * width + Math.sin(t / c.speed + c.phase) * 20
    })
  })

  return (
    <group>
      {CLOUDS.map((c, ci) => (
        <group
          key={ci}
          ref={(el) => {
            if (el) cloudRefs.current[ci] = el
          }}
          position={[c.x * width, c.y * height, -150]}
        >
          {PUFFS.map((p, pi) => (
            <mesh
              key={pi}
              position={[p.dx * c.s, p.dy * c.s, 0]}
              scale={[p.sx * c.s, p.sy * c.s, 20]}
            >
              <sphereGeometry args={[1, 8, 6]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.08} fog={false} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
