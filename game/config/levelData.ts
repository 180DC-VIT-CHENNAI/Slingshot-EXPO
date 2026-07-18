export interface ObstacleSpec {
  x: number
  y: number
  w: number
  h: number
  d: number
  material: 'wood' | 'stone'
  breakable: boolean
}

export interface LevelConfig {
  name: string
  platformY: number
  obstacles: ObstacleSpec[]
}

export const LEVEL_180DC_EXPO: LevelConfig = {
  name: '180DC Expo',
  platformY: 0.58,
  obstacles: [
    { x: -80, y: 20, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: -40, y: 20, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: 0, y: 20, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: 40, y: 20, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: 80, y: 20, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: -80, y: 62, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: -40, y: 62, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: 0, y: 62, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: 40, y: 62, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
    { x: 80, y: 62, w: 40, h: 40, d: 20, material: 'wood', breakable: true },
  ],
}
