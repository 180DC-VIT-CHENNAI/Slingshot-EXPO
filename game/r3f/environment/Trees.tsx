import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '@/game/config/theme'

interface Props {
  width: number
  height: number
}

const TRUNK_H = 28
const FOLIAGE_H = 34
const SHADOW_CASTERS = 8

interface TreeSpec {
  x: number
  y: number
  scale: number
  rotation: number
  phase: number
  castShadow: boolean
  foliageColor: number
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function Trees({ width, height }: Props) {
  const groupRefs = useRef<THREE.Group[]>([])

  const { trees, trunkGeo, foliageGeo, trunkMat, foliageMats } = useMemo(() => {
    const rand = mulberry32(137)
    const specs: TreeSpec[] = []
    for (let i = 0; i < 25; i++) {
      const x = rand()
      specs.push({
        x: 0.02 + x * 0.96,
        y: 0.55 - rand() * 0.13,
        scale: 0.6 + rand() * 0.7,
        rotation: (rand() - 0.5) * 0.15,
        phase: rand() * Math.PI * 2,
        castShadow: false,
        foliageColor: rand() > 0.5 ? COLORS.GREEN : COLORS.GREEN_LIGHT,
      })
    }
    const sorted = [...specs].sort((a, b) => Math.abs(a.x - 0.5) - Math.abs(b.x - 0.5))
    for (let i = 0; i < SHADOW_CASTERS; i++) sorted[i].castShadow = true

    return {
      trees: specs,
      trunkGeo: new THREE.CylinderGeometry(2, 2.5, TRUNK_H, 6),
      foliageGeo: new THREE.ConeGeometry(18, FOLIAGE_H, 6),
      trunkMat: new THREE.MeshStandardMaterial({ color: COLORS.TREE_TRUNK, roughness: 0.9, flatShading: true }),
      foliageMats: [
        new THREE.MeshStandardMaterial({ color: COLORS.GREEN, roughness: 0.85, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: COLORS.GREEN_LIGHT, roughness: 0.85, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: COLORS.GREEN_DARK, roughness: 0.85, flatShading: true }),
      ],
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRefs.current.forEach((group, i) => {
      if (!group) return
      const tree = trees[i]
      group.rotation.z = tree.rotation + Math.sin(t * 0.8 + tree.phase) * 0.015 * tree.scale
    })
  })

  return (
    <group>
      {trees.map((tree, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) groupRefs.current[i] = el
          }}
          position={[tree.x * width, tree.y * height, -30]}
          scale={[tree.scale, tree.scale, tree.scale]}
        >
          <mesh
            geometry={trunkGeo}
            material={trunkMat}
            position={[0, -TRUNK_H / 2, 0]}
            castShadow={tree.castShadow}
          />
          <mesh
            geometry={foliageGeo}
            material={foliageMats[tree.foliageColor === COLORS.GREEN ? 0 : tree.foliageColor === COLORS.GREEN_LIGHT ? 1 : 2]}
            position={[0, -TRUNK_H - FOLIAGE_H / 2, 0]}
            rotation={[Math.PI, 0, 0]}
            castShadow={tree.castShadow}
          />
        </group>
      ))}
    </group>
  )
}
