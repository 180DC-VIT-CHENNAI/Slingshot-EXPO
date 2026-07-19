import * as Phaser from 'phaser'
import type { MissionConfig, MissionUpdate } from './core'

interface Particle {
  x: number; y: number; vx: number; vy: number; gfx: Phaser.GameObjects.Arc
}

interface TrailDot {
  gfx: Phaser.GameObjects.Arc; life: number
}

const BG_COLOR = 0x01245d
const HILL_DARK = 0x0a1f24
const HILL_MID = 0x0d2a2f
const CITY_COLOR = 0x0a1a33
const GREEN = 0x00E676
const GREEN_LIGHT = 0x7CFC00
const GROUND_COLOR = 0x061520

export const mission6Config: MissionConfig = {
  sceneKey: 'Mission6',
  gravity: 0.16,
  maxPull: 140,
  power: 0.21,
  hitZone: 80,
  multiShot: false,
  totalShots: 1,
  countdownColor: '#FFD700',

  drawEnvironment(scene: Phaser.Scene, w: number, h: number) {

    const sky = scene.add.graphics().setDepth(-30)
    for (let y = 0; y < h; y++) {
      const t = y / h
      const r = Math.floor(1 + t * 5)
      const g = Math.floor(36 + t * 20)
      const b = Math.floor(93 + t * 30)
      sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      sky.fillRect(0, y, w, 1)
    }

    const moonX = w * 0.82
    const moonY = h * 0.12
    const moonG = scene.add.graphics().setDepth(-29)
    moonG.fillStyle(0xf0f0e0, 0.9)
    moonG.fillCircle(moonX, moonY, 28)
    moonG.fillStyle(BG_COLOR, 1)
    moonG.fillCircle(moonX + 10, moonY - 4, 24)
    const moonGlow = scene.add.graphics().setDepth(-30)
    moonGlow.fillStyle(0x88bdec, 0.04)
    moonGlow.fillCircle(moonX, moonY, 80)
    scene.tweens.add({
      targets: moonGlow,
      alpha: { from: 0.6, to: 1 },
      scaleX: { from: 0.95, to: 1.08 },
      scaleY: { from: 0.95, to: 1.08 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const starsG = scene.add.graphics().setDepth(-28)
    for (let i = 0; i < 60; i++) {
      const sx = Math.random() * w
      const sy = Math.random() * h * 0.45
      const sr = 0.5 + Math.random() * 1.2
      const sa = 0.2 + Math.random() * 0.5
      starsG.fillStyle(0xffffff, sa)
      starsG.fillCircle(sx, sy, sr)
    }
    for (let i = 0; i < 12; i++) {
      const sx = Math.random() * w
      const sy = Math.random() * h * 0.35
      const star = scene.add.circle(sx, sy, 1, 0xffffff, 0.5).setDepth(-28)
      scene.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.8 },
        duration: 1200 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      })
    }

    const cloudsG = scene.add.graphics().setDepth(-27)
    const cloudData = [
      { x: 0.15, y: 0.18, sw: 0.12, sh: 0.025 },
      { x: 0.45, y: 0.14, sw: 0.15, sh: 0.02 },
      { x: 0.72, y: 0.20, sw: 0.10, sh: 0.018 },
      { x: 0.90, y: 0.16, sw: 0.08, sh: 0.015 },
    ]
    cloudData.forEach((c) => {
      cloudsG.fillStyle(0x1a3a5c, 0.15)
      cloudsG.fillEllipse(w * c.x, h * c.y, w * c.sw, h * c.sh)
      cloudsG.fillStyle(0x1a3a5c, 0.08)
      cloudsG.fillEllipse(w * c.x - 10, h * c.y + 3, w * c.sw * 0.7, h * c.sh * 0.8)
    })

    const bgHill = scene.add.graphics().setDepth(-25)
    bgHill.fillStyle(0x041020, 1)
    bgHill.beginPath()
    bgHill.moveTo(0, h * 0.52)
    bgHill.lineTo(w * 0.08, h * 0.40)
    bgHill.lineTo(w * 0.15, h * 0.33)
    bgHill.lineTo(w * 0.22, h * 0.30)
    bgHill.lineTo(w * 0.30, h * 0.34)
    bgHill.lineTo(w * 0.38, h * 0.38)
    bgHill.lineTo(w * 0.48, h * 0.36)
    bgHill.lineTo(w * 0.55, h * 0.32)
    bgHill.lineTo(w * 0.62, h * 0.35)
    bgHill.lineTo(w * 0.70, h * 0.30)
    bgHill.lineTo(w * 0.78, h * 0.33)
    bgHill.lineTo(w * 0.85, h * 0.37)
    bgHill.lineTo(w * 0.92, h * 0.34)
    bgHill.lineTo(w, h * 0.38)
    bgHill.lineTo(w, h * 0.55)
    bgHill.lineTo(0, h * 0.55)
    bgHill.closePath()
    bgHill.fillPath()

    const hillLeft = scene.add.graphics().setDepth(-22)
    hillLeft.fillStyle(HILL_DARK, 1)
    hillLeft.beginPath()
    hillLeft.moveTo(-10, h * 0.65)
    hillLeft.lineTo(w * 0.03, h * 0.50)
    hillLeft.lineTo(w * 0.08, h * 0.40)
    hillLeft.lineTo(w * 0.14, h * 0.35)
    hillLeft.lineTo(w * 0.19, h * 0.33)
    hillLeft.lineTo(w * 0.24, h * 0.38)
    hillLeft.lineTo(w * 0.28, h * 0.44)
    hillLeft.lineTo(w * 0.32, h * 0.52)
    hillLeft.lineTo(w * 0.35, h * 0.65)
    hillLeft.lineTo(-10, h * 0.65)
    hillLeft.closePath()
    hillLeft.fillPath()

    const hillMid = scene.add.graphics().setDepth(-21)
    hillMid.fillStyle(HILL_MID, 1)
    hillMid.beginPath()
    hillMid.moveTo(w * 0.28, h * 0.65)
    hillMid.lineTo(w * 0.32, h * 0.55)
    hillMid.lineTo(w * 0.37, h * 0.48)
    hillMid.lineTo(w * 0.42, h * 0.44)
    hillMid.lineTo(w * 0.48, h * 0.42)
    hillMid.lineTo(w * 0.53, h * 0.45)
    hillMid.lineTo(w * 0.58, h * 0.50)
    hillMid.lineTo(w * 0.62, h * 0.56)
    hillMid.lineTo(w * 0.65, h * 0.65)
    hillMid.lineTo(w * 0.28, h * 0.65)
    hillMid.closePath()
    hillMid.fillPath()

    const hillRight = scene.add.graphics().setDepth(-22)
    hillRight.fillStyle(0x031c34, 1)
    hillRight.beginPath()
    hillRight.moveTo(w * 0.62, h * 0.65)
    hillRight.lineTo(w * 0.66, h * 0.52)
    hillRight.lineTo(w * 0.72, h * 0.44)
    hillRight.lineTo(w * 0.80, h * 0.40)
    hillRight.lineTo(w * 0.86, h * 0.42)
    hillRight.lineTo(w * 0.92, h * 0.46)
    hillRight.lineTo(w * 0.97, h * 0.50)
    hillRight.lineTo(w + 10, h * 0.55)
    hillRight.lineTo(w + 10, h * 0.65)
    hillRight.lineTo(w * 0.62, h * 0.65)
    hillRight.closePath()
    hillRight.fillPath()

    const cityG = scene.add.graphics().setDepth(-20)
    const buildings = [
      { x: 0.55, w: 0.035, h: 0.22 },
      { x: 0.59, w: 0.025, h: 0.16 },
      { x: 0.62, w: 0.04, h: 0.28 },
      { x: 0.67, w: 0.025, h: 0.14 },
      { x: 0.70, w: 0.035, h: 0.24 },
      { x: 0.74, w: 0.03, h: 0.20 },
      { x: 0.77, w: 0.04, h: 0.30 },
      { x: 0.82, w: 0.025, h: 0.17 },
      { x: 0.85, w: 0.035, h: 0.26 },
      { x: 0.89, w: 0.03, h: 0.21 },
      { x: 0.93, w: 0.035, h: 0.24 },
      { x: 0.97, w: 0.025, h: 0.18 },
    ]
    const windowGraphics: Phaser.GameObjects.Graphics[] = []
    buildings.forEach((b) => {
      const bx = w * b.x
      const baseY = h * 0.58
      const bh = h * b.h
      const by = baseY - bh
      const bw = w * b.w
      cityG.fillStyle(CITY_COLOR, 1)
      cityG.fillRect(bx, by, bw, bh)
      cityG.fillStyle(0x081222, 0.6)
      cityG.fillRect(bx, by, bw, 2)
      const wG = scene.add.graphics().setDepth(-19)
      windowGraphics.push(wG)
      for (let row = 0; row < Math.floor(bh / 7); row++) {
        for (let col = 0; col < Math.floor(bw / 5); col++) {
          if (Math.random() > 0.35) {
            const lit = Math.random() > 0.3
            const winColor = lit ? 0xffdd66 : 0x1a2a44
            const winAlpha = lit ? 0.15 + Math.random() * 0.25 : 0.3
            wG.fillStyle(winColor, winAlpha)
            wG.fillRect(bx + 1 + col * 5, by + 1 + row * 7, 3, 4)
          }
        }
      }
    })

    const lakeY = h * 0.58
    const lakeG = scene.add.graphics().setDepth(-18)
    lakeG.fillStyle(0x012050, 0.7)
    lakeG.fillRect(0, lakeY, w, h * 0.07)
    lakeG.fillStyle(0x023a7a, 0.2)
    for (let i = 0; i < 20; i++) {
      const lx = w * (0.02 + Math.random() * 0.96)
      const ly = lakeY + 2 + Math.random() * h * 0.05
      lakeG.fillEllipse(lx, ly, 15 + Math.random() * 35, 1 + Math.random() * 2)
    }
    for (let i = 0; i < 8; i++) {
      const rx = w * (0.1 + Math.random() * 0.8)
      const ry = lakeY + 3 + Math.random() * h * 0.04
      const refl = scene.add.circle(rx, ry, 1.5, 0xffdd66, 0.08).setDepth(-17)
      scene.tweens.add({
        targets: refl,
        alpha: { from: 0.04, to: 0.12 },
        scaleX: { from: 0.8, to: 1.2 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
      })
    }

    const flagX = w * 0.14
    const flagTopY = h * 0.22
    const flagBotY = h * 0.42
    const flagPole = scene.add.graphics().setDepth(-16)
    flagPole.fillStyle(0x5D4037, 1)
    flagPole.fillRect(flagX - 1.5, flagTopY, 3, flagBotY - flagTopY)
    flagPole.fillStyle(0x8D6E63, 1)
    flagPole.fillCircle(flagX, flagTopY, 4)

    const flagG = scene.add.graphics().setDepth(-15)
    flagG.fillStyle(GREEN, 1)
    flagG.beginPath()
    flagG.moveTo(flagX + 2, flagTopY + 1)
    flagG.lineTo(flagX + 35, flagTopY + 10)
    flagG.lineTo(flagX + 2, flagTopY + 20)
    flagG.closePath()
    flagG.fillPath()
    flagG.fillStyle(0xffffff, 0.9)
    flagG.fillCircle(flagX + 12, flagTopY + 10, 4)
    scene.tweens.add({
      targets: flagG,
      x: { from: -1, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const groundY = h * 0.65
    const groundG = scene.add.graphics().setDepth(-14)
    groundG.fillStyle(GROUND_COLOR, 1)
    groundG.fillRect(0, groundY, w, h - groundY)
    groundG.fillStyle(0x0a1f15, 0.6)
    groundG.fillRect(0, groundY, w, 3)

    const grassG = scene.add.graphics().setDepth(-13)
    for (let i = 0; i < 40; i++) {
      const gx = Math.random() * w
      const gy = groundY + Math.random() * (h * 0.08)
      const gh = 4 + Math.random() * 8
      grassG.fillStyle(0x1a3a1a, 0.4 + Math.random() * 0.3)
      grassG.fillTriangle(gx, gy, gx - 2, gy - gh, gx + 2, gy - gh)
    }

    for (let i = 0; i < 8; i++) {
      const fx = Math.random() * w
      const fy = groundY + 5 + Math.random() * (h * 0.06)
      const colors = [0x7CFC00, 0x00E676, 0xFFEB3B, 0xFF9800]
      const flower = scene.add.circle(fx, fy, 2 + Math.random() * 2, colors[i % 4], 0.5).setDepth(-12)
      scene.tweens.add({
        targets: flower,
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 1500 + Math.random() * 1500,
        yoyo: true,
        repeat: -1,
      })
    }

    for (let i = 0; i < 6; i++) {
      const rx = w * (0.05 + Math.random() * 0.9)
      const ry = groundY + 10 + Math.random() * (h * 0.1)
      const rs = 3 + Math.random() * 6
      const rock = scene.add.graphics().setDepth(-12)
      rock.fillStyle(0x2a3040, 0.6)
      rock.fillEllipse(rx, ry, rs * 2, rs * 1.2)
    }

    for (let i = 0; i < 5; i++) {
      const bx2 = w * (0.03 + Math.random() * 0.94)
      const by2 = groundY + 8 + Math.random() * (h * 0.08)
      const bushG = scene.add.graphics().setDepth(-12)
      bushG.fillStyle(0x0d2a1a, 0.5)
      bushG.fillEllipse(bx2, by2, 12 + Math.random() * 15, 6 + Math.random() * 6)
      bushG.fillStyle(0x153a20, 0.3)
      bushG.fillEllipse(bx2 + 3, by2 - 2, 8 + Math.random() * 8, 4 + Math.random() * 4)
    }

    for (let i = 0; i < 3; i++) {
      const lx = w * (0.1 + i * 0.4 + Math.random() * 0.15)
      const ly = groundY - 5
      const lanternG = scene.add.graphics().setDepth(-11)
      lanternG.fillStyle(0x5D4037, 0.8)
      lanternG.fillRect(lx - 1.5, ly - 14, 3, 14)
      lanternG.fillStyle(0x8D6E63, 0.9)
      lanternG.fillRoundedRect(lx - 5, ly - 20, 10, 8, 3)
      const lanternLight = scene.add.circle(lx, ly - 16, 8, 0xFFA000, 0.08).setDepth(-10)
      scene.tweens.add({
        targets: lanternLight,
        alpha: { from: 0.05, to: 0.12 },
        scaleX: { from: 0.9, to: 1.15 },
        scaleY: { from: 0.9, to: 1.15 },
        duration: 1800 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
      })
    }

    const fireflies: { x: number; y: number; vx: number; vy: number; gfx: Phaser.GameObjects.Arc }[] = []
    for (let i = 0; i < 10; i++) {
      const fx2 = Math.random() * w
      const fy2 = groundY - 10 + Math.random() * (h * 0.25)
      const dot = scene.add.circle(fx2, fy2, 1.5, GREEN_LIGHT, 0.3).setDepth(-11)
      fireflies.push({ x: fx2, y: fy2, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2, gfx: dot })
      scene.tweens.add({
        targets: dot,
        alpha: { from: 0.1, to: 0.5 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
      })
    }

    const lampPosts = [
      { x: 0.35, on: false },
      { x: 0.50, on: false },
      { x: 0.65, on: false },
    ]
    const lampLights: Phaser.GameObjects.Arc[] = []
    lampPosts.forEach((lp) => {
      const lpx = w * lp.x
      const lpy = groundY - 2
      const lampG = scene.add.graphics().setDepth(-10)
      lampG.fillStyle(0x3a3a3a, 0.8)
      lampG.fillRect(lpx - 1.5, lpy - 30, 3, 30)
      lampG.fillStyle(0x4a4a4a, 0.9)
      lampG.fillCircle(lpx, lpy - 30, 4)
      const ll = scene.add.circle(lpx, lpy - 30, 3, 0xFFA000, 0).setDepth(-9)
      lampLights.push(ll)
      const lampGlow = scene.add.circle(lpx, lpy - 25, 20, 0xFFA000, 0).setDepth(-9)
      scene.data.set('lampGlow_' + lp.x, lampGlow)
    })

    const particles: Particle[] = []
    const PARTICLE_COUNT = 25
    const CONNECTION_DIST = 90
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dot = scene.add.circle(
        Math.random() * w,
        Math.random() * h * 0.55,
        Math.random() * 1.8 + 0.5,
        0xffffff,
        Math.random() * 0.12 + 0.03,
      ).setDepth(-8)
      particles.push({
        x: dot.x, y: dot.y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        gfx: dot,
      })
    }
    const connectionG = scene.add.graphics().setDepth(-8)
    scene.events.on('update', () => {
      connectionG.clear()
      fireflies.forEach((f) => {
        f.x += f.vx
        f.y += f.vy
        if (f.x < 0 || f.x > w) f.vx *= -1
        if (f.y < groundY - 30 || f.y > groundY + h * 0.15) f.vy *= -1
        f.gfx.setPosition(f.x, f.y)
      })
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h * 0.55) p.vy *= -1
        p.gfx.setPosition(p.x, p.y)
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.07
            connectionG.lineStyle(0.5, GREEN, alpha)
            connectionG.lineBetween(p.x, p.y, q.x, q.y)
          }
        }
      }
    })

    scene.data.set('lampLights', lampLights)
    scene.data.set('windowGraphics', windowGraphics)
    scene.data.set('moonGlow', moonGlow)
    scene.data.set('particles', particles)
    scene.data.set('connectionG', connectionG)
    scene.data.set('fireflies', fireflies)

    const introOverlay = scene.add.rectangle(w / 2, h / 2, w * 2, h * 2, 0x000000, 1).setDepth(500)

    const introTitle = scene.add.text(w / 2, h * 0.38, 'FINAL MISSION', {
      fontSize: `${Math.max(32, w * 0.05)}px`,
      color: '#FFD700',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#001a3d',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(501).setAlpha(0)

    const introSubtitle = scene.add.text(w / 2, h * 0.48, 'MAKE AN IMPACT', {
      fontSize: `${Math.max(18, w * 0.025)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#001a3d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(501).setAlpha(0)

    const introLine = scene.add.graphics().setDepth(501)
    introLine.fillStyle(GREEN, 0.8)
    introLine.fillRect(w * 0.35, h * 0.43, w * 0.3, 2)
    introLine.setAlpha(0)

    scene.time.delayedCall(300, () => {
      scene.tweens.add({
        targets: introOverlay,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => introOverlay.destroy(),
      })
    })

    scene.time.delayedCall(1200, () => {
      scene.tweens.add({ targets: introTitle, alpha: 1, y: introTitle.y - 15, duration: 600, ease: 'Back.easeOut' })
    })
    scene.time.delayedCall(1500, () => {
      scene.tweens.add({ targets: introLine, alpha: 1, duration: 400 })
    })
    scene.time.delayedCall(1700, () => {
      scene.tweens.add({ targets: introSubtitle, alpha: 1, y: introSubtitle.y - 10, duration: 500, ease: 'Back.easeOut' })
    })

    scene.time.delayedCall(3800, () => {
      scene.tweens.add({ targets: [introTitle, introSubtitle, introLine], alpha: 0, duration: 600, onComplete: () => {
        introTitle.destroy()
        introSubtitle.destroy()
        introLine.destroy()
      }})
    })

    const breathTween = scene.tweens.add({
      targets: scene.cameras.main,
      scrollY: { from: -2, to: 2 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    scene.data.set('breathTween', breathTween)
  },

  createProjectile(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const glow = scene.add.graphics()
    glow.fillStyle(GREEN_LIGHT, 0.15)
    glow.fillCircle(0, 0, 55)

    const glow2 = scene.add.graphics()
    glow2.fillStyle(GREEN, 0.08)
    glow2.fillCircle(0, 0, 70)

    const pulseRing1 = scene.add.graphics()
    pulseRing1.lineStyle(2, GREEN_LIGHT, 0.35)
    pulseRing1.strokeCircle(0, 0, 44)
    scene.tweens.add({
      targets: pulseRing1,
      alpha: { from: 0.4, to: 0 },
      scaleX: { from: 1, to: 1.6 },
      scaleY: { from: 1, to: 1.6 },
      duration: 1100,
      repeat: -1,
    })

    const pulseRing2 = scene.add.graphics()
    pulseRing2.lineStyle(1.5, GREEN, 0.25)
    pulseRing2.strokeCircle(0, 0, 52)
    scene.tweens.add({
      targets: pulseRing2,
      alpha: { from: 0.3, to: 0 },
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 1400,
      delay: 250,
      repeat: -1,
    })

    const outer = scene.add.graphics()
    outer.fillStyle(0x2E7D32, 1)
    outer.fillCircle(0, 0, 36)
    outer.lineStyle(5, GREEN, 1)
    outer.strokeCircle(0, 0, 36)

    const mid = scene.add.graphics()
    mid.fillStyle(0x1B5E20, 1)
    mid.fillCircle(0, 0, 24)
    mid.lineStyle(3, GREEN_LIGHT, 0.6)
    mid.strokeCircle(0, 0, 24)

    const inner = scene.add.graphics()
    inner.fillStyle(0x0f3b1a, 1)
    inner.fillCircle(0, 0, 13)

    const text = scene.add.text(0, 0, '0', {
      fontSize: '46px',
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const shine1 = scene.add.graphics()
    shine1.fillStyle(0xffffff, 0.35)
    shine1.fillCircle(-10, -12, 5)

    const shine2 = scene.add.graphics()
    shine2.fillStyle(0xffffff, 0.18)
    shine2.fillCircle(-16, -18, 3)

    const container = scene.add.container(
      scene.cameras.main.width / 2,
      scene.cameras.main.height - 178,
      [glow, glow2, pulseRing1, pulseRing2, outer, mid, inner, text, shine1, shine2],
    )
    container.setScale(1.25)
    container.setData('trailDots', [] as TrailDot[])
    container.setData('launched', false)
    return container
  },

  setupTargets(scene: Phaser.Scene, w: number, h: number): any {
    const tx = w / 2
    const ty = h * 0.15
    const s = 1.4

    for (let i = 0; i < 5; i++) {
      const searchG = scene.add.graphics().setDepth(-1)
      const angle = -Math.PI / 2 + (i - 2) * 0.12
      const len = h * 0.7
      const spread = 25
      const ax1 = tx + Math.cos(angle - 0.02) * spread
      const ay1 = ty + 40 * s
      const ax2 = tx + Math.cos(angle + 0.02) * spread
      const ay2 = ty + 40 * s
      const bx = tx + Math.cos(angle) * len
      const by = ty + 40 * s + Math.sin(angle) * len
      searchG.fillStyle([GREEN, GREEN_LIGHT, 0xffffff, GREEN, GREEN_LIGHT][i], 0.02)
      searchG.fillTriangle(ax1, ay1, ax2, ay2, bx - 30, by)
      searchG.fillTriangle(ax1, ay1, ax2, ay2, bx + 30, by)
      scene.tweens.add({
        targets: searchG,
        alpha: { from: 0.3, to: 0.8 },
        duration: 2500 + i * 400,
        yoyo: true,
        repeat: -1,
        delay: i * 300,
        ease: 'Sine.easeInOut',
      })
    }

    const massiveGlow = scene.add.graphics().setDepth(-1)
    massiveGlow.fillStyle(GREEN, 0.04)
    massiveGlow.fillCircle(tx, ty, 220 * s)
    massiveGlow.fillStyle(GREEN_LIGHT, 0.03)
    massiveGlow.fillCircle(tx, ty, 160 * s)
    massiveGlow.fillStyle(0xffffff, 0.02)
    massiveGlow.fillCircle(tx, ty, 100 * s)
    scene.tweens.add({
      targets: massiveGlow,
      alpha: { from: 0.5, to: 1 },
      scaleX: { from: 0.92, to: 1.1 },
      scaleY: { from: 0.92, to: 1.1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const pedestalG = scene.add.graphics().setDepth(0)
    pedestalG.fillStyle(0x001a3d, 1)
    pedestalG.fillRoundedRect(tx - 60 * s, ty + 75 * s, 120 * s, 50 * s, 8)
    pedestalG.fillStyle(0x01245d, 1)
    pedestalG.fillRoundedRect(tx - 55 * s, ty + 78 * s, 110 * s, 44 * s, 6)
    pedestalG.lineStyle(3, GREEN, 0.6)
    pedestalG.strokeRoundedRect(tx - 60 * s, ty + 75 * s, 120 * s, 50 * s, 8)
    pedestalG.fillStyle(GREEN, 0.15)
    pedestalG.fillRect(tx - 50 * s, ty + 80 * s, 100 * s, 3)

    const pillarLeft = scene.add.graphics().setDepth(0)
    pillarLeft.fillStyle(0x0a1a33, 1)
    pillarLeft.fillRect(tx - 180 * s, ty - 15 * s, 12 * s, 90 * s)
    pillarLeft.lineStyle(2, GREEN, 0.4)
    pillarLeft.strokeRect(tx - 180 * s, ty - 15 * s, 12 * s, 90 * s)

    const pillarRight = scene.add.graphics().setDepth(0)
    pillarRight.fillStyle(0x0a1a33, 1)
    pillarRight.fillRect(tx + 168 * s, ty - 15 * s, 12 * s, 90 * s)
    pillarRight.lineStyle(2, GREEN, 0.4)
    pillarRight.strokeRect(tx + 168 * s, ty - 15 * s, 12 * s, 90 * s)

    const pillarLight1 = scene.add.circle(tx - 174 * s, ty - 18 * s, 5, GREEN_LIGHT, 0).setDepth(1)
    const pillarLight2 = scene.add.circle(tx + 174 * s, ty - 18 * s, 5, GREEN_LIGHT, 0).setDepth(1)
    scene.tweens.add({
      targets: [pillarLight1, pillarLight2],
      alpha: { from: 0, to: 0.8 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const outerGlow = scene.add.graphics().setDepth(0)
    outerGlow.fillStyle(GREEN, 0.08)
    outerGlow.fillRoundedRect(tx - 200 * s, ty - 90 * s, 400 * s, 180 * s, 30)
    scene.tweens.add({
      targets: outerGlow,
      alpha: { from: 0.5, to: 1 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const platform = scene.add.graphics()
    platform.fillStyle(0xffffff, 0.98)
    platform.fillRoundedRect(tx - 185 * s, ty - 75 * s, 370 * s, 150 * s, 24)
    platform.lineStyle(6, GREEN, 1)
    platform.strokeRoundedRect(tx - 185 * s, ty - 75 * s, 370 * s, 150 * s, 24)
    platform.fillStyle(GREEN, 1)
    platform.fillRoundedRect(tx - 178 * s, ty - 68 * s, 356 * s, 136 * s, 20)
    platform.setDepth(1)

    const innerLight = scene.add.graphics()
    innerLight.fillStyle(0xffffff, 0.15)
    innerLight.fillRect(tx - 175 * s, ty - 65 * s, 350 * s, 130 * s)
    innerLight.setDepth(2)

    const text18 = scene.add.text(tx - 90 * s, ty, '18', {
      fontSize: `${Math.round(88 * s)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#1B5E20',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3)

    const textDC = scene.add.text(tx + 90 * s, ty, 'DC', {
      fontSize: `${Math.round(72 * s)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#1B5E20',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3)

    scene.tweens.add({
      targets: [text18, textDC],
      alpha: { from: 0.85, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const slotSize = 40 * s
    const slotBg = scene.add.graphics().setDepth(4)
    slotBg.fillStyle(0x1B5E20, 0.85)
    slotBg.fillRoundedRect(tx - slotSize, ty - slotSize, slotSize * 2, slotSize * 2, 16 * s)
    slotBg.lineStyle(Math.round(5 * s), GREEN_LIGHT, 0.85)
    slotBg.strokeRoundedRect(tx - slotSize, ty - slotSize, slotSize * 2, slotSize * 2, 16 * s)

    const slotLight = scene.add.graphics().setDepth(4)
    slotLight.fillStyle(GREEN, 0.15)
    slotLight.fillCircle(tx, ty, 65 * s)

    const slotQuestion = scene.add.text(tx, ty, '?', {
      fontSize: '52px',
      color: '#7CFC00',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5).setAlpha(0.85)

    const slotArrow = scene.add.graphics().setDepth(4)
    slotArrow.fillStyle(GREEN_LIGHT, 0.4)
    slotArrow.fillTriangle(tx, ty + 50 * s, tx - 12 * s, ty + 66 * s, tx + 12 * s, ty + 66 * s)
    scene.tweens.add({
      targets: slotArrow,
      y: ty + 70 * s,
      duration: 600,
      yoyo: true,
      repeat: -1,
    })

    const pulsingGlow = scene.add.graphics().setDepth(3)
    pulsingGlow.fillStyle(GREEN_LIGHT, 0.08)
    pulsingGlow.fillCircle(tx, ty, 130 * s)
    scene.tweens.add({
      targets: pulsingGlow,
      alpha: { from: 0.3, to: 0.75 },
      scaleX: { from: 0.93, to: 1.15 },
      scaleY: { from: 0.93, to: 1.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    for (let i = 0; i < 8; i++) {
      const ringRad = 80 + i * 20
      const ring = scene.add.graphics().setDepth(3)
      ring.lineStyle(2, GREEN_LIGHT, 0.4 - i * 0.04)
      ring.strokeCircle(tx, ty, ringRad)
      ring.setAlpha(0)
      scene.tweens.add({
        targets: ring,
        alpha: { from: 0.6, to: 0 },
        scaleX: { from: 1, to: 1.4 + i * 0.2 },
        scaleY: { from: 1, to: 1.4 + i * 0.2 },
        duration: 1100 + i * 120,
        repeat: -1,
        ease: 'Power2',
        delay: i * 150,
      })
    }

    const outerRing2 = scene.add.graphics().setDepth(3)
    outerRing2.lineStyle(2, GREEN_LIGHT, 0.25)
    outerRing2.strokeCircle(tx, ty, 80 + 8 * 20)
    scene.tweens.add({
      targets: outerRing2,
      alpha: { from: 0.15, to: 0.5 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const spotY = h * 0.50
    for (let i = 0; i < 6; i++) {
      const spotG = scene.add.graphics().setDepth(0)
      const dx = (i % 2 === 0 ? -1 : 1) * (50 + i * 15)
      const spotColor = [GREEN, GREEN_LIGHT, 0xffffff, GREEN, GREEN_LIGHT, 0x448AFF][i]
      spotG.fillStyle(spotColor, 0.02)
      spotG.fillTriangle(
        tx + dx - 20, spotY,
        tx + dx / 2 - 3, ty - 10,
        tx + dx / 2 + 3, ty - 10,
      )
      scene.tweens.add({
        targets: spotG,
        alpha: { from: 0.3, to: 0.9 },
        duration: 1800 + i * 200,
        yoyo: true,
        repeat: -1,
        delay: i * 200,
        ease: 'Sine.easeInOut',
      })
    }

    scene.data.set('lampLightsOff', true)
    scene.data.set('windowsOff', true)
    scene.data.set('worldLit', false)

    const targetData = {
      slotX: tx,
      slotY: ty,
      slotSize,
      slotBg,
      slotLight,
      slotQuestion,
      slotArrow,
      pulsingGlow,
      outerGlow,
      beingHit: false,
      trailDots: [] as TrailDot[],
      cameraState: 'idle' as 'idle' | 'drag' | 'launch' | 'impact',
      breathPhase: 0,
    }
    return targetData
  },

  updateMission(
    scene: Phaser.Scene,
    projectileX: number,
    projectileY: number,
    targets: any,
    w: number,
    h: number,
  ): MissionUpdate {
    if (targets.beingHit) return {}

    const cam = scene.cameras.main

    const startY = h - 178
    const startX = w / 2
    const projMoved = Math.abs(projectileX - startX) > 5 || Math.abs(projectileY - startY) > 5

    if (projMoved && targets.cameraState === 'idle') {
      targets.cameraState = 'drag'
      const breathTween = scene.data.get('breathTween') as Phaser.Tweens.Tween | null
      if (breathTween) breathTween.pause()
      scene.tweens.add({
        targets: cam,
        zoom: 1.08,
        duration: 400,
        ease: 'Sine.easeOut',
      })
    }

    if (targets.cameraState === 'drag' && !projMoved) {
      targets.cameraState = 'idle'
      scene.tweens.add({
        targets: cam,
        zoom: 1,
        duration: 300,
        ease: 'Sine.easeOut',
        onComplete: () => {
          const bt = scene.data.get('breathTween') as Phaser.Tweens.Tween | null
          if (bt) bt.resume()
        },
      })
    }

    const trailContainer = scene.data.get('trailContainer') as Phaser.GameObjects.Container | undefined
    if (!trailContainer && !targets.beingHit) {
      const tc = scene.add.container(0, 0).setDepth(55)
      scene.data.set('trailContainer', tc)
    }
    const tc = scene.data.get('trailContainer') as Phaser.GameObjects.Container | undefined
    if (tc && projMoved && !targets.beingHit) {
      const dot = scene.add.circle(projectileX, projectileY, 3, GREEN_LIGHT, 0.6).setDepth(55)
      tc.add(dot)
      scene.tweens.add({
        targets: dot,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 500,
        onComplete: () => {
          tc.remove(dot)
          dot.destroy()
        },
      })
    }

    if (targets.cameraState === 'idle') {
      targets.breathPhase += 0.008
    }

    const dx = projectileX - targets.slotX
    const dy = projectileY - targets.slotY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 80) {
      return { hit: true, hitDistance: dist }
    }
    return {}
  },

  onHit(
    scene: Phaser.Scene,
    targets: any,
    projectileX: number,
    projectileY: number,
  ): { distance: number; completed: boolean } {
    targets.beingHit = true
    targets.cameraState = 'impact'

    const breathTween = scene.data.get('breathTween') as Phaser.Tweens.Tween | null
    if (breathTween) breathTween.stop()

    const dx = projectileX - targets.slotX
    const dy = projectileY - targets.slotY
    const dist = Math.sqrt(dx * dx + dy * dy)

    targets.pulsingGlow.setAlpha(1)
    targets.outerGlow.setAlpha(1)
    targets.slotLight.setAlpha(1)
    targets.slotQuestion.setAlpha(0)

    const zeroText = scene.add.text(targets.slotX, targets.slotY, '0', {
      fontSize: `${Math.round(targets.slotSize * 1.8)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setScale(3).setAlpha(0)
    scene.tweens.add({
      targets: zeroText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: 'Back.easeOut',
    })

    const cam = scene.cameras.main
    const cw = cam.width
    const ch = cam.height

    cam.flash(500, 255, 255, 255)
    cam.shake(400, 0.018)

    scene.tweens.add({
      targets: cam,
      zoom: 1.25,
      duration: 1200,
      ease: 'Sine.easeInOut',
    })

    const energyWave = scene.add.graphics().setDepth(10)
    let waveRadius = 0
    scene.tweens.addCounter({
      from: 0,
      to: Math.max(cw, ch),
      duration: 1500,
      ease: 'Power2',
      onUpdate: (tween) => {
        waveRadius = tween.getValue() ?? 0
        energyWave.clear()
        energyWave.lineStyle(4, GREEN, 0.6 * (1 - waveRadius / Math.max(cw, ch)))
        energyWave.strokeCircle(targets.slotX, targets.slotY, waveRadius)
        energyWave.lineStyle(2, GREEN_LIGHT, 0.3 * (1 - waveRadius / Math.max(cw, ch)))
        energyWave.strokeCircle(targets.slotX, targets.slotY, waveRadius * 0.8)
      },
      onComplete: () => energyWave.destroy(),
    })

    const lampLights = scene.data.get('lampLights') as Phaser.GameObjects.Arc[] | undefined
    if (lampLights) {
      lampLights.forEach((ll, i) => {
        scene.tweens.add({
          targets: ll,
          alpha: 0.7,
          duration: 400,
          delay: 600 + i * 200,
        })
        const glowKey = 'lampGlow_' + (0.35 + i * 0.15)
        const lampGlow = scene.data.get(glowKey) as Phaser.GameObjects.Arc | undefined
        if (lampGlow) {
          scene.tweens.add({
            targets: lampGlow,
            alpha: 0.1,
            duration: 400,
            delay: 600 + i * 200,
          })
        }
      })
    }

    const windowGraphics = scene.data.get('windowGraphics') as Phaser.GameObjects.Graphics[] | undefined
    if (windowGraphics) {
      windowGraphics.forEach((wg) => {
        wg.setAlpha(0.6)
      })
    }

    const moonGlow = scene.data.get('moonGlow') as Phaser.GameObjects.Graphics | undefined
    if (moonGlow) {
      scene.tweens.add({
        targets: moonGlow,
        alpha: 1.5,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 2000,
        ease: 'Sine.easeInOut',
      })
    }

    for (let i = 0; i < 8; i++) {
      scene.time.delayedCall(800 + i * 300, () => {
        const fx = cw * (0.15 + Math.random() * 0.7)
        const fy = ch * (0.05 + Math.random() * 0.25)
        spawnFirework(scene, fx, fy)
      })
    }

    for (let i = 0; i < 150; i++) {
      const x = Math.random() * cw
      const y = -10 - Math.random() * 80
      const color = [0xFFD700, 0xFFA000, 0xffffff, 0xFFECB3, GREEN, 0x448AFF][i % 6]
      const conf = scene.add.rectangle(x, y, 3 + Math.random() * 5, 3 + Math.random() * 8, color, 1).setDepth(200)
      conf.setAngle(Math.random() * 360)
      scene.tweens.add({
        targets: conf,
        y: ch + 50,
        x: x + (Math.random() - 0.5) * 180,
        angle: conf.angle + 360 + Math.random() * 720,
        alpha: { from: 1, to: 0.15 },
        duration: 2200 + Math.random() * 1500,
        delay: i * 18,
        ease: 'Power1',
        onComplete: () => conf.destroy(),
      })
    }

    const tc = scene.data.get('trailContainer') as Phaser.GameObjects.Container | undefined
    if (tc) tc.destroy()

    const completeText = scene.add.text(cw / 2, ch * 0.18, 'MISSION COMPLETE', {
      fontSize: `${Math.max(28, cw * 0.04)}px`,
      color: '#FFD700',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#001a3d',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(210).setAlpha(0).setScale(0.1)
    scene.tweens.add({
      targets: completeText,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 700,
      ease: 'Back.easeOut',
      delay: 400,
    })

    const welcomeText = scene.add.text(cw / 2, ch * 0.26, 'WELCOME TO 180DC', {
      fontSize: `${Math.max(18, cw * 0.025)}px`,
      color: '#ffffff',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#001a3d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(210).setAlpha(0)
    scene.tweens.add({
      targets: welcomeText,
      alpha: 1, y: welcomeText.y - 8,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 900,
    })

    scene.time.delayedCall(3500, () => {
      scene.tweens.add({
        targets: cam,
        zoom: 0.85,
        scrollX: 0,
        duration: 2500,
        ease: 'Sine.easeInOut',
      })

      scene.tweens.add({
        targets: [completeText, welcomeText],
        alpha: 0,
        y: '-=20',
        duration: 800,
        delay: 1500,
      })
    })

    return { distance: dist, completed: true }
  },

  onMiss(scene: Phaser.Scene, targets: any): void {
    const w = scene.cameras.main.width
    const h = scene.cameras.main.height

    const label = scene.add.text(w / 2, h * 0.35, 'Restore the missing zero!', {
      fontSize: `${Math.max(20, w * 0.03)}px`,
      color: '#FFD700',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#001a3d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200).setAlpha(0)

    scene.tweens.add({
      targets: label,
      alpha: 1,
      y: label.y - 20,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: label,
          alpha: 0,
          duration: 500,
          delay: 1000,
        })
      },
    })
  },

  isComplete(targets: any): boolean {
    return targets.beingHit === true
  },

  getScore(targets: any): number {
    return 100
  },
}

function spawnFirework(scene: Phaser.Scene, fx: number, fy: number) {
  const colors = [0xFF5252, 0xF9A825, 0x448AFF, 0xAB47BC, GREEN, GREEN_LIGHT, 0xFFD700, 0xff6600]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const burstCount = 25 + Math.floor(Math.random() * 15)

  const rocket = scene.add.circle(fx, scene.cameras.main.height, 2, 0xffffff, 0.8).setDepth(200)
  scene.tweens.add({
    targets: rocket,
    y: fy,
    duration: 400 + Math.random() * 300,
    ease: 'Power2',
    onComplete: () => {
      rocket.destroy()
      for (let j = 0; j < burstCount; j++) {
        const angle = (j / burstCount) * Math.PI * 2
        const speed = 2 + Math.random() * 4
        const p = scene.add.circle(fx, fy, 1.5 + Math.random() * 1.5, color, 1).setDepth(200)
        scene.tweens.add({
          targets: p,
          x: fx + Math.cos(angle) * speed * 35,
          y: fy + Math.sin(angle) * speed * 35 + 15,
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 600 + Math.random() * 400,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        })
      }
      const flash = scene.add.circle(fx, fy, 8, 0xffffff, 0.8).setDepth(200)
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        scaleX: 3,
        scaleY: 3,
        duration: 300,
        onComplete: () => flash.destroy(),
      })
    },
  })
}
