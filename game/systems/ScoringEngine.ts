import { OOB_MARGIN } from '@/game/config/gameBalance'
import { distance } from '@/lib/math'

export type FlightResult = 'flying' | 'hit' | 'miss'

export class ScoringEngine {
  evaluate(
    projectileX: number,
    projectileY: number,
    vy: number,
    slotX: number,
    slotY: number,
    hitZone: number,
    width: number,
    height: number,
  ): FlightResult {
    const distToSlot = distance(projectileX, projectileY, slotX, slotY)

    if (distToSlot < hitZone && vy > 0) return 'hit'

    if (
      projectileY > height + OOB_MARGIN ||
      projectileX < -OOB_MARGIN ||
      projectileX > width + OOB_MARGIN
    ) {
      return 'miss'
    }

    return 'flying'
  }
}
