export interface PlayfieldLayout {
  slingshotX: number
  slingshotY: number
  slotX: number
  slotY: number
  width: number
  height: number
  isMobile: boolean
}

export function createLayout(width: number, height: number): PlayfieldLayout {
  return {
    slingshotX: width / 2,
    slingshotY: 100,
    slotX: width / 2,
    slotY: height - height * 0.12,
    width,
    height,
    isMobile: Math.min(width, height) < 600,
  }
}
