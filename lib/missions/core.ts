import * as Phaser from 'phaser'
import { type SoundName } from '@/components/AudioManager'

export interface MissionUpdate {
  hit?: boolean
  hitDistance?: number
}

export interface PopupInfo {
  title: string
  body: string
  color?: number
}

export interface MissionConfig {
  sceneKey: string
  gravity: number
  maxPull: number
  power: number
  hitZone: number
  drawEnvironment: (scene: Phaser.Scene, w: number, h: number) => void
  createProjectile: (scene: Phaser.Scene) => Phaser.GameObjects.Container
  setupTargets: (scene: Phaser.Scene, w: number, h: number) => any
  updateMission: (
    scene: Phaser.Scene,
    projectileX: number,
    projectileY: number,
    targets: any,
    w: number,
    h: number,
  ) => MissionUpdate
  onHit: (
    scene: Phaser.Scene,
    targets: any,
    projectileX: number,
    projectileY: number,
  ) => { distance: number; completed: boolean; popups?: PopupInfo[] }
  onMiss: (scene: Phaser.Scene, targets: any) => void
  isComplete: (targets: any) => boolean
  getScore: (targets: any) => number
  countdownColor?: string
  multiShot?: boolean
  multiShotOnHit?: boolean
  totalShots?: number
}

const TRAIL_MAX = 25
const TRAIL_RADIUS = 4
const POST_ACTION_DELAY = 1000
const MISS_ACTION_DELAY = 900
const STALL_TIMEOUT = 2500

export function createMissionScene(
  config: MissionConfig,
  play: (name: SoundName) => void,
  onResult: (hit: boolean, distance: number) => void,
) {
  return class MissionScene extends Phaser.Scene {
    private missionConfig = config

    private projectile!: Phaser.GameObjects.Container
    private rubberBand!: Phaser.GameObjects.Graphics
    private dragLine!: Phaser.GameObjects.Graphics
    private trajectoryDots: Phaser.GameObjects.GameObject[] = []
    private powerBar!: Phaser.GameObjects.Graphics
    private powerBarBg!: Phaser.GameObjects.Graphics
    private powerBarText!: Phaser.GameObjects.Text
    private countdownText!: Phaser.GameObjects.Text
    private dragHint!: Phaser.GameObjects.Text
    private scoreText!: Phaser.GameObjects.Text
    private shotsLeftText!: Phaser.GameObjects.Text

    private forkLeft = { x: 0, y: 0 }
    private forkRight = { x: 0, y: 0 }
    private startX = 0
    private startY = 0
    private slingshotX = 0
    private slingshotY = 0

    private targets: any = null
    private canDrag = false
    private isDragging = false
    private hasLaunched = false
    private hasScored = false
    private scoredHit = false
    private lastHitDistance = 0

    private vx = 0
    private vy = 0
    private currentRotation = 0
    private currentPull = 0
    private trailDots: Phaser.GameObjects.Arc[] = []
    private launchedAt = 0
    private countdownFinished = false
    private actionTakenThisRound = false
    private popupContainers: Phaser.GameObjects.Container[] = []
    private hasStarted = false
    private shotsUsed = 0

    constructor() {
      super(config.sceneKey)
    }

    create() {
      const w = this.cameras.main.width
      const h = this.cameras.main.height

      config.drawEnvironment(this, w, h)

      this.targets = config.setupTargets(this, w, h)

      this.drawSlingshotBase(w, h)
      this.createPowerBar(w, h)

      this.rubberBand = this.add.graphics().setDepth(55)
      this.dragLine = this.add.graphics().setDepth(50)
      this.trajectoryDots = []

      this.projectile = config.createProjectile(this)
      this.projectile.setDepth(60)
      const projY = this.slingshotY - 78
      this.projectile.setPosition(this.slingshotX, projY)
      this.startX = this.slingshotX
      this.startY = projY

      this.createDragHint()
      this.createScoreDisplay(w, h)
      this.createShotsLeftDisplay(w, h)
      this.createCountdown(w, h)
      this.startCountdown()

      this.input.on('pointerdown', this.onPointerDown, this)
      this.input.on('pointermove', this.onPointerMove, this)
      this.input.on('pointerup', this.onPointerUp, this)
    }

    update() {
      if (!this.hasLaunched) return

      const w = this.cameras.main.width
      const h = this.cameras.main.height

      this.projectile.x += this.vx
      this.projectile.y += this.vy
      this.vy += config.gravity
      this.currentRotation += this.vx * 0.04
      this.projectile.angle = this.currentRotation

      this.updateTrail()

      const update = config.updateMission(
        this,
        this.projectile.x,
        this.projectile.y,
        this.targets,
        w,
        h,
      )

      if (update.hit && !this.hasScored) {
        this.handleHit(update.hitDistance ?? 0)
        return
      }

      if (this.hasScored) return

      if (
        this.projectile.y > h + 60 ||
        this.projectile.x < -60 ||
        this.projectile.x > w + 60
      ) {
        this.handleMiss()
        return
      }

      if (this.launchedAt > 0) {
        const elapsed = this.time.now - this.launchedAt
        if (elapsed > STALL_TIMEOUT && Math.abs(this.vy) < 0.5) {
          this.handleMiss()
        }
      }
    }

    shutdown() {
      this.input.off('pointerdown', this.onPointerDown, this)
      this.input.off('pointermove', this.onPointerMove, this)
      this.input.off('pointerup', this.onPointerUp, this)
      this.time.removeAllEvents()
      this.clearTrail()
      this.trajectoryDots.forEach((d) => d.destroy())
      this.trajectoryDots = []
      this.popupContainers.forEach((c) => c.destroy())
      this.popupContainers = []
    }

    private drawSlingshotBase(w: number, h: number) {
      const sx = w / 2
      const sy = h - 100
      const sg = this.add.graphics()

      sg.fillStyle(0x2a1a0e, 0.3)
      sg.fillEllipse(sx + 2, sy + 10, 50, 12)

      sg.fillStyle(0x3E2723, 1)
      sg.fillRoundedRect(sx - 9, sy - 55, 18, 64, 6)

      sg.fillStyle(0x4E342E, 1)
      sg.fillRoundedRect(sx - 7, sy - 52, 14, 58, 5)

      sg.fillStyle(0x5D4037, 1)
      sg.fillRoundedRect(sx - 5, sy - 48, 10, 52, 4)

      sg.fillStyle(0x6D4C41, 1)
      sg.fillRoundedRect(sx - 3, sy - 44, 6, 46, 3)

      sg.fillStyle(0x795548, 1)
      sg.fillRoundedRect(sx - 14, sy - 72, 9, 24, 5)
      sg.fillRoundedRect(sx + 5, sy - 72, 9, 24, 5)

      sg.fillStyle(0x8D6E63, 1)
      sg.fillCircle(sx - 9.5, sy - 74, 5.5)
      sg.fillCircle(sx + 9.5, sy - 74, 5.5)

      sg.fillStyle(0x6D4C41, 1)
      sg.fillCircle(sx - 9.5, sy - 74, 2.8)
      sg.fillCircle(sx + 9.5, sy - 74, 2.8)

      sg.fillStyle(0x5D4037, 0.5)
      for (let i = 0; i < 3; i++) {
        sg.fillRect(sx - 6, sy - 40 + i * 14, 12, 1)
      }

      this.slingshotX = sx
      this.slingshotY = sy
      this.forkLeft = { x: sx - 9.5, y: sy - 74 }
      this.forkRight = { x: sx + 9.5, y: sy - 74 }
    }

    private createPowerBar(w: number, h: number) {
      const barX = w / 2 - 55
      const barY = this.slingshotY + 24
      const barW = 110
      const barH = 8

      this.powerBarBg = this.add.graphics().setDepth(70)
      this.powerBarBg.fillStyle(0x000000, 0.5)
      this.powerBarBg.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 5)
      this.powerBarBg.lineStyle(1, 0xffffff, 0.2)
      this.powerBarBg.strokeRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 5)
      this.powerBarBg.setAlpha(0)

      this.powerBar = this.add.graphics().setDepth(71)
      this.powerBar.setAlpha(0)

      this.powerBarText = this.add.text(w / 2, barY + barH + 10, '', {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(72).setAlpha(0)
    }

    private updatePowerBar(power: number) {
      const w = this.cameras.main.width
      const barX = w / 2 - 55
      const barY = this.slingshotY + 24
      const barW = 110
      const barH = 8

      if (power <= 0) {
        this.powerBar.clear()
        this.powerBar.setAlpha(0)
        this.powerBarBg.setAlpha(0)
        this.powerBarText.setAlpha(0)
        return
      }

      this.powerBarBg.setAlpha(1)
      this.powerBar.setAlpha(1)
      this.powerBarText.setAlpha(1)

      const fillW = barW * Math.min(1, power)

      let color: number
      if (power < 0.33) {
        const t = power / 0.33
        color = Phaser.Display.Color.GetColor(
          Math.floor(76 + (255 - 76) * t),
          Math.floor(175 + (193 - 175) * t),
          Math.floor(80 + (7 - 80) * t),
        )
      } else if (power < 0.66) {
        const t = (power - 0.33) / 0.33
        color = Phaser.Display.Color.GetColor(
          Math.floor(255 - 35 * t),
          Math.floor(193 - 50 * t),
          Math.floor(7 + 30 * t),
        )
      } else {
        color = 0xE53935
      }

      this.powerBar.clear()
      this.powerBar.fillStyle(color, 1)
      this.powerBar.fillRoundedRect(barX, barY, fillW, barH, 4)

      const pct = Math.round(power * 100)
      this.powerBarText.setText(`${pct}% POWER`)
      this.powerBarText.setColor(power > 0.7 ? '#ff5252' : '#ffffff')
    }

    private createDragHint() {
      this.dragHint = this.add.text(
        this.slingshotX,
        this.slingshotY - 38,
        '↑ DRAG',
        {
          fontSize: '13px',
          color: '#facc15',
          fontFamily: 'Cabin, sans-serif',
          fontStyle: 'bold',
        },
      ).setOrigin(0.5).setAlpha(0.8).setDepth(61)

      this.tweens.add({
        targets: this.dragHint,
        y: this.dragHint.y - 6,
        alpha: { from: 0.8, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    private createScoreDisplay(w: number, h: number) {
      this.scoreText = this.add.text(w - 16, 16, '', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(1, 0).setDepth(150).setAlpha(0)
    }

    private createShotsLeftDisplay(w: number, h: number) {
      const total = config.totalShots ?? (config.multiShot ? 6 : 1)
      this.shotsUsed = 0
      this.shotsLeftText = this.add.text(
        this.slingshotX,
        this.slingshotY + 50,
        '',
        {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        },
      ).setOrigin(0.5, 0).setDepth(61)
      this.updateShotsLeft()
    }

    private updateShotsLeft() {
      const total = config.totalShots ?? (config.multiShot ? 6 : 1)
      const remaining = total - this.shotsUsed
      this.shotsLeftText.setText(`${remaining} left`)
      if (remaining <= 1) {
        this.shotsLeftText.setColor('#ff5252')
      } else if (remaining <= 2) {
        this.shotsLeftText.setColor('#FFA000')
      } else {
        this.shotsLeftText.setColor('#ffffff')
      }
    }

    private showScore() {
      const score = config.getScore(this.targets)
      this.scoreText.setText(`Score: ${score}`)
      this.tweens.add({
        targets: this.scoreText,
        alpha: 1,
        duration: 300,
      })
    }

    private createCountdown(w: number, h: number) {
      this.countdownText = this.add.text(w / 2, h * 0.4, '', {
        fontSize: '80px',
        color: config.countdownColor ?? '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#2E7D32',
        strokeThickness: 6,
      }).setOrigin(0.5).setAlpha(0).setDepth(200)
    }

    private startCountdown() {
      this.countdownFinished = false
      this.canDrag = false

      if (this.hasStarted) {
        this.canDrag = true
        this.countdownFinished = true
        return
      }

      const counts = ['3', '2', '1', 'GO!']
      let i = 0

      const showNext = () => {
        if (i >= counts.length) {
          this.countdownText.setAlpha(0)
          this.canDrag = true
          this.countdownFinished = true
          this.hasStarted = true
          return
        }
        this.countdownText.setText(counts[i])
        this.countdownText.setScale(0.3).setAlpha(1)
        if (i === 3) {
          this.countdownText.setColor('#7CFC00')
        }
        this.tweens.add({
          targets: this.countdownText,
          scale: 1.2,
          duration: 200,
          ease: 'Back.easeOut',
          yoyo: true,
          onComplete: () => {
            i++
            this.time.delayedCall(120, showNext)
          },
        })
      }
      this.time.delayedCall(300, showNext)
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
      if (this.hasScored && !this.actionTakenThisRound) {
        this.actionTakenThisRound = true
        this.time.removeAllEvents()
        onResult(this.scoredHit, this.lastHitDistance)
        return
      }

      if (!this.canDrag || this.hasLaunched) return

      const dx = pointer.x - this.projectile.x
      const dy = pointer.y - this.projectile.y
      if (Math.sqrt(dx * dx + dy * dy) < 100) {
        this.isDragging = true
        if (this.dragHint) this.dragHint.setAlpha(0)
      }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
      if (!this.isDragging || this.hasLaunched) return

      const maxPull = config.maxPull
      let dx = pointer.x - this.startX
      let dy = pointer.y - this.startY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > maxPull) {
        dx = (dx / dist) * maxPull
        dy = (dy / dist) * maxPull
      }

      this.projectile.x = this.startX + dx
      this.projectile.y = this.startY + dy

      const pullFactor = dist / maxPull
      this.currentPull = pullFactor

      this.projectile.setScale(1 - pullFactor * 0.18, 1 + pullFactor * 0.15)

      this.updatePowerBar(pullFactor)

      this.drawRubberBand()
      this.drawDragArrow()
      this.drawTrajectory()
    }

    private drawRubberBand() {
      this.rubberBand.clear()
      const fl = this.forkLeft
      const fr = this.forkRight
      const px = this.projectile.x
      const py = this.projectile.y

      this.rubberBand.lineStyle(6, 0x5D4037, 1)
      this.rubberBand.lineBetween(fl.x, fl.y, px - 10, py - 10)
      this.rubberBand.lineBetween(fr.x, fr.y, px + 10, py - 10)

      this.rubberBand.lineStyle(3, 0x8D6E63, 0.6)
      this.rubberBand.lineBetween(fl.x, fl.y, px - 10, py - 10)
      this.rubberBand.lineBetween(fr.x, fr.y, px + 10, py - 10)
    }

    private drawDragArrow() {
      this.dragLine.clear()

      this.dragLine.lineStyle(4, 0xff5252, 0.9)
      this.dragLine.lineBetween(
        this.startX, this.startY,
        this.projectile.x, this.projectile.y,
      )

      this.dragLine.lineStyle(6, 0xffffff, 0.3)
      this.dragLine.lineBetween(
        this.startX, this.startY,
        this.projectile.x, this.projectile.y,
      )

      const arrowSize = 12
      const ang = Math.atan2(
        this.projectile.y - this.startY,
        this.projectile.x - this.startX,
      )
      const tipX = this.projectile.x + Math.cos(ang) * 5
      const tipY = this.projectile.y + Math.sin(ang) * 5
      this.dragLine.fillStyle(0xff5252, 0.9)
      this.dragLine.fillTriangle(
        tipX, tipY,
        tipX - Math.cos(ang - 0.5) * arrowSize,
        tipY - Math.sin(ang - 0.5) * arrowSize,
        tipX - Math.cos(ang + 0.5) * arrowSize,
        tipY - Math.sin(ang + 0.5) * arrowSize,
      )
    }

    private drawTrajectory() {
      this.trajectoryDots.forEach((d) => d.destroy())
      this.trajectoryDots = []

      const dx = this.projectile.x - this.startX
      const dy = this.projectile.y - this.startY
      const pwr = config.power
      const tvx = -dx * pwr
      const tvy = -dy * pwr

      for (let t = 0; t < 40; t++) {
        const time = t * 6
        const px = this.startX + tvx * (time / 16.67)
        const py =
          this.startY + tvy * (time / 16.67) +
          0.5 * config.gravity * (time / 16.67) * (time / 16.67)
        const alpha = Math.max(0, 0.45 - t * 0.012)
        const dot = this.add.circle(px, py, 3, 0xff5252, alpha)
        this.trajectoryDots.push(dot)
      }
    }

    private onPointerUp() {
      if (!this.isDragging || this.hasLaunched) return
      this.isDragging = false
      this.hasLaunched = true
      this.canDrag = false
      this.launchedAt = this.time.now

      this.dragLine.clear()
      this.rubberBand.clear()
      this.trajectoryDots.forEach((d) => d.destroy())
      this.trajectoryDots = []
      this.updatePowerBar(0)

      play('launch')

      const dx = this.projectile.x - this.startX
      const dy = this.projectile.y - this.startY
      const pwr = config.power
      this.vx = -dx * pwr
      this.vy = -dy * pwr

      this.tweens.add({
        targets: this.projectile,
        scaleX: 0.8,
        scaleY: 1.25,
        duration: 60,
        yoyo: true,
        ease: 'Power2',
      })

      this.tweens.add({
        targets: this.projectile,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        delay: 60,
        ease: 'Elastic.easeOut',
      })
    }

    private updateTrail() {
      if (this.trailDots.length < TRAIL_MAX) {
        const dot = this.add.circle(
          this.projectile.x, this.projectile.y,
          TRAIL_RADIUS, 0x7CFC00, 0.7,
        )
        dot.setDepth(55)
        this.trailDots.push(dot)
      } else {
        const oldest = this.trailDots.shift()
        oldest?.destroy()
        const dot = this.add.circle(
          this.projectile.x, this.projectile.y,
          TRAIL_RADIUS, 0x7CFC00, 0.7,
        )
        dot.setDepth(55)
        this.trailDots.push(dot)
      }

      for (let i = 0; i < this.trailDots.length; i++) {
        const f = (i + 1) / this.trailDots.length
        this.trailDots[i].setAlpha(f * 0.6)
        this.trailDots[i].setScale(f * 0.9 + 0.1)
      }
    }

    private clearTrail() {
      this.trailDots.forEach((d) => d.destroy())
      this.trailDots = []
    }

    private handleHit(rawDistance: number) {
      this.hasScored = true
      this.scoredHit = true
      this.shotsUsed++
      this.vx = 0
      this.vy = 0

      const hitResult = config.onHit(
        this, this.targets,
        this.projectile.x, this.projectile.y,
      )
      this.lastHitDistance = hitResult.distance

      play('hit')
      this.clearTrail()

      this.cameras.main.shake(300, 0.015)

      this.tweens.add({
        targets: this.projectile,
        scaleX: 1, scaleY: 1, angle: 0,
        duration: 250,
        ease: 'Back.easeOut',
      })

      if (hitResult.completed) {
        this.cameras.main.flash(400, 255, 255, 255)
        this.spawnHitParticles()
        this.time.delayedCall(200, () => this.spawnConfetti())
      }

      if (hitResult.completed) {
        const hitLabel = 'PERFECT!'
        const hitText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height * 0.38,
          hitLabel,
          {
            fontSize: '44px',
            color: '#FFD700',
            fontFamily: 'Poppins, sans-serif',
            fontStyle: 'bold',
            stroke: '#1B5E20',
            strokeThickness: 5,
          },
        ).setOrigin(0.5).setDepth(150).setAlpha(0)

        this.tweens.add({
          targets: hitText,
          alpha: 1,
          y: hitText.y - 25,
          scaleX: { from: 0.5, to: 1 },
          scaleY: { from: 0.5, to: 1 },
          duration: 400,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: hitText,
              alpha: 0,
              y: hitText.y - 10,
              duration: 600,
              delay: 600,
            })
          },
        })
      }

      this.showScore()
      this.updateShotsLeft()

      if (hitResult.popups && hitResult.popups.length > 0) {
        hitResult.popups.forEach((popup, i) => {
          this.time.delayedCall(i * 500, () => this.showPopup(popup))
        })
      }

      const shouldContinue = config.multiShotOnHit && !config.isComplete(this.targets)
      if (shouldContinue) {
        this.time.delayedCall(POST_ACTION_DELAY, () => {
          if (!this.hasScored) return
          this.time.removeAllEvents()
          this.beginResetForNextShot()
        })
      } else {
        this.time.delayedCall(POST_ACTION_DELAY, () => {
          this.time.removeAllEvents()
          onResult(true, this.lastHitDistance)
        })
      }
    }

    private handleMiss() {
      if (this.hasScored) return
      this.hasScored = true
      this.scoredHit = false
      this.lastHitDistance = 0
      this.shotsUsed++
      this.vx = 0
      this.vy = 0

      config.onMiss(this, this.targets)

      play('miss')
      this.clearTrail()

      const w = this.cameras.main.width
      const h = this.cameras.main.height
      const cx = w / 2
      const cy = h / 2

      this.cameras.main.shake(300, 0.02)

      const overlay = this.add.rectangle(cx, cy, w, h, 0x000000, 0).setDepth(200)
      this.tweens.add({
        targets: overlay,
        alpha: 0.85,
        duration: 400,
        ease: 'Power2',
      })

      for (let i = 0; i < 2; i++) {
        const ring = this.add.graphics().setDepth(201)
        ring.lineStyle(3 - i * 0.5, 0x7CFC00, 0.6)
        ring.strokeCircle(cx, cy, 10)
        ring.setAlpha(0)

        this.tweens.add({
          targets: ring,
          alpha: 0.7,
          duration: 200,
          delay: i * 150,
          yoyo: true,
          hold: 80,
        })
        this.tweens.add({
          targets: ring,
          scaleX: 12 + i * 3,
          scaleY: 12 + i * 3,
          duration: 700,
          delay: i * 150,
          ease: 'Power2',
        })
      }

      const missText = this.add.text(cx, cy, 'MISS', {
        fontSize: '56px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#7CFC00',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(202).setAlpha(0).setScale(0.5)

      this.tweens.add({
        targets: missText,
        alpha: 0.9,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      })

      this.updateShotsLeft()

      const missFadeDelay = 300
      this.time.delayedCall(missFadeDelay, () => {
        this.tweens.add({
          targets: missText,
          alpha: 0,
          duration: 300,
        })
        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 300,
        })
        for (let i = 0; i < 2; i++) {
          const rings = this.children.list.filter(
            (c) => c instanceof Phaser.GameObjects.Graphics && (c as any).depth === 201
          )
        }
      })

      if (config.multiShot) {
        this.time.delayedCall(MISS_ACTION_DELAY, () => {
          this.time.removeAllEvents()
          this.beginResetForNextShot()
        })
      } else {
        this.time.delayedCall(MISS_ACTION_DELAY, () => {
          this.time.removeAllEvents()
          onResult(true, 0)
        })
      }
    }

    private beginResetForNextShot() {
      this.children.each((child) => {
        if (
          child !== this.projectile &&
          child !== this.rubberBand &&
          child !== this.dragLine &&
          child !== this.powerBar &&
          child !== this.powerBarBg &&
          child !== this.powerBarText &&
          child !== this.countdownText &&
          child !== this.dragHint &&
          child !== this.scoreText &&
          child !== this.shotsLeftText &&
          !this.popupContainers.includes(child as Phaser.GameObjects.Container) &&
          (child as any).depth >= 100
        ) {
          child.destroy()
        }
      })

      this.clearTrail()
      this.trajectoryDots.forEach((d) => d.destroy())
      this.trajectoryDots = []

      this.hasLaunched = false
      this.hasScored = false
      this.scoredHit = false
      this.actionTakenThisRound = false
      this.vx = 0
      this.vy = 0
      this.currentRotation = 0
      this.currentPull = 0
      this.launchedAt = 0

      this.projectile.setPosition(this.startX, this.startY)
      this.projectile.setScale(1)
      this.projectile.setAngle(0)

      if (config.isComplete(this.targets)) {
        this.canDrag = false
        this.showMissionComplete()
        return
      }

      this.canDrag = false
      this.startCountdown()
    }

    private showMissionComplete() {
      const w = this.cameras.main.width
      const h = this.cameras.main.height
      const cx = w / 2
      const cy = h * 0.45
      const score = config.getScore(this.targets)

      const overlay = this.add.rectangle(cx, cy, w, h, 0x000000, 0).setDepth(200)
      this.tweens.add({
        targets: overlay,
        alpha: 0.88,
        duration: 500,
        ease: 'Power2',
      })

      const label = this.add.text(cx, cy - 40, 'MISSION COMPLETE', {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#1B5E20',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(210).setAlpha(0).setScale(0.5)

      const scoreLabel = this.add.text(cx, cy + 20, `Score: ${score}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(210).setAlpha(0)

      const tapLabel = this.add.text(cx, cy + 65, 'Tap to continue', {
        fontSize: '14px',
        color: '#cccccc',
        fontFamily: 'Poppins, sans-serif',
      }).setOrigin(0.5).setDepth(210).setAlpha(0)

      this.tweens.add({
        targets: label,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut',
      })

      this.tweens.add({
        targets: [scoreLabel, tapLabel],
        alpha: 1,
        duration: 400,
        delay: 300,
      })

      this.time.delayedCall(POST_ACTION_DELAY + 500, () => {
        this.input.once('pointerdown', () => {
          this.time.removeAllEvents()
          onResult(true, this.lastHitDistance)
        })
      })
    }

    private spawnHitParticles() {
      const colors = [0xffd700, 0x2E7D32, 0x7CFC00, 0xffffff, 0x4CAF50]
      const px = this.projectile.x
      const py = this.projectile.y
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 8
        const p = this.add.circle(
          px, py,
          2 + Math.random() * 4,
          colors[i % colors.length],
          1,
        )
        p.setDepth(100)
        this.tweens.add({
          targets: p,
          x: p.x + Math.cos(angle) * speed * 18,
          y: p.y + Math.sin(angle) * speed * 18,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 350 + Math.random() * 250,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        })
      }
    }

    private spawnConfetti() {
      const colors = [0xffd700, 0x2E7D32, 0x7CFC00, 0xffffff, 0x87CEEB, 0xFFA000]
      const w = this.cameras.main.width
      const h = this.cameras.main.height
      for (let i = 0; i < 40; i++) {
        const x = w / 2 + (Math.random() - 0.5) * 300
        const y = -25
        const p = this.add.rectangle(
          x, y,
          5 + Math.random() * 6,
          5 + Math.random() * 6,
          colors[i % colors.length],
        )
        p.setDepth(100)
        p.setAngle(Math.random() * 360)
        this.tweens.add({
          targets: p,
          x: x + (Math.random() - 0.5) * 200,
          y: h + 40,
          angle: p.angle + 360 + Math.random() * 540,
          alpha: { from: 1, to: 0.1 },
          duration: 1200 + Math.random() * 700,
          ease: 'Power1',
          onComplete: () => p.destroy(),
        })
      }
    }

    private showPopup(popup: PopupInfo) {
      const h = this.cameras.main.height
      const w = this.cameras.main.width

      const boxW = Math.min(260, w * 0.45)
      const boxH = 70
      const margin = 8
      const startX = w - 14
      const startY = 14

      this.popupContainers.forEach((c, i) => {
        const targetY = startY + (i + 1) * (boxH + margin)
        this.tweens.add({
          targets: c,
          y: targetY,
          duration: 250,
          ease: 'Power2',
        })
      })

      const bg = this.add.graphics()
      const accent = popup.color ?? 0x7CFC00
      bg.fillStyle(0x000000, 0.85)
      bg.fillRoundedRect(-boxW, 0, boxW, boxH, 10)
      bg.lineStyle(2, accent, 0.9)
      bg.strokeRoundedRect(-boxW, 0, boxW, boxH, 10)
      bg.fillStyle(accent, 0.08)
      bg.fillRoundedRect(-boxW, 0, boxW, boxH, 10)

      const title = this.add.text(-boxW + 14, 10, popup.title, {
        fontSize: '14px',
        color: '#' + accent.toString(16).padStart(6, '0'),
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      })

      const body = this.add.text(-boxW + 14, 30, popup.body, {
        fontSize: '11px',
        color: '#dddddd',
        fontFamily: 'Poppins, sans-serif',
        wordWrap: { width: boxW - 28 },
        lineSpacing: 2,
      })

      const container = this.add.container(startX, startY, [bg, title, body])
      container.setDepth(300)
      container.setAlpha(0)
      container.setScale(0.85)

      this.tweens.add({
        targets: container,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        ease: 'Back.easeOut',
      })

      this.popupContainers.push(container)

      this.time.delayedCall(4500, () => {
        if (!container.active) return
        this.tweens.add({
          targets: container,
          alpha: 0,
          x: startX + 50,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            const idx = this.popupContainers.indexOf(container)
            if (idx >= 0) this.popupContainers.splice(idx, 1)
            container.destroy()
          },
        })
      })
    }
  }
}
