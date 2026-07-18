export const GRAVITY = {
  MOBILE: 0.26,
  DESKTOP: 0.18,
} as const

export const POWER_FACTOR = {
  MOBILE: 0.28,
  DESKTOP: 0.22,
} as const

export const HIT_ZONE = {
  MOBILE: 90,
  DESKTOP: 70,
} as const

export const MAX_PULL = 130
export const TOUCH_RADIUS = 80
export const MOBILE_BREAKPOINT = 600

export function isMobile(width: number, height: number): boolean {
  return Math.min(width, height) < MOBILE_BREAKPOINT
}

export function getGravity(width: number, height: number): number {
  return isMobile(width, height) ? GRAVITY.MOBILE : GRAVITY.DESKTOP
}

export function getHitZone(width: number, height: number): number {
  return isMobile(width, height) ? HIT_ZONE.MOBILE : HIT_ZONE.DESKTOP
}

export function getPowerFactor(width: number, height: number): number {
  return isMobile(width, height) ? POWER_FACTOR.MOBILE : POWER_FACTOR.DESKTOP
}

export const MAGNET_RADIUS = 140
export const MAGNET_STRENGTH = 0.05
export const ROTATION_FACTOR = 0.04
export const OOB_MARGIN = 60

export const ZOOM_PER_PULL = 0.05
export const ZOOM_LERP = 0.1
export const ZOOM_THRESHOLD = 0.001

export const STRETCH_X = 0.18
export const STRETCH_Y = 0.15

export const TRAJECTORY_STEPS = 40
export const TRAJECTORY_STEP_TIME = 6
export const TRAJECTORY_ALPHA_START = 0.45
export const TRAJECTORY_ALPHA_DECAY = 0.012
export const TRAJECTORY_DOT_RADIUS = 3
export const TRAJECTORY_DOT_COLOR = 0xff5252

export const TRAIL_MAX = 25
export const TRAIL_DOT_RADIUS = 4
export const TRAIL_DOT_COLOR = 0x7cfc00
export const TRAIL_DOT_ALPHA = 0.7
export const TRAIL_ALPHA_FACTOR = 0.6
export const TRAIL_SCALE_FACTOR = 0.9
export const TRAIL_SCALE_BASE = 0.1

export const LAUNCH_SQUASH_DURATION = 60
export const LAUNCH_SQUASH_SCALE_X = 0.8
export const LAUNCH_SQUASH_SCALE_Y = 1.25
export const LAUNCH_RESET_DURATION = 250
export const LAUNCH_RESET_DELAY = 60

export const POWER_BAR_WIDTH = 110
export const POWER_BAR_HEIGHT = 8
export const POWER_BAR_OFFSET_Y = 24
export const POWER_BAR_TEXT_OFFSET_Y = 10
export const POWER_BAR_THRESHOLD_LOW = 0.33
export const POWER_BAR_THRESHOLD_MID = 0.66

export const HIT_FLASH_DURATION = 400
export const HIT_SHAKE_DURATION = 300
export const HIT_SHAKE_INTENSITY = 0.015
export const HIT_TWEEN_DURATION = 250
export const SLOT_GLOW_TWEEN_DURATION = 500
export const SLOT_GLOW_ALPHA = 2.5
export const SLOT_GLOW_SCALE = 2.5
export const HIT_PARTICLE_COUNT = 25
export const HIT_PARTICLE_SPEED_MIN = 3
export const HIT_PARTICLE_SPEED_RANGE = 8
export const HIT_PARTICLE_DISTANCE_MULT = 18
export const HIT_PARTICLE_RADIUS_MIN = 2
export const HIT_PARTICLE_RADIUS_RANGE = 4
export const HIT_PARTICLE_DURATION_MIN = 350
export const HIT_PARTICLE_DURATION_RANGE = 250
export const CONFETTI_DELAY = 200
export const CONFETTI_COUNT = 40
export const CONFETTI_SIZE_MIN = 5
export const CONFETTI_SIZE_RANGE = 6
export const CONFETTI_SPREAD = 300
export const CONFETTI_DURATION_MIN = 1200
export const CONFETTI_DURATION_RANGE = 700

export const MISS_SHAKE_DURATION = 400
export const MISS_SHAKE_INTENSITY = 0.02
export const MISS_OVERLAY_ALPHA_STEP1 = 0.6
export const MISS_OVERLAY_FADE_DURATION = 600
export const MISS_OVERLAY_FADE2_DURATION = 400
export const MISS_OVERLAY2_DELAY = 1100
export const MISS_OVERLAY2_FADE_DURATION = 500
export const MISS_RING_TWEEN_DURATION = 800
export const MISS_DOTS_COUNT = 16
export const MISS_DOT_RING_RADIUS_FACTOR = 0.45
export const MISS_DOT_DURATION_MIN = 900
export const MISS_DOT_DURATION_STEP = 40

export const RESET_DELAY = 2200

export const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'] as const
export const COUNTDOWN_START_DELAY = 300
export const COUNTDOWN_TWEEN_DURATION = 200
export const COUNTDOWN_STEP_DELAY = 120
export const COUNTDOWN_GO_COLOR = '#7CFC00'

export const DEBUG_TOGGLE_KEY = 'D'

export const BREAK_SPEED = 250
export const AT_REST_VELOCITY = 15
export const AT_REST_DURATION = 1500
export const BLOCK_DENSITY = 0.5
export const BLOCK_FRICTION = 0.6
export const BLOCK_RESTITUTION = 0.2

export const SHAKE_DECAY = 0.9
export const SHAKE_BLOCK = 0.3
export const SHAKE_HIT = 0.8
export const SNAP_LERP = 0.15
export const SLOWMO_SCALE = 0.3
export const SLOWMO_DURATION = 500
export const BLOOM_BOOST = 2.0
export const BLOOM_DECAY_MS = 1000
export const CONFETTI_LIFETIME = 1.5
