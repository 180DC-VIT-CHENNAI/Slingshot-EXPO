import * as Phaser from 'phaser'
import { type MissionConfig } from './core'

interface FolderData {
  container: Phaser.GameObjects.Container
  x: number
  y: number
  baseX: number
  baseY: number
  collected: boolean
  label: string
  speed: number
  phase: number
}

const FOLDER_LABELS = ['Survey', 'Finance', 'Operations', 'HR', 'Sales']

const FOLDER_POPUPS: Record<string, { title: string; body: string; color?: number }> = {
  Survey: { title: 'Survey Data Collected', body: 'Client feedback reveals pain points and opportunities.', color: 0x2196F3 },
  Finance: { title: 'Financial Data Gathered', body: 'Revenue and cost data drive informed decisions.', color: 0x4CAF50 },
  Operations: { title: 'Operations Data Secured', body: 'Process metrics highlight where to optimize.', color: 0xFF9800 },
  HR: { title: 'HR Data Acquired', body: 'Team insights help build stronger organizations.', color: 0x9C27B0 },
  Sales: { title: 'Sales Data Captured', body: 'Pipeline data reveals growth opportunities.', color: 0xF44336 },
}

export const mission3Config: MissionConfig = {
  sceneKey: 'Mission3',
  gravity: 0.18,
  maxPull: 130,
  power: 0.22,
  hitZone: 60,
  countdownColor: '#2196F3',
  multiShot: true,
  multiShotOnHit: true,
  totalShots: 6,

  drawEnvironment(scene, w, h) {
    const bg = scene.add.graphics()
    for (let y = 0; y < h; y++) {
      const t = y / h
      const r = Math.floor(10 + (26 - 10) * t)
      const g = Math.floor(22 + (42 - 22) * t)
      const b = Math.floor(40 + (58 - 40) * t)
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      bg.fillRect(0, y, w, 1)
    }
    bg.setDepth(-15)

    for (let i = 0; i < 3; i++) {
      const lx = w * (0.2 + i * 0.3)
      const light = scene.add.graphics().setDepth(-3)
      light.fillStyle(0xffffff, 0.12)
      light.fillRect(lx - 30, 0, 60, 6)
      light.fillStyle(0xffffff, 0.03)
      light.fillTriangle(lx - 40, 6, lx + 40, 6, lx, h * 0.2)
    }

    const desk = scene.add.graphics().setDepth(-4)
    desk.fillStyle(0x2a2a30, 1)
    desk.fillRect(0, h * 0.62, w, h * 0.38)
    desk.lineStyle(2, 0x3a3a44, 0.5)
    desk.lineBetween(0, h * 0.62, w, h * 0.62)

    for (let i = 0; i < 2; i++) {
      const monX = w * (0.15 + i * 0.7)
      const mon = scene.add.graphics().setDepth(-3)
      mon.fillStyle(0x1a1a22, 1)
      mon.fillRect(monX - 20, h * 0.35, 40, 30)
      mon.fillStyle(0x0a1a2a, 1)
      mon.fillRect(monX - 17, h * 0.35 + 3, 34, 24)
      mon.fillStyle(0x333340, 1)
      mon.fillRect(monX - 4, h * 0.35 + 33, 8, 15)
    }

    for (let i = 0; i < 2; i++) {
      const partX = i === 0 ? w * 0.04 : w * 0.96
      const part = scene.add.graphics().setDepth(-2)
      part.fillStyle(0x444450, 0.6)
      part.fillRect(partX - 15, h * 0.2, 30, h * 0.45)
    }

    const counter = scene.add.text(w / 2, 24, '', {
      fontSize: '13px', color: '#64B5F6', fontFamily: 'Poppins, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setName('folderCounter')
  },

  createProjectile(scene) {
    const g = scene.add.graphics()
    g.fillStyle(0x8B4513, 1)
    g.fillRoundedRect(-14, -10, 28, 20, 3)
    g.lineStyle(2, 0x6B3410, 1)
    g.strokeRoundedRect(-14, -10, 28, 20, 3)

    const handle = scene.add.graphics()
    handle.lineStyle(2, 0xD4A574, 1)
    handle.strokeRoundedRect(-6, -16, 12, 8, 3)

    const latch = scene.add.graphics()
    latch.fillStyle(0xFFD700, 1)
    latch.fillCircle(0, -2, 2.5)

    return scene.add.container(0, 0, [g, handle, latch])
  },

  setupTargets(scene, w, h) {
    const folders: FolderData[] = []
    const collected = 0
    const total = 5
    const shotsUsed = 0

    FOLDER_LABELS.forEach((label, i) => {
      const baseX = w * (0.15 + (i % 3) * 0.35)
      const baseY = h * (0.18 + Math.floor(i / 3) * 0.2 + (i % 2) * 0.08)

      const body = scene.add.graphics()
      body.fillStyle(0xF5DEB3, 1)
      body.fillRoundedRect(-22, -16, 44, 32, 4)
      body.lineStyle(2, 0xD4A574, 1)
      body.strokeRoundedRect(-22, -16, 44, 32, 4)
      body.fillStyle(0xD4A574, 0.3)
      body.fillRoundedRect(-22, -16, 44, 10, { tl: 4, tr: 4, bl: 0, br: 0 })

      const tab = scene.add.graphics()
      tab.fillStyle(0xD4A574, 1)
      tab.fillRoundedRect(-8, -22, 16, 8, { tl: 3, tr: 3, bl: 0, br: 0 })

      const txt = scene.add.text(0, 2, label, {
        fontSize: '9px', color: '#5a3a10', fontFamily: 'Poppins, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5)

      const container = scene.add.container(baseX, baseY, [body, tab, txt]).setDepth(15)
      container.setScale(0)
      scene.tweens.add({
        targets: container, scale: 1, duration: 400, delay: i * 150, ease: 'Back.easeOut',
      })

      scene.tweens.add({
        targets: container,
        y: baseY + 8, duration: 1500 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })

      folders.push({
        container, x: baseX, y: baseY, baseX, baseY,
        collected: false, label, speed: 0.3 + i * 0.1, phase: i * 1.2,
      })
    })

    return { folders, collected, total, shotsUsed }
  },

  updateMission(scene, px, py, targets, w, _h) {
    const time = scene.time.now * 0.001
    targets.folders.forEach((f: FolderData) => {
      if (f.collected) return
      f.container.x = f.baseX + Math.sin(time * f.speed + f.phase) * 25
    })

    const counter = scene.children.getByName('folderCounter') as Phaser.GameObjects.Text | null
    if (counter) {
      counter.setText(`Collected: ${targets.collected} / ${targets.total}  |  Shots: ${targets.shotsUsed} / 6`)
    }

    for (const f of targets.folders) {
      if (f.collected) continue
      const dx = px - f.container.x
      const dy = py - f.container.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 40) {
        return { hit: true, hitDistance: dist }
      }
    }
    return {}
  },

  onHit(scene, targets, px, py) {
    let hitDist = 999
    let hitFolder: FolderData | null = null

    targets.folders.forEach((f: FolderData) => {
      if (f.collected) return
      const dx = px - f.container.x
      const dy = py - f.container.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 40) {
        if (dist < hitDist) {
          hitDist = dist
          hitFolder = f
        }
      }
    })

    targets.shotsUsed++

    if (hitFolder !== null) {
      const f: FolderData = hitFolder
      f.collected = true
      targets.collected++

      const popup = FOLDER_POPUPS[f.label]

      const trayX = scene.cameras.main.width - 50
      const trayY = 30

      for (let i = 0; i < 8; i++) {
        const sp = scene.add.circle(
          f.container.x + (Math.random() - 0.5) * 30,
          f.container.y + (Math.random() - 0.5) * 30,
          2, 0xFFD700, 0.9,
        ).setDepth(60)
        scene.tweens.add({
          targets: sp, x: trayX, y: trayY,
          alpha: 0, scaleX: 0, scaleY: 0,
          duration: 500, delay: i * 30, ease: 'Power2',
          onComplete: () => sp.destroy(),
        })
      }

      scene.tweens.add({
        targets: f.container,
        x: trayX, y: trayY, scaleX: 0.3, scaleY: 0.3, alpha: 0,
        duration: 600, ease: 'Power3',
        onComplete: () => { f.container.destroy() },
      })

      return { distance: hitDist, completed: targets.collected >= targets.total, popups: popup ? [popup] : [] }
    }

    return { distance: 999, completed: targets.collected >= targets.total }
  },

  onMiss(_scene, targets) {
    targets.shotsUsed++
  },

  isComplete(targets) {
    return targets.collected >= targets.total || targets.shotsUsed >= 6
  },

  getScore(targets) {
    if (targets.shotsUsed === 0) return 0
    const accuracy = targets.collected / targets.total
    const shotBonus = Math.max(0, (6 - targets.shotsUsed) * 5)
    return Math.min(100, Math.round(accuracy * 80 + shotBonus))
  },
}
