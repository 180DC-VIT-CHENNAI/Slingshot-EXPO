import * as Phaser from 'phaser'
import { type MissionConfig } from './core'

let projectileRef: Phaser.GameObjects.Container | null = null
let prevY = Infinity

export const mission1Config: MissionConfig = {
  sceneKey: 'Mission1',
  gravity: 0.18,
  maxPull: 130,
  power: 0.22,
  hitZone: 70,
  countdownColor: '#2E7D32',
  multiShot: false,
  multiShotOnHit: false,
  totalShots: 1,

  drawEnvironment(scene, w, h) {
    const sky = scene.add.graphics()
    for (let y = 0; y < h * 0.7; y++) {
      const t = y / (h * 0.7)
      const r = Math.floor(10 + (40 - 10) * t)
      const g = Math.floor(22 + (70 - 22) * t)
      const b = Math.floor(40 + (120 - 40) * t)
      sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      sky.fillRect(0, y, w, 1)
    }
    sky.setDepth(-15)

    for (let i = 0; i < 30; i++) {
      const star = scene.add.circle(
        Math.random() * w,
        Math.random() * h * 0.4,
        Math.random() * 1.2 + 0.3,
        0xffffff,
        Math.random() * 0.3 + 0.05,
      ).setDepth(-14)
      scene.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: star.alpha * 0.3 },
        duration: 1500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    const distantHills = scene.add.graphics()
    distantHills.fillStyle(0x1a3a2a, 1)
    distantHills.fillEllipse(w * 0.2, h * 0.55, w * 0.5, h * 0.12)
    distantHills.fillEllipse(w * 0.8, h * 0.52, w * 0.55, h * 0.14)
    distantHills.fillStyle(0x1f4a32, 1)
    distantHills.fillEllipse(w * 0.55, h * 0.56, w * 0.45, h * 0.10)
    distantHills.setDepth(-12)

    const cloudDefs = [
      { x: w * 0.08, y: h * 0.04, s: 1.4, speed: 14 },
      { x: w * 0.45, y: h * 0.07, s: 1.0, speed: 11 },
      { x: w * 0.88, y: h * 0.02, s: 1.2, speed: 13 },
      { x: w * 0.25, y: h * 0.11, s: 0.7, speed: 10 },
      { x: w * 0.72, y: h * 0.09, s: 0.8, speed: 12 },
      { x: w * 0.15, y: h * 0.15, s: 0.5, speed: 9 },
      { x: w * 0.6, y: h * 0.14, s: 0.6, speed: 11 },
    ]
    cloudDefs.forEach((cp) => {
      const c = scene.add.graphics()
      c.fillStyle(0xffffff, 0.08)
      c.fillEllipse(0, 0, 80 * cp.s, 38 * cp.s)
      c.fillEllipse(-32 * cp.s, -5 * cp.s, 55 * cp.s, 32 * cp.s)
      c.fillEllipse(32 * cp.s, -3 * cp.s, 46 * cp.s, 28 * cp.s)
      c.setPosition(cp.x, cp.y)
      c.setDepth(-8)
      scene.tweens.add({ targets: c, x: cp.x + 20, duration: cp.speed * 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    })

    const midHills = scene.add.graphics()
    midHills.fillStyle(0x2d5a3d, 1)
    midHills.fillEllipse(w * 0.12, h * 0.58, w * 0.42, h * 0.15)
    midHills.fillEllipse(w * 0.82, h * 0.56, w * 0.48, h * 0.17)
    midHills.fillStyle(0x3a7a50, 1)
    midHills.fillEllipse(w * 0.5, h * 0.6, w * 0.55, h * 0.13)
    midHills.setDepth(-6)

    const ground = scene.add.graphics()
    ground.fillStyle(0x3a7a50, 1)
    ground.fillRect(0, h * 0.62, w, h * 0.38)
    ground.fillStyle(0x4a9a60, 0.5)
    ground.fillRect(0, h * 0.62, w, 3)
    ground.setDepth(-4)

    for (let i = 0; i < 40; i++) {
      const gx = Math.random() * w
      const gy = h * 0.6 + Math.random() * 12
      const blade = scene.add.graphics()
      const shade = Math.random() > 0.5 ? 0x2E7D32 : 0x4CAF50
      blade.lineStyle(1.5, shade, 0.5)
      blade.beginPath()
      blade.moveTo(gx, gy)
      blade.lineTo(gx + (Math.random() - 0.5) * 3, gy - 8 - Math.random() * 8)
      blade.strokePath()
      blade.setDepth(-1)
      scene.tweens.add({ targets: blade, angle: { from: -2, to: 2 }, duration: 1200 + Math.random() * 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }

    const treeDefs = [
      { x: w * 0.04, y: h * 0.5, s: 1.1 },
      { x: w * 0.96, y: h * 0.48, s: 1.2 },
      { x: w * 0.15, y: h * 0.53, s: 0.7 },
      { x: w * 0.85, y: h * 0.54, s: 0.65 },
    ]
    treeDefs.forEach((tp) => {
      const t = scene.add.graphics()
      t.fillStyle(0x5D4037, 1)
      t.fillRoundedRect(tp.x - 3 * tp.s, tp.y, 6 * tp.s, 28 * tp.s, 2)
      t.fillStyle(0x2E7D32, 1)
      t.fillEllipse(tp.x, tp.y - 5 * tp.s, 38 * tp.s, 34 * tp.s)
      t.fillStyle(0x4CAF50, 1)
      t.fillEllipse(tp.x + 7 * tp.s, tp.y - 10 * tp.s, 24 * tp.s, 20 * tp.s)
      t.setDepth(-3)
    })

    const slotX = w / 2
    const slotY = h * 0.35

    const spot1 = scene.add.graphics().setDepth(-2)
    spot1.fillStyle(0xffffff, 0.03)
    spot1.fillTriangle(slotX - 40, h * 0.5, slotX - 15, slotY - 30, slotX - 65, slotY - 30)
    scene.tweens.add({ targets: spot1, alpha: { from: 0.6, to: 1 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const spot2 = scene.add.graphics().setDepth(-2)
    spot2.fillStyle(0xffffff, 0.03)
    spot2.fillTriangle(slotX + 40, h * 0.5, slotX + 15, slotY - 30, slotX + 65, slotY - 30)
    scene.tweens.add({ targets: spot2, alpha: { from: 0.6, to: 1 }, duration: 2000, delay: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const spotGlow = scene.add.graphics().setDepth(-1)
    spotGlow.fillStyle(0x7CFC00, 0.05)
    spotGlow.fillCircle(slotX, slotY, 80)
    scene.tweens.add({ targets: spotGlow, alpha: { from: 0.3, to: 0.7 }, scaleX: { from: 0.9, to: 1.15 }, scaleY: { from: 0.9, to: 1.15 }, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const isMobile = Math.min(w, h) < 600
    const s = isMobile ? 1.35 : 1

    const outerGlow = scene.add.graphics()
    outerGlow.fillStyle(0xffffff, 0.08)
    outerGlow.fillRoundedRect(slotX - 165 * s, slotY - 72 * s, 330 * s, 144 * s, 28)

    const platform = scene.add.graphics()
    platform.fillStyle(0xffffff, 0.98)
    platform.fillRoundedRect(slotX - 148 * s, slotY - 56 * s, 296 * s, 112 * s, 20)
    platform.lineStyle(5, 0x2E7D32, 1)
    platform.strokeRoundedRect(slotX - 148 * s, slotY - 56 * s, 296 * s, 112 * s, 20)
    platform.fillStyle(0x2E7D32, 1)
    platform.fillRoundedRect(slotX - 142 * s, slotY - 50 * s, 284 * s, 100 * s, 16)

    scene.add.text(slotX - 72 * s, slotY, '18', {
      fontSize: `${Math.round(56 * s)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    scene.add.text(slotX + 72 * s, slotY, 'DC', {
      fontSize: `${Math.round(48 * s)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const slotSize = 28 * s
    const slotBg = scene.add.graphics()
    slotBg.fillStyle(0x1B5E20, 0.7)
    slotBg.fillRoundedRect(slotX - slotSize, slotY - slotSize, slotSize * 2, slotSize * 2, 12 * s)
    slotBg.lineStyle(Math.round(4 * s), 0x7CFC00, 0.6)
    slotBg.strokeRoundedRect(slotX - slotSize, slotY - slotSize, slotSize * 2, slotSize * 2, 12 * s)

    const slotGlowGfx = scene.add.graphics()
    slotGlowGfx.fillStyle(0x7CFC00, 0.12)
    slotGlowGfx.fillCircle(slotX + 2, slotY, 44 * s)
    scene.tweens.add({ targets: slotGlowGfx, alpha: { from: 0.3, to: 1 }, scaleX: { from: 0.9, to: 1.1 }, scaleY: { from: 0.9, to: 1.1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    for (let i = 0; i < 3; i++) {
      const ringRadius = 55 + i * 16
      const ring = scene.add.graphics()
      ring.lineStyle(2, 0x7CFC00, 0.5 - i * 0.08)
      ring.strokeCircle(slotX + 2, slotY, ringRadius)
      ring.setAlpha(0)
      scene.tweens.add({ targets: ring, alpha: { from: 0.7, to: 0 }, scaleX: { from: 1, to: 1.6 + i * 0.2 }, scaleY: { from: 1, to: 1.6 + i * 0.2 }, duration: 1000 + i * 200, repeat: -1, ease: 'Power2', delay: i * 180 })
    }

    const outerRing = scene.add.graphics()
    outerRing.lineStyle(2, 0x7CFC00, 0.35)
    outerRing.strokeCircle(slotX + 2, slotY, 94)
    scene.tweens.add({ targets: outerRing, alpha: { from: 0.2, to: 0.6 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    scene.add.text(slotX + 2, slotY, '?', {
      fontSize: `${Math.round(32 * s)}px`,
      color: '#7CFC00',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.8)

    const arrow = scene.add.graphics()
    arrow.fillStyle(0x7CFC00, 0.4)
    arrow.fillTriangle(slotX + 2, slotY + 36 * s, slotX - 8 * s, slotY + 48 * s, slotX + 12 * s, slotY + 48 * s)
    scene.tweens.add({ targets: arrow, y: slotY + 52 * s, duration: 600, yoyo: true, repeat: -1 })
  },

  createProjectile(scene) {
    const glow = scene.add.graphics()
    glow.fillStyle(0x7CFC00, 0.25)
    glow.fillCircle(0, 0, 46)
    scene.tweens.add({ targets: glow, alpha: { from: 0.4, to: 1 }, scaleX: { from: 0.9, to: 1.15 }, scaleY: { from: 0.9, to: 1.15 }, duration: 700, yoyo: true, repeat: -1 })

    const pulseRing1 = scene.add.graphics()
    pulseRing1.lineStyle(2, 0x7CFC00, 0.4)
    pulseRing1.strokeCircle(0, 0, 38)
    scene.tweens.add({ targets: pulseRing1, alpha: { from: 0.5, to: 0 }, scaleX: { from: 1, to: 1.5 }, scaleY: { from: 1, to: 1.5 }, duration: 1200, repeat: -1 })

    const pulseRing2 = scene.add.graphics()
    pulseRing2.lineStyle(1.5, 0xfacc15, 0.3)
    pulseRing2.strokeCircle(0, 0, 44)
    scene.tweens.add({ targets: pulseRing2, alpha: { from: 0.4, to: 0 }, scaleX: { from: 1, to: 1.4 }, scaleY: { from: 1, to: 1.4 }, duration: 1500, repeat: -1, delay: 300 })

    const outer = scene.add.graphics()
    outer.fillStyle(0x2E7D32, 1)
    outer.fillCircle(0, 0, 30)
    outer.lineStyle(5, 0xfacc15, 1)
    outer.strokeCircle(0, 0, 30)

    const inner = scene.add.graphics()
    inner.fillStyle(0x1B5E20, 1)
    inner.fillCircle(0, 0, 18)
    inner.lineStyle(3, 0x7CFC00, 0.6)
    inner.strokeCircle(0, 0, 18)

    const label = scene.add.text(0, 0, '0', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const shine = scene.add.graphics()
    shine.fillStyle(0xffffff, 0.4)
    shine.fillCircle(-8, -10, 5)

    const sx = scene.cameras.main.width / 2
    const sy = scene.cameras.main.height - 100

    const container = scene.add.container(sx, sy - 78, [
      glow, pulseRing1, pulseRing2, outer, inner, shine, label,
    ])
    container.setDepth(60)

    projectileRef = container
    prevY = sy - 78
    return container
  },

  setupTargets(scene, w, h) {
    return {
      slotX: w / 2,
      slotY: h * 0.35,
      hitDistance: Infinity,
    }
  },

  updateMission(_scene, projectileX, projectileY, targets, _w, _h) {
    const dx = projectileX - targets.slotX
    const dy = projectileY - targets.slotY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const movingDown = projectileY > prevY
    prevY = projectileY

    if (dist < 70 && movingDown) {
      targets.hitDistance = dist
      return { hit: true, hitDistance: dist }
    }
    return { hit: false }
  },

  onHit(scene, targets, _projectileX, _projectileY) {
    if (projectileRef) {
      scene.tweens.add({
        targets: projectileRef,
        x: targets.slotX,
        y: targets.slotY,
        duration: 250,
        ease: 'Back.easeOut',
      })
    }
    return { distance: targets.hitDistance, completed: true }
  },

  onMiss(_scene, _targets) {},

  isComplete(_targets) {
    return true
  },

  getScore(targets) {
    const dist = targets.hitDistance === Infinity ? 70 : targets.hitDistance
    return Math.max(0, Math.round((1 - dist / 70) * 100))
  },
}
