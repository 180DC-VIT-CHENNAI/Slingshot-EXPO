import { COLORS } from '@/game/config/theme'
import { useNoiseTexture } from './useNoiseTexture'

interface Props {
  width: number
  height: number
}

export default function Ground({ width, height }: Props) {
  const normalMap = useNoiseTexture()

  return (
    <group>
      <mesh position={[width / 2, height * 0.19, -20]} receiveShadow>
        <planeGeometry args={[width * 1.2, height * 0.38]} />
        <meshStandardMaterial
          color={COLORS.GROUND}
          normalMap={normalMap}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      {/* highlight strip at horizon */}
      <mesh position={[width / 2, height * 0.38, -19]}>
        <planeGeometry args={[width * 1.2, 4]} />
        <meshBasicMaterial color={COLORS.GROUND_HIGHLIGHT} />
      </mesh>
    </group>
  )
}
