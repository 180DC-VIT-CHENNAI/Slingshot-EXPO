import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '@/game/config/theme'

interface Props {
  width: number
  height: number
}

const COUNT = 200
const BLADE_HEIGHT = 10
const GROUND_LINE = 0.6

interface Blade {
  x: number
  y: number
  scale: number
  rotation: number
  phase: number
}

function gaussian(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

export default function Grass({ width, height }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.8, BLADE_HEIGHT, 3)
    geo.rotateX(Math.PI)
    geo.translate(0, -BLADE_HEIGHT / 2, 0)
    return geo
  }, [])

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }),
    [],
  )

  const blades = useMemo<Blade[]>(() => {
    const arr: Blade[] = []
    const shades = [COLORS.GREEN, COLORS.GREEN_LIGHT, COLORS.GREEN_DARK]
    for (let i = 0; i < COUNT; i++) {
      const spread = gaussian()
      arr.push({
        x: width / 2 + spread * width * 0.3,
        y: height * GROUND_LINE + Math.random() * 14,
        scale: 0.6 + Math.random() * 1.0,
        rotation: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
      })
      void shades
    }
    return arr
  }, [width, height])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    const shades = [COLORS.GREEN, COLORS.GREEN_LIGHT, COLORS.GREEN_DARK]
    blades.forEach((b, i) => {
      dummy.position.set(b.x, b.y, 0)
      dummy.rotation.z = b.rotation
      dummy.scale.set(1, b.scale, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.setHex(shades[i % shades.length])
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [blades])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < COUNT; i++) {
      const b = blades[i]
      const sway = Math.sin(t * 1.5 + b.phase) * 0.04
      dummy.position.set(b.x, b.y, 0)
      dummy.rotation.z = b.rotation + sway
      dummy.scale.set(1, b.scale, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} position={[0, 0, -15]} />
}
