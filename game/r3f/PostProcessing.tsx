import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { graphicsSettings } from '@/game/config/graphics'
import { useGameStore } from './store'

export default function PostProcessing() {
  if (!graphicsSettings.bloom) return null
  const bloomIntensity = useGameStore((s) => s.bloomIntensity)
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={graphicsSettings.bloomThreshold}
        luminanceSmoothing={graphicsSettings.bloomSmoothing}
        radius={graphicsSettings.bloomRadius}
      />
    </EffectComposer>
  )
}
