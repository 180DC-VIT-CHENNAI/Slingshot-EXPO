import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '@/game/config/theme'

interface Props {
  width: number
  height: number
}

const skyTop = new THREE.Color(COLORS.SKY_TOP.r / 255, COLORS.SKY_TOP.g / 255, COLORS.SKY_TOP.b / 255)
const skyBottom = new THREE.Color(COLORS.SKY_BOTTOM.r / 255, COLORS.SKY_BOTTOM.g / 255, COLORS.SKY_BOTTOM.b / 255)

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  varying vec2 vUv;
  void main() {
    float wave = sin(vUv.y * 8.0 + uTime * 0.15) * 0.015
               + sin(vUv.x * 12.0 + uTime * 0.1) * 0.01;
    float t = smoothstep(0.0, 0.7, vUv.y + wave);
    vec3 color = mix(uSkyTop, uSkyBottom, t);
    gl_FragColor = vec4(color, 1.0);
  }
`

export default function Sky({ width, height }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (matRef.current) {
      const u = matRef.current.uniforms
      u.uTime.value = clock.elapsedTime
    }
  })

  return (
    <mesh position={[width / 2, height / 2, -200]}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uSkyTop: { value: skyTop },
          uSkyBottom: { value: skyBottom },
        }}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  )
}
