import { COLORS } from '@/game/config/theme'

interface Props {
  width: number
  height: number
}

interface HillSpec {
  x: number
  y: number
  sx: number
  sy: number
}

interface LayerSpec {
  z: number
  color: number
  lit: boolean
  hills: HillSpec[]
}

const LAYERS: LayerSpec[] = [
  {
    z: -120,
    color: COLORS.DISTANT_HILLS_DARK,
    lit: false,
    hills: [
      { x: 0.2, y: 0.45, sx: 0.5, sy: 0.12 },
      { x: 0.8, y: 0.48, sx: 0.55, sy: 0.14 },
    ],
  },
  {
    z: -100,
    color: COLORS.DISTANT_HILLS_LIGHT,
    lit: false,
    hills: [
      { x: 0.55, y: 0.44, sx: 0.45, sy: 0.1 },
      { x: 0.1, y: 0.46, sx: 0.4, sy: 0.11 },
    ],
  },
  {
    z: -80,
    color: COLORS.MID_HILLS_DARK,
    lit: true,
    hills: [
      { x: 0.82, y: 0.44, sx: 0.48, sy: 0.17 },
      { x: 0.3, y: 0.42, sx: 0.42, sy: 0.14 },
    ],
  },
  {
    z: -60,
    color: COLORS.MID_HILLS_LIGHT,
    lit: true,
    hills: [
      { x: 0.5, y: 0.4, sx: 0.55, sy: 0.13 },
      { x: 0.15, y: 0.43, sx: 0.38, sy: 0.12 },
    ],
  },
  {
    z: -40,
    color: COLORS.GROUND,
    lit: true,
    hills: [
      { x: 0.7, y: 0.39, sx: 0.4, sy: 0.1 },
      { x: 0.25, y: 0.4, sx: 0.35, sy: 0.08 },
    ],
  },
]

export default function Hills({ width, height }: Props) {
  return (
    <group>
      {LAYERS.map((layer, li) =>
        layer.hills.map((h, hi) => (
          <mesh
            key={`${li}-${hi}`}
            position={[h.x * width, h.y * height, layer.z]}
            scale={[h.sx * width, h.sy * height, 20]}
          >
            <sphereGeometry args={[1, 12, 8]} />
            {layer.lit ? (
              <meshStandardMaterial color={layer.color} roughness={1} flatShading />
            ) : (
              <meshBasicMaterial color={layer.color} />
            )}
          </mesh>
        )),
      )}
    </group>
  )
}
