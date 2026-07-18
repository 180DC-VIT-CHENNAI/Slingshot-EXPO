import { useMemo } from 'react'
import * as THREE from 'three'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function valueNoise(x: number, y: number, freq: number, rand: () => number, perm: Float32Array) {
  const ix = Math.floor(x * freq)
  const iy = Math.floor(y * freq)
  const fx = x * freq - ix
  const fy = y * freq - iy
  const idx = (a: number, b: number) => perm[((a % freq) + freq) % freq * freq + (((b % freq) + freq) % freq)]

  const v00 = idx(ix, iy)
  const v10 = idx(ix + 1, iy)
  const v01 = idx(ix, iy + 1)
  const v11 = idx(ix + 1, iy + 1)
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  return v00 * (1 - sx) * (1 - sy) + v10 * sx * (1 - sy) + v01 * (1 - sx) * sy + v11 * sx * sy
}

export function useNoiseTexture(size = 512): THREE.CanvasTexture {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const rand = mulberry32(42)
    const freq = 16
    const perm = new Float32Array(freq * freq)
    for (let i = 0; i < perm.length; i++) perm[i] = rand()

    const heights = new Float32Array(size * size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let h = 0
        let amp = 1
        let total = 0
        for (let o = 0; o < 4; o++) {
          h += valueNoise(x / size, y / size, freq * Math.pow(2, o), rand, perm) * amp
          total += amp
          amp *= 0.5
        }
        heights[y * size + x] = h / total
      }
    }

    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    const strength = 2.5
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x
        const xL = heights[y * size + Math.max(0, x - 1)]
        const xR = heights[y * size + Math.min(size - 1, x + 1)]
        const yU = heights[Math.max(0, y - 1) * size + x]
        const yD = heights[Math.min(size - 1, y + 1) * size + x]
        const dx = (xR - xL) * strength
        const dy = (yD - yU) * strength
        const nx = -dx
        const ny = -dy
        const nz = 1
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
        const pi = i * 4
        data[pi] = (nx / len * 0.5 + 0.5) * 255
        data[pi + 1] = (ny / len * 0.5 + 0.5) * 255
        data[pi + 2] = (nz / len * 0.5 + 0.5) * 255
        data[pi + 3] = 255
      }
    }
    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 2)
    return texture
  }, [size])
}
