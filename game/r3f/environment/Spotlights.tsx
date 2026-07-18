import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '@/game/config/theme'

interface Props {
  slotX: number
  slotY: number
  height: number
  boostRef: React.RefObject<number>
}

const vertexShader = `
  uniform float uHeight;
  varying float vHeightParam;
  varying float vEdge;
  void main() {
    vHeightParam = clamp(-position.y / uHeight, 0.0, 1.0);
    vEdge = abs(normal.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vHeightParam;
  varying float vEdge;
  void main() {
    float heightFade = 1.0 - smoothstep(0.0, 0.8, vHeightParam);
    float edgeFade = pow(vEdge, 1.5);
    float alpha = heightFade * edgeFade * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`

const WHITE = new THREE.Color(1, 1, 1)

export default function Spotlights({ slotX, slotY, height, boostRef }: Props) {
  const sourceY = height * 0.5
  const dropDist = sourceY - slotY
  const coneLength = Math.sqrt(40 * 40 + dropDist * dropDist)
  const thetaLeft = Math.atan2(40, dropDist)
  const thetaRight = Math.atan2(-40, dropDist)

  const coneGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(45, coneLength, 16, 1, true)
    geo.translate(0, -coneLength / 2, 0)
    return geo
  }, [coneLength])

  const mats = useMemo(() => {
    const make = () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.15 },
          uHeight: { value: coneLength },
          uColor: { value: WHITE },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        fog: false,
      })
    return { left: make(), right: make() }
  }, [coneLength])

  const leftGroup = useRef<THREE.Group>(null)
  const rightGroup = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const sweep = Math.sin((t * 2 * Math.PI) / 8) * 0.14
    if (leftGroup.current) leftGroup.current.rotation.z = thetaLeft + sweep
    if (rightGroup.current) rightGroup.current.rotation.z = thetaRight + sweep

    const pulseL = 0.8 - 0.2 * Math.cos((t * 2 * Math.PI) / 4)
    const pulseR = 0.8 - 0.2 * Math.cos((t * 2 * Math.PI) / 4 + Math.PI / 4)
    const boost = 1 + (boostRef.current || 0)
    mats.left.uniforms.uTime.value = t
    mats.right.uniforms.uTime.value = t
    mats.left.uniforms.uOpacity.value = pulseL * 0.2 * boost
    mats.right.uniforms.uOpacity.value = pulseR * 0.2 * boost

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      const glowPulse = (0.5 - 0.2 * Math.cos((t * 2 * Math.PI) / 2.5)) * boost
      mat.opacity = glowPulse
      const gs = 1.025 - 0.125 * Math.cos((t * 2 * Math.PI) / 2.5)
      glowRef.current.scale.set(gs, gs, 1)
    }
  })

  useEffect(() => {
    return () => {
      coneGeo.dispose()
      mats.left.dispose()
      mats.right.dispose()
    }
  }, [coneGeo, mats])

  return (
    <group>
      <group ref={leftGroup} position={[slotX - 40, sourceY, -5]}>
        <mesh geometry={coneGeo} material={mats.left} renderOrder={10} />
      </group>
      <group ref={rightGroup} position={[slotX + 40, sourceY, -5]}>
        <mesh geometry={coneGeo} material={mats.right} renderOrder={10} />
      </group>
      <mesh ref={glowRef} position={[slotX, slotY, -4]} renderOrder={11}>
        <circleGeometry args={[80, 32]} />
        <meshBasicMaterial
          color={COLORS.GREEN_NEON}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          fog={false}
          opacity={0.5}
        />
      </mesh>
    </group>
  )
}
