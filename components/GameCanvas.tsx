'use client'

import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { useAudio, type SoundName } from '@/components/AudioManager'

interface GameProps {
  onResult: (hit: boolean, distance: number) => void
}

export default function GameCanvas({ onResult }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const { play } = useAudio()
  // Keep latest play in a ref so the scene (created once) always calls the current closure
  const playRef = useRef(play)
  useEffect(() => { playRef.current = play }, [play])

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const w = containerRef.current.clientWidth
    const h = containerRef.current.clientHeight

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: containerRef.current,
      width: w,
      height: h,
      backgroundColor: 'transparent',
      transparent: true,
      scene: createScene(onResult, (n: SoundName) => playRef.current(n)),
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: { antialias: true, pixelArt: false },
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [onResult])

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ touchAction: 'none' }}
    />
  )
}

function createScene(onResult: (hit: boolean, distance: number) => void, play: (name: SoundName) => void) {
  return class extends Phaser.Scene {
    private zero!: Phaser.GameObjects.Container
    private slotX = 0
    private slotY = 0
    private canDrag = false
    private isDragging = false
    private hasLaunched = false
    private hasScored = false
    private zeroStartX = 0
    private zeroStartY = 0
    private slingshotX = 0
    private slingshotY = 0
    private trajectoryDots: Phaser.GameObjects.GameObject[] = []
    private dragLine!: Phaser.GameObjects.Graphics
    private countdownText!: Phaser.GameObjects.Text
    private vx = 0
    private vy = 0
    private gravity = 0.18
    private zeroRotation = 0
    private slotGlow!: Phaser.GameObjects.Graphics
    private hitZone = 70
    private trailDots: Phaser.GameObjects.Arc[] = []
    private rubberBand!: Phaser.GameObjects.Graphics
    private slingshotForkLeft = { x: 0, y: 0 }
    private slingshotForkRight = { x: 0, y: 0 }
    private powerBar!: Phaser.GameObjects.Graphics
    private powerBarBg!: Phaser.GameObjects.Graphics
    private powerBarText!: Phaser.GameObjects.Text
    private currentPull = 0
    private lastHitDistance = 0
    private scoredHit = false

    constructor() { super('MainGame') }

    create() {
      const w = this.cameras.main.width
      const h = this.cameras.main.height
      const isMobile = Math.min(w, h) < 600

      this.gravity = isMobile ? 0.26 : 0.18
      this.hitZone = isMobile ? 90 : 70

      this.slingshotX = w / 2
      this.slingshotY = h - 100
      this.slotX = w / 2
      this.slotY = h * 0.12

      this.drawSpotlights(w, h)
      this.drawLogo(w, h)
      this.drawSlingshotBase()
      this.createPowerBar(w, h)
      this.rubberBand = this.add.graphics().setDepth(55)
      this.createZero()
      this.dragLine = this.add.graphics().setDepth(50)
      this.createCountdown()
      this.startCountdown()

      this.input.on('pointerdown', this.onPointerDown, this)
      this.input.on('pointermove', this.onPointerMove, this)
      this.input.on('pointerup', this.onPointerUp, this)
    }

    private drawSpotlights(w: number, h: number) {
      const tx = this.slotX
      const ty = this.slotY
      const spotY = h * 0.5

      const spot1 = this.add.graphics().setDepth(-2)
      spot1.fillStyle(0xffffff, 0.03)
      spot1.fillTriangle(tx - 40, spotY, tx - 15, ty - 30, tx - 65, ty - 30)
      this.tweens.add({
        targets: spot1,
        alpha: { from: 0.6, to: 1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      const spot2 = this.add.graphics().setDepth(-2)
      spot2.fillStyle(0xffffff, 0.03)
      spot2.fillTriangle(tx + 40, spotY, tx + 15, ty - 30, tx + 65, ty - 30)
      this.tweens.add({
        targets: spot2,
        alpha: { from: 0.6, to: 1 },
        duration: 2000,
        delay: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      const spotGlow = this.add.graphics().setDepth(-1)
      spotGlow.fillStyle(0x7CFC00, 0.05)
      spotGlow.fillCircle(tx, ty, 80)
      this.tweens.add({
        targets: spotGlow,
        alpha: { from: 0.3, to: 0.7 },
        scaleX: { from: 0.9, to: 1.15 },
        scaleY: { from: 0.9, to: 1.15 },
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    private drawLogo(w: number, h: number) {
      const tx = this.slotX
      const ty = this.slotY
      const isMobile = Math.min(w, h) < 600
      const s = isMobile ? 1.35 : 1

      const outerGlow = this.add.graphics()
      outerGlow.fillStyle(0xffffff, 0.08)
      outerGlow.fillRoundedRect(tx - 165 * s, ty - 72 * s, 330 * s, 144 * s, 28)

      const platform = this.add.graphics()
      platform.fillStyle(0xffffff, 0.98)
      platform.fillRoundedRect(tx - 148 * s, ty - 56 * s, 296 * s, 112 * s, 20)
      platform.lineStyle(5, 0x2E7D32, 1)
      platform.strokeRoundedRect(tx - 148 * s, ty - 56 * s, 296 * s, 112 * s, 20)

      platform.fillStyle(0x2E7D32, 1)
      platform.fillRoundedRect(tx - 142 * s, ty - 50 * s, 284 * s, 100 * s, 16)

      this.add.text(tx - 72 * s, ty, '18', {
        fontSize: `${Math.round(56 * s)}px`,
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      this.add.text(tx + 72 * s, ty, 'DC', {
        fontSize: `${Math.round(48 * s)}px`,
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      const slotSize = 28 * s
      const slotBg = this.add.graphics()
      slotBg.fillStyle(0x1B5E20, 0.7)
      slotBg.fillRoundedRect(tx - slotSize, ty - slotSize, slotSize * 2, slotSize * 2, 12 * s)
      slotBg.lineStyle(Math.round(4 * s), 0x7CFC00, 0.6)
      slotBg.strokeRoundedRect(tx - slotSize, ty - slotSize, slotSize * 2, slotSize * 2, 12 * s)

      this.slotGlow = this.add.graphics()
      this.slotGlow.fillStyle(0x7CFC00, 0.12)
      this.slotGlow.fillCircle(tx + 2, ty, 44 * s)
      this.tweens.add({
        targets: this.slotGlow,
        alpha: { from: 0.3, to: 1 },
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      if (isMobile) {
        const pulseRing = this.add.graphics()
        pulseRing.lineStyle(3, 0x7CFC00, 0.7)
        pulseRing.strokeCircle(tx + 2, ty, 55)
        pulseRing.setAlpha(0)
        this.tweens.add({
          targets: pulseRing,
          alpha: { from: 0.8, to: 0 },
          scaleX: { from: 1, to: 1.8 },
          scaleY: { from: 1, to: 1.8 },
          duration: 1200,
          repeat: -1,
          ease: 'Power2',
        })

        const outerRing = this.add.graphics()
        outerRing.lineStyle(2, 0x7CFC00, 0.35)
        outerRing.strokeCircle(tx + 2, ty, 70)
        this.tweens.add({
          targets: outerRing,
          alpha: { from: 0.2, to: 0.6 },
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        })
      }

      this.add.text(tx + 2, ty, '?', {
        fontSize: `${Math.round(32 * s)}px`,
        color: '#7CFC00',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0.8)

      const arrow = this.add.graphics()
      arrow.fillStyle(0x7CFC00, 0.4)
      arrow.fillTriangle(tx + 2, ty + 36 * s, tx - 8 * s, ty + 48 * s, tx + 12 * s, ty + 48 * s)
      this.tweens.add({ targets: arrow, y: ty + 52 * s, duration: 600, yoyo: true, repeat: -1 })

      this.slotX = tx + 2
      this.slotY = ty
    }

    private drawSlingshotBase() {
      const sg = this.add.graphics()
      const sx = this.slingshotX
      const sy = this.slingshotY

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

      this.slingshotForkLeft = { x: sx - 9.5, y: sy - 74 }
      this.slingshotForkRight = { x: sx + 9.5, y: sy - 74 }
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
          Math.floor(80 + (7 - 80) * t)
        )
      } else if (power < 0.66) {
        const t = (power - 0.33) / 0.33
        color = Phaser.Display.Color.GetColor(
          Math.floor(255 - 35 * t),
          Math.floor(193 - 50 * t),
          Math.floor(7 + 30 * t)
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

    private createZero() {
      const glow = this.add.graphics()
      glow.fillStyle(0x7CFC00, 0.25)
      glow.fillCircle(0, 0, 42)

      const outer = this.add.graphics()
      outer.fillStyle(0x2E7D32, 1)
      outer.fillCircle(0, 0, 30)
      outer.lineStyle(5, 0xffffff, 1)
      outer.strokeCircle(0, 0, 30)

      const inner = this.add.graphics()
      inner.fillStyle(0x1B5E20, 1)
      inner.fillCircle(0, 0, 18)
      inner.lineStyle(3, 0x7CFC00, 0.6)
      inner.strokeCircle(0, 0, 18)

      const t = this.add.text(0, 0, '0', {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      const shine = this.add.graphics()
      shine.fillStyle(0xffffff, 0.4)
      shine.fillCircle(-8, -10, 5)

      this.zero = this.add.container(this.slingshotX, this.slingshotY - 78, [glow, outer, inner, shine, t])
      this.zero.setDepth(60)
      this.zeroStartX = this.zero.x
      this.zeroStartY = this.zero.y

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.5, to: 1 },
        duration: 700,
        yoyo: true,
        repeat: -1,
      })
    }

    private createCountdown() {
      this.countdownText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.4,
        '',
        {
          fontSize: '80px',
          color: '#ffffff',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
          stroke: '#2E7D32',
          strokeThickness: 6,
        }
      ).setOrigin(0.5).setAlpha(0).setDepth(200)
    }

    private startCountdown() {
      const counts = ['3', '2', '1', 'GO!']
      let i = 0
      const showNext = () => {
        if (i >= counts.length) {
          this.countdownText.setAlpha(0)
          this.canDrag = true
          return
        }
        this.countdownText.setText(counts[i])
        this.countdownText.setScale(0.3).setAlpha(1)
        if (i === 3) this.countdownText.setColor('#7CFC00')
        this.tweens.add({
          targets: this.countdownText,
          scale: 1.2,
          duration: 200,
          ease: 'Back.easeOut',
          yoyo: true,
          onComplete: () => { i++; this.time.delayedCall(120, showNext) },
        })
      }
      this.time.delayedCall(300, showNext)
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
      if (this.hasScored) {
        this.time.removeAllEvents()
        onResult(this.scoredHit, this.lastHitDistance)
        return
      }
      if (!this.canDrag || this.hasLaunched) return
      const dx = pointer.x - this.zero.x
      const dy = pointer.y - this.zero.y
      if (Math.sqrt(dx * dx + dy * dy) < 80) this.isDragging = true
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
      if (!this.isDragging || this.hasLaunched) return
      const maxPull = 130
      let dx = pointer.x - this.zeroStartX
      let dy = pointer.y - this.zeroStartY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > maxPull) { dx = (dx / dist) * maxPull; dy = (dy / dist) * maxPull }

      this.zero.x = this.zeroStartX + dx
      this.zero.y = this.zeroStartY + dy

      const pullFactor = dist / maxPull
      this.currentPull = pullFactor

      const stretchX = 1 - pullFactor * 0.18
      const stretchY = 1 + pullFactor * 0.15
      this.zero.setScale(stretchX, stretchY)

      this.updatePowerBar(pullFactor)

      this.rubberBand.clear()
      const fl = this.slingshotForkLeft
      const fr = this.slingshotForkRight
      this.rubberBand.lineStyle(6, 0x5D4037, 1)
      this.rubberBand.lineBetween(fl.x, fl.y, this.zero.x - 10, this.zero.y - 10)
      this.rubberBand.lineBetween(fr.x, fr.y, this.zero.x + 10, this.zero.y - 10)
      this.rubberBand.lineStyle(3, 0x8D6E63, 0.6)
      this.rubberBand.lineBetween(fl.x, fl.y, this.zero.x - 10, this.zero.y - 10)
      this.rubberBand.lineBetween(fr.x, fr.y, this.zero.x + 10, this.zero.y - 10)

      this.dragLine.clear()

      this.dragLine.lineStyle(4, 0xff5252, 0.9)
      this.dragLine.lineBetween(this.zeroStartX, this.zeroStartY, this.zero.x, this.zero.y)

      this.dragLine.lineStyle(6, 0xffffff, 0.3)
      this.dragLine.lineBetween(this.zeroStartX, this.zeroStartY, this.zero.x, this.zero.y)

      const arrowSize = 12
      const ang = Math.atan2(this.zero.y - this.zeroStartY, this.zero.x - this.zeroStartX)
      const tipX = this.zero.x + Math.cos(ang) * 5
      const tipY = this.zero.y + Math.sin(ang) * 5
      this.dragLine.fillStyle(0xff5252, 0.9)
      this.dragLine.fillTriangle(
        tipX, tipY,
        tipX - Math.cos(ang - 0.5) * arrowSize, tipY - Math.sin(ang - 0.5) * arrowSize,
        tipX - Math.cos(ang + 0.5) * arrowSize, tipY - Math.sin(ang + 0.5) * arrowSize
      )

      this.drawTrajectory()
    }

    private drawTrajectory() {
      this.trajectoryDots.forEach((d) => d.destroy())
      this.trajectoryDots = []
      const dx = this.zero.x - this.zeroStartX
      const dy = this.zero.y - this.zeroStartY
      const power = (Math.min(this.cameras.main.width, this.cameras.main.height) < 600) ? 0.28 : 0.22
      const vx = -dx * power
      const vy = -dy * power
      for (let t = 0; t < 40; t++) {
        const time = t * 6
        const px = this.zeroStartX + vx * (time / 16.67)
        const py = this.zeroStartY + vy * (time / 16.67) + 0.5 * this.gravity * (time / 16.67) * (time / 16.67)
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
      this.dragLine.clear()
      this.rubberBand.clear()
      this.trajectoryDots.forEach((d) => d.destroy())
      this.trajectoryDots = []
      this.updatePowerBar(0)

      play('launch')

      const dx = this.zero.x - this.zeroStartX
      const dy = this.zero.y - this.zeroStartY
      const power = (Math.min(this.cameras.main.width, this.cameras.main.height) < 600) ? 0.28 : 0.22
      this.vx = -dx * power
      this.vy = -dy * power

      this.tweens.add({
        targets: this.zero,
        scaleX: 0.8,
        scaleY: 1.25,
        duration: 60,
        yoyo: true,
        ease: 'Power2',
      })

      this.tweens.add({
        targets: this.zero,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        delay: 60,
        ease: 'Elastic.easeOut',
      })
    }

    update() {
      if (!this.hasLaunched || this.hasScored) return

      this.zero.x += this.vx
      this.zero.y += this.vy
      this.vy += this.gravity
      this.zeroRotation += this.vx * 0.04
      this.zero.angle = this.zeroRotation

      const dx = this.zero.x - this.slotX
      const dy = this.zero.y - this.slotY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 140 && this.vy > 0) {
        const pullStrength = Math.max(0, 1 - dist / 140) * 0.05
        this.vx -= dx * pullStrength
        this.vy -= dy * pullStrength
      }

      if (this.trailDots.length < 25) {
        const dot = this.add.circle(this.zero.x, this.zero.y, 4, 0x7CFC00, 0.7)
        dot.setDepth(55)
        this.trailDots.push(dot)
      } else {
        const oldest = this.trailDots.shift()
        oldest?.destroy()
        const dot = this.add.circle(this.zero.x, this.zero.y, 4, 0x7CFC00, 0.7)
        dot.setDepth(55)
        this.trailDots.push(dot)
      }
      this.trailDots.forEach((d, i) => {
        const f = (i + 1) / this.trailDots.length
        d.setAlpha(f * 0.6)
        d.setScale(f * 0.9 + 0.1)
      })

      if (dist < this.hitZone && this.vy > 0) {
        this.onHit(dist)
        return
      }

      const h = this.cameras.main.height
      const w = this.cameras.main.width
      if (this.zero.y > h + 60 || this.zero.x < -60 || this.zero.x > w + 60) {
        this.onMiss()
        return
      }
    }

    private onHit(hitDistance: number) {
      this.hasScored = true
      this.scoredHit = true
      this.lastHitDistance = hitDistance
      this.vx = 0
      this.vy = 0

      play('hit')

      this.trailDots.forEach((d) => d.destroy())
      this.trailDots = []

      this.cameras.main.flash(400, 255, 255, 255)
      this.cameras.main.shake(300, 0.015)

      this.tweens.add({
        targets: this.zero,
        x: this.slotX,
        y: this.slotY,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        duration: 250,
        ease: 'Back.easeOut',
      })

      this.tweens.add({
        targets: this.slotGlow,
        alpha: 1,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: 500,
        ease: 'Power2',
      })

      this.spawnHitParticles()

      this.time.delayedCall(200, () => this.spawnConfetti())

      const hitText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.38, 'PERFECT!', {
        fontSize: '44px',
        color: '#FFD700',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#1B5E20',
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(150).setAlpha(0)

      this.tweens.add({
        targets: hitText,
        alpha: 1,
        y: hitText.y - 25,
        scaleX: { from: 0.5, to: 1 },
        scaleY: { from: 0.5, to: 1 },
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({ targets: hitText, alpha: 0, y: hitText.y - 10, duration: 600, delay: 600 })
        },
      })

      this.time.delayedCall(2200, () => onResult(true, hitDistance))
    }

    private onMiss() {
      this.hasScored = true
      this.scoredHit = false
      this.lastHitDistance = 0
      this.vx = 0
      this.vy = 0

      play('miss')

      this.trailDots.forEach((d) => d.destroy())
      this.trailDots = []

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

      this.time.delayedCall(1200, () => onResult(false, 0))
    }

    private spawnHitParticles() {
      const colors = [0xFFD700, 0x2E7D32, 0x7CFC00, 0xffffff, 0x4CAF50]
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 8
        const p = this.add.circle(this.slotX, this.slotY, 2 + Math.random() * 4, colors[i % colors.length], 1)
        p.setDepth(100)
        this.tweens.add({
          targets: p,
          x: p.x + Math.cos(angle) * speed * 18,
          y: p.y + Math.sin(angle) * speed * 18,
          alpha: 0, scaleX: 0, scaleY: 0,
          duration: 350 + Math.random() * 250,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        })
      }
    }

    private spawnConfetti() {
      const colors = [0xFFD700, 0x2E7D32, 0x7CFC00, 0xffffff, 0x87CEEB, 0xFFA000]
      for (let i = 0; i < 40; i++) {
        const x = this.cameras.main.width / 2 + (Math.random() - 0.5) * 300
        const y = -25
        const p = this.add.rectangle(x, y, 5 + Math.random() * 6, 5 + Math.random() * 6, colors[i % colors.length])
        p.setDepth(100)
        p.setAngle(Math.random() * 360)
        this.tweens.add({
          targets: p,
          x: x + (Math.random() - 0.5) * 200,
          y: this.cameras.main.height + 40,
          angle: p.angle + 360 + Math.random() * 540,
          alpha: { from: 1, to: 0.1 },
          duration: 1200 + Math.random() * 700,
          ease: 'Power1',
          onComplete: () => p.destroy(),
        })
      }
    }
  }
}
