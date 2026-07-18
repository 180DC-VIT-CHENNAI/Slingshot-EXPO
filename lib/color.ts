export function rgbToHex(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b
}
