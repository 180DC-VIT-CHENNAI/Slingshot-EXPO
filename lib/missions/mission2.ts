import * as Phaser from 'phaser'
import { type MissionConfig } from './core'

interface CrateData {
  rect: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  x: number
  y: number
  alive: boolean
  index: number
}

const CRATE_LABELS = [
  'Waste', 'Delay', 'Confusion', 'Inefficiency', 'Duplication',
  'Manual', 'Rework', 'Bottleneck', 'Chaos', 'Friction',
]

const CRATE_POPUPS: Record<string, { title: string; body: string }> = {
  Waste: { title: 'Waste Eliminated', body: 'Removing waste frees up time and resources for high-value work.' },
  Delay: { title: 'Delay Removed', body: 'Cutting delays accelerates project timelines and delivery.' },
  Confusion: { title: 'Confusion Cleared', body: 'Clear communication aligns teams and prevents rework.' },
  Inefficiency: { title: 'Inefficiency Fixed', body: 'Streamlining processes boosts overall productivity.' },
  Duplication: { title: 'Duplication Ended', body: 'Eliminating redundancy saves cost and effort.' },
  Manual: { title: 'Manual Work Automated', body: 'Automation reduces errors and frees up talent.' },
  Rework: { title: 'Rework Prevented', body: 'Getting it right the first time ensures quality delivery.' },
  Bottleneck: { title: 'Bottleneck Broken', body: 'Removing blockers keeps the entire pipeline moving.' },
  Chaos: { title: 'Chaos Organized', body: 'Structure and systems turn chaos into smooth operations.' },
  Friction: { title: 'Friction Reduced', body: 'Lowering friction improves collaboration and speed.' },
}

export const mission2Config: MissionConfig = {
  sceneKey: 'Mission2',
  gravity: 0.20,
  maxPull: 125,
  power: 0.25,
  hitZone: 55,
  countdownColor: '#8B6914',
  multiShot: true,
  multiShotOnHit: true,
  totalShots: 4,

  drawEnvironment(scene, w, h) {
    const bg = scene.add.graphics()
    for (let y = 0; y < h; y++) {
      const t = y / h
      const r = Math.floor(26 + (42 - 26) * t)
      const g = Math.floor(15 + (26 - 15) * t)
      const b = Math.floor(5 + (14 - 5) * t)
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      bg.fillRect(0, y, w, 1)
    }
    bg.setDepth(-15)

    const floor = scene.add.graphics().setDepth(-4)
    floor.fillStyle(0x3E2213, 1)
    floor.fillRect(0, h * 0.65, w, h * 0.35)
    for (let i = 0; i < 20; i++) {
      floor.lineStyle(1, 0x2a1608, 0.4)
      floor.lineBetween(0, h * 0.65 + i * (h * 0.35 / 20), w, h * 0.65 + i * (h * 0.35 / 20))
    }
    floor.lineStyle(2, 0x5a3518, 0.5)
    floor.lineBetween(0, h * 0.65, w, h * 0.65)

    for (let i = 0; i < 3; i++) {
      const lx = w * (0.2 + i * 0.3)
      const lamp = scene.add.graphics().setDepth(-3)
      lamp.fillStyle(0x444444, 1)
      lamp.fillRect(lx - 2, 0, 4, h * 0.08)
      lamp.fillStyle(0xFFDD44, 0.15)
      lamp.fillTriangle(lx - 30, h * 0.08, lx + 30, h * 0.08, lx, h * 0.3)
      const bulb = scene.add.circle(lx, h * 0.08, 4, 0xFFDD88, 0.9).setDepth(-2)
      scene.tweens.add({
        targets: bulb, alpha: { from: 0.7, to: 1 },
        duration: 1200 + i * 300, yoyo: true, repeat: -1,
      })
    }

    for (let i = 0; i < 15; i++) {
      const dust = scene.add.circle(
        Math.random() * w, Math.random() * h * 0.6,
        Math.random() * 1.5 + 0.5, 0xC4A882, Math.random() * 0.3 + 0.05,
      ).setDepth(-1)
      scene.tweens.add({
        targets: dust, y: dust.y + 30 + Math.random() * 40,
        x: dust.x + (Math.random() - 0.5) * 30,
        alpha: 0, duration: 3000 + Math.random() * 3000, repeat: -1,
        delay: Math.random() * 2000,
      })
    }

    const shelfL = scene.add.graphics().setDepth(-2)
    shelfL.fillStyle(0x4a2a10, 0.8)
    shelfL.fillRect(0, h * 0.25, w * 0.08, h * 0.4)
    shelfL.fillRect(0, h * 0.2, w * 0.12, 4)

    const shelfR = scene.add.graphics().setDepth(-2)
    shelfR.fillStyle(0x4a2a10, 0.8)
    shelfR.fillRect(w * 0.92, h * 0.25, w * 0.08, h * 0.4)
    shelfR.fillRect(w * 0.88, h * 0.2, w * 0.12, 4)

    const counter = scene.add.text(w / 2, 24, '', {
      fontSize: '13px', color: '#C4A882', fontFamily: 'Poppins, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setName('crateCounter')
  },

  createProjectile(scene) {
    const g = scene.add.graphics()
    g.fillStyle(0x555555, 1)
    g.fillCircle(0, 0, 16)
    g.fillStyle(0x888888, 1)
    g.fillCircle(-4, -4, 5)
    g.lineStyle(3, 0x333333, 1)
    g.strokeCircle(0, 0, 16)

    const t = scene.add.text(0, 0, '180', {
      fontSize: '8px', color: '#aaa', fontFamily: 'Poppins, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    const glow = scene.add.graphics()
    glow.fillStyle(0x888888, 0.15)
    glow.fillCircle(0, 0, 22)

    return scene.add.container(0, 0, [glow, g, t])
  },

  setupTargets(scene, w, h) {
    const crates: CrateData[] = []
    const cx = w / 2
    const baseY = h * 0.55
    const size = Math.min(72, w / 7)
    const gap = 6

    const rows = [
      { count: 4, y: baseY },
      { count: 3, y: baseY - (size + gap) },
      { count: 2, y: baseY - (size + gap) * 2 },
      { count: 1, y: baseY - (size + gap) * 3 },
    ]

    rows.forEach((row, ri) => {
      const totalW = row.count * (size + gap) - gap
      const startX = cx - totalW / 2
      for (let ci = 0; ci < row.count; ci++) {
        const idx = ri * 4 + ci
        if (idx >= 10) return
        const x = startX + ci * (size + gap) + size / 2
        const y = row.y

        const rect = scene.add.graphics().setDepth(10 + ri)
        rect.fillStyle(0x6B4914, 1)
        rect.fillRoundedRect(x - size / 2, y - size / 2, size, size, 4)
        rect.lineStyle(2, 0x8B6914, 1)
        rect.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 4)
        rect.lineStyle(1, 0x5a3a10, 0.3)
        rect.lineBetween(x - size / 2 + 4, y - size / 2 + 4, x + size / 2 - 4, y + size / 2 - 4)

        const label = scene.add.text(x, y, CRATE_LABELS[idx], {
          fontSize: '10px', color: '#f0d890', fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold', align: 'center', wordWrap: { width: size - 10 },
        }).setOrigin(0.5).setDepth(11 + ri)

        crates.push({ rect, label, x, y, alive: true, index: idx })
      }
    })

    scene.tweens.add({
      targets: crates.map(c => c.rect),
      alpha: { from: 0, to: 1 }, duration: 400, stagger: 80,
    })

    return { crates, totalDestroyed: 0, totalCrates: 10, shotsUsed: 0 }
  },

  updateMission(scene, px, py, targets, w, _h) {
    const counter = scene.children.getByName('crateCounter') as Phaser.GameObjects.Text | null
    if (counter) {
      counter.setText(`Crates: ${targets.totalDestroyed} / ${targets.totalCrates}  |  Shots: ${targets.shotsUsed} / 4`)
    }

    for (const c of targets.crates) {
      if (!c.alive) continue
      const half = 45
      if (px > c.x - half && px < c.x + half && py > c.y - half && py < c.y + half) {
        const dist = Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2)
        return { hit: true, hitDistance: dist }
      }
    }
    return {}
  },

  onHit(scene, targets, px, py) {
    let hitAny = false
    const blastRadius = 80
    const hitPopups: { title: string; body: string }[] = []

    targets.crates.forEach((c: CrateData) => {
      if (!c.alive) return
      const dx = px - c.x
      const dy = py - c.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < blastRadius) {
        hitAny = true
        const label = CRATE_LABELS[c.index]
        const popup = CRATE_POPUPS[label]
        if (popup) hitPopups.push(popup)
        destroyCrate(scene, c, targets)
      }
    })

    targets.shotsUsed++

    if (hitAny) {
      const dist = Math.sqrt(px * px + py * py) * 0.01
      return { distance: Math.min(100, dist), completed: targets.totalDestroyed >= targets.totalCrates, popups: hitPopups }
    }
    return { distance: 999, completed: targets.totalDestroyed >= targets.totalCrates }
  },

  onMiss(scene, targets) {
    targets.shotsUsed++
  },

  isComplete(targets) {
    return targets.totalDestroyed >= targets.totalCrates || targets.shotsUsed >= 4
  },

  getScore(targets) {
    const base = (targets.totalDestroyed / targets.totalCrates) * 80
    const shotBonus = Math.max(0, (4 - targets.shotsUsed) * 10)
    return Math.min(100, Math.round(base + shotBonus))
  },
}

function destroyCrate(scene: Phaser.Scene, crate: CrateData, targets: { totalDestroyed: number }) {
  if (!crate.alive) return
  crate.alive = false
  targets.totalDestroyed++

  const colors = [0x8B6914, 0x6B4914, 0xC4A882, 0xAA8844]
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 5
    const p = scene.add.rectangle(
      crate.x + (Math.random() - 0.5) * 20,
      crate.y + (Math.random() - 0.5) * 20,
      3 + Math.random() * 5, 3 + Math.random() * 5,
      colors[i % colors.length], 1,
    ).setDepth(50)
    p.setAngle(Math.random() * 360)
    scene.tweens.add({
      targets: p,
      x: p.x + Math.cos(angle) * speed * 20,
      y: p.y + Math.sin(angle) * speed * 20 - 30,
      angle: p.angle + Math.random() * 360,
      alpha: 0, duration: 400 + Math.random() * 300,
      ease: 'Power2', onComplete: () => p.destroy(),
    })
  }

  for (let i = 0; i < 6; i++) {
    const d = scene.add.circle(
      crate.x + (Math.random() - 0.5) * 30,
      crate.y + (Math.random() - 0.5) * 30,
      2 + Math.random() * 3, 0x999999, 0.5,
    ).setDepth(49)
    scene.tweens.add({
      targets: d, y: d.y - 20 - Math.random() * 20,
      alpha: 0, scaleX: 2, scaleY: 2,
      duration: 600 + Math.random() * 400, onComplete: () => d.destroy(),
    })
  }

  scene.tweens.add({
    targets: [crate.rect, crate.label],
    alpha: 0, scaleX: 1.3, scaleY: 1.3,
    duration: 200, onComplete: () => {
      crate.rect.destroy()
      crate.label.destroy()
    },
  })
}
