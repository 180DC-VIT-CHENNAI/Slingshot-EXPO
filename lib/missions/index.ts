import { type MissionConfig } from './core'
import { mission1Config } from './mission1'
import { mission2Config } from './mission2'
import { mission3Config } from './mission3'
import { mission4Config } from './mission4'
import { mission5Config } from './mission5'
import { mission6Config } from './mission6'

export const MISSION_CONFIGS: Record<number, MissionConfig> = {
  1: mission1Config,
  2: mission2Config,
  3: mission3Config,
  4: mission4Config,
  5: mission5Config,
  6: mission6Config,
}

export function getMissionConfig(id: number): MissionConfig {
  return MISSION_CONFIGS[id] ?? MISSION_CONFIGS[1]
}

export { createMissionScene } from './core'
export type { MissionConfig, MissionUpdate } from './core'
