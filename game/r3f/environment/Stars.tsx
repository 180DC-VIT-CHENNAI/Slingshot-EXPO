import { Sparkles } from '@react-three/drei'

interface Props {
  width: number
  height: number
}

export default function Stars({ width, height }: Props) {
  return (
    <group position={[width / 2, height * 0.2, -180]}>
      <Sparkles
        count={200}
        scale={[width, height * 0.4, 20]}
        size={2}
        speed={0.3}
        opacity={0.6}
        color="#ffffff"
      />
    </group>
  )
}
