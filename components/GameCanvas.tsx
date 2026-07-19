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
    private arrow!: Phaser.GameObjects.Container
    private arrowStartX = 0
    private arrowStartY = 0
    private slotX = 0
    private slotY = 0
    private canDrag = false
    private isDragging = false
    private hasLaunched = false
    private hasScored = false
    private isResetting = false
    private slingshotX = 0
    private slingshotY = 0
    private trajectoryDots: Phaser.GameObjects.GameObject[] = []
    private dragLine!: Phaser.GameObjects.Graphics
    private countdownText!: Phaser.GameObjects.Text
    private vx = 0
    private vy = 0
    private gravity = 0.18
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

    // Reveal scene objects
    private cover!: Phaser.GameObjects.Container
    private ropes: Phaser.GameObjects.Graphics[] = []
    private targetContainer!: Phaser.GameObjects.Container
    private logoGroup!: Phaser.GameObjects.Container
    private releaseLine!: Phaser.GameObjects.Graphics
    private instructionText!: Phaser.GameObjects.Text
    private clothStrips: Phaser.GameObjects.Graphics[] = []

    constructor() { super('MainGame') }

    preload() {
      this.load.image('logo', '/images/logo.png')
    }

    create() {
      const w = this.cameras.main.width
      const h = this.cameras.main.height
      const isMobile = Math.min(w, h) < 600

      this.gravity = isMobile ? 0.26 : 0.18
      this.hitZone = isMobile ? 90 : 70

      this.slingshotX = w / 2
      this.slingshotY = h - 100
      this.slotX = w * 0.68
      this.slotY = h * 0.30

      this.drawLogoAndCover(w, h, isMobile)
      this.drawRopes(w, h, isMobile)
      this.drawRopeTarget(w, h, isMobile)
      this.drawInstructions(w, h, isMobile)
      this.drawSlingshotBase()
      this.createPowerBar(w, h)
      this.rubberBand = this.add.graphics().setDepth(55)
      this.createArrow()
      this.dragLine = this.add.graphics().setDepth(50)
      this.createCountdown()
      this.startCountdown()

      this.input.on('pointerdown', this.onPointerDown, this)
      this.input.on('pointermove', this.onPointerMove, this)
      this.input.on('pointerup', this.onPointerUp, this)
    }

    // ─── Logo + Fabric Cover ───

    private drawLogoAndCover(w: number, h: number, isMobile: boolean) {
      const cx = w / 2
      const logoY = Math.max(104, h * 0.18)
      const s = isMobile ? 0.72 : Math.min(1.08, h / 760)
      const markW = 330 * s
      const markH = 132 * s

      const logoGroup = this.add.container(cx, logoY).setDepth(5).setAlpha(0.96)
      const halo = this.add.graphics()
      halo.fillStyle(0x7cfc00, 0.08)
      halo.fillEllipse(0, 2, markW + 90 * s, markH + 70 * s)
      const plaque = this.add.graphics()
      plaque.fillStyle(0xffffff, 0.96)
      plaque.fillRoundedRect(-markW / 2, -markH / 2, markW, markH, 24 * s)
      plaque.lineStyle(4 * s, 0x2e7d32, 0.9)
      plaque.strokeRoundedRect(-markW / 2, -markH / 2, markW, markH, 24 * s)
      const logoImg = this.add.image(-76 * s, 0, 'logo').setDisplaySize(92 * s, 88 * s)
      const wordmark = this.add.text(50 * s, -5 * s, '180DC', {
        fontSize: `${Math.round(48 * s)}px`,
        color: '#1B5E20',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      const descriptor = this.add.text(50 * s, 34 * s, '180 DEGREES CONSULTING', {
        fontSize: `${Math.round(9 * s)}px`,
        color: '#2E7D32',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        letterSpacing: 2.2 * s,
      }).setOrigin(0.5)
      logoGroup.add([halo, plaque, logoImg, wordmark, descriptor])
      this.logoGroup = logoGroup

      const coverW = markW + 28 * s
      const coverH = markH + 30 * s
      const cover = this.add.container(cx, logoY)
      cover.setDepth(10)

      const fabric = this.add.graphics()
      fabric.fillStyle(0x111b2b, 1)
      fabric.fillPoints([
        { x: -coverW / 2, y: -coverH / 2 },
        { x: coverW / 2, y: -coverH / 2 },
        { x: coverW / 2 - 3 * s, y: coverH / 2 - 18 * s },
        { x: coverW * 0.34, y: coverH / 2 - 4 * s },
        { x: coverW * 0.22, y: coverH / 2 - 15 * s },
        { x: coverW * 0.08, y: coverH / 2 },
        { x: -coverW * 0.06, y: coverH / 2 - 9 * s },
        { x: -coverW * 0.2, y: coverH / 2 - 1 * s },
        { x: -coverW * 0.34, y: coverH / 2 - 17 * s },
        { x: -coverW / 2 + 3 * s, y: coverH / 2 - 8 * s },
      ], true)
      const stripStops = [0, 0.11, 0.25, 0.36, 0.52, 0.66, 0.78, 0.91, 1] as const
      const stripColors = [0x0b1320, 0x21324a, 0x17263b, 0x2a3d57, 0x17263b, 0x263850, 0x101b2b, 0x22344c] as const
      const strips = stripColors.map((color, index) => {
        const strip = this.add.graphics()
        strip.fillStyle(color, 0.92)
        const left = -coverW / 2 + stripStops[index] * coverW
        const right = -coverW / 2 + stripStops[index + 1] * coverW
        const stripW = right - left
        const bottomLift = (index % 3) * 7 * s
        strip.fillPoints([
          { x: left, y: -coverH / 2 + 4 * s },
          { x: right + 2 * s, y: -coverH / 2 + 4 * s },
          { x: left + stripW * 0.88, y: coverH / 2 - 9 * s - bottomLift },
          { x: left + stripW * 0.53, y: coverH / 2 - bottomLift },
          { x: left + stripW * 0.1, y: coverH / 2 - 8 * s - bottomLift },
        ], true)
        strip.fillStyle(0xffffff, index % 2 === 0 ? 0.018 : 0.052)
        strip.fillEllipse(left + stripW * 0.52, -3 * s, stripW * 0.62, coverH * 0.9)
        return strip
      })
      this.clothStrips = strips

      fabric.fillStyle(0x080d16, 0.72)
      fabric.beginPath()
      fabric.moveTo(-coverW / 2, -coverH / 2)
      fabric.lineTo(coverW / 2, -coverH / 2)
      fabric.lineTo(coverW / 2, -coverH / 2 + 7 * s)
      fabric.lineTo(coverW * 0.25, -coverH / 2 + 17 * s)
      fabric.lineTo(0, -coverH / 2 + 22 * s)
      fabric.lineTo(-coverW * 0.25, -coverH / 2 + 17 * s)
      fabric.lineTo(-coverW / 2, -coverH / 2 + 7 * s)
      fabric.closePath()
      fabric.fillPath()
      fabric.lineStyle(3 * s, 0x050911, 0.6)
      fabric.beginPath()
      fabric.moveTo(-coverW / 2 + 6 * s, coverH / 2 - 11 * s)
      fabric.lineTo(-coverW * 0.34, coverH / 2 - 19 * s)
      fabric.lineTo(-coverW * 0.2, coverH / 2 - 3 * s)
      fabric.lineTo(-coverW * 0.06, coverH / 2 - 11 * s)
      fabric.lineTo(coverW * 0.08, coverH / 2 - 2 * s)
      fabric.lineTo(coverW * 0.22, coverH / 2 - 17 * s)
      fabric.lineTo(coverW * 0.34, coverH / 2 - 6 * s)
      fabric.lineTo(coverW / 2 - 6 * s, coverH / 2 - 20 * s)
      fabric.strokePath()
      fabric.fillStyle(0xd4a76a, 0.9)
      fabric.fillCircle(-coverW / 2 + 12 * s, -coverH / 2 + 8 * s, 4)
      fabric.fillCircle(coverW / 2 - 12 * s, -coverH / 2 + 8 * s, 4)
      fabric.fillStyle(0x352317, 1)
      fabric.fillCircle(-coverW / 2 + 12 * s, -coverH / 2 + 8 * s, 2)
      fabric.fillCircle(coverW / 2 - 12 * s, -coverH / 2 + 8 * s, 2)

      cover.add([fabric, ...strips])

      // Subtle sway
      this.tweens.add({
        targets: cover,
        x: { from: cx - 2.5 * s, to: cx + 2.5 * s },
        angle: { from: -0.35, to: 0.35 },
        duration: 2600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      this.cover = cover
    }

    // ─── Ropes ───

    private drawRopes(w: number, h: number, isMobile: boolean) {
      const cx = w / 2
      const s = isMobile ? 0.72 : Math.min(1.08, h / 760)
      const coverW = 358 * s
      const coverH = 162 * s
      const logoY = Math.max(104, h * 0.18)
      const coverTopY = logoY - coverH / 2

      const leftX = cx - coverW / 2 + 12 * s
      const rightX = cx + coverW / 2 - 12 * s

      // Left rope
      const leftRope = this.add.graphics().setDepth(8)
      leftRope.lineStyle(5 * s, 0x6f4a2d, 1)
      leftRope.lineBetween(leftX, 0, leftX, coverTopY)
      leftRope.lineStyle(1.4 * s, 0xd4a76a, 0.7)
      leftRope.lineBetween(leftX - 1 * s, 0, leftX - 1 * s, coverTopY)

      // Right rope
      const rightRope = this.add.graphics().setDepth(8)
      rightRope.lineStyle(5 * s, 0x6f4a2d, 1)
      rightRope.lineBetween(rightX, 0, rightX, coverTopY)
      rightRope.lineStyle(1.4 * s, 0xd4a76a, 0.7)
      rightRope.lineBetween(rightX - 1 * s, 0, rightX - 1 * s, coverTopY)

      this.ropes = [leftRope, rightRope]
    }

    // ─── Rope-Release Target ───

    private drawRopeTarget(w: number, h: number, isMobile: boolean) {
      const s = isMobile ? 0.78 : Math.min(1.08, h / 760)
      const cx = w / 2
      const logoY = Math.max(104, h * 0.18)
      const coverW = 358 * (isMobile ? 0.72 : Math.min(1.08, h / 760))
      const coverH = 162 * (isMobile ? 0.72 : Math.min(1.08, h / 760))
      const rightX = cx + coverW / 2 - 12 * s
      const coverBottomY = logoY + coverH / 2

      const target = this.add.container(this.slotX, this.slotY)
      target.setDepth(12)

      // Connecting rope from cover to target
      const ropeSeg = this.add.graphics()
      ropeSeg.lineStyle(4 * s, 0x6f4a2d, 1)
      ropeSeg.lineBetween(rightX - this.slotX, coverBottomY - this.slotY, 0, -25)
      ropeSeg.lineStyle(1 * s, 0xd4a76a, 0.65)
      ropeSeg.lineBetween(rightX - this.slotX - 1, coverBottomY - this.slotY, -1, -25)
      this.releaseLine = ropeSeg

      // Glowing aura
      const glow = this.add.graphics()
      glow.fillStyle(0x7cfc00, 0.14)
      glow.fillCircle(0, 0, 54 * s)
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.3, to: 0.8 },
        scaleX: { from: 0.9, to: 1.2 },
        scaleY: { from: 0.9, to: 1.2 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      // Wooden board
      const board = this.add.graphics()
      board.fillStyle(0x70472a, 1)
      board.fillRoundedRect(-38 * s, -30 * s, 76 * s, 60 * s, 7 * s)
      board.lineStyle(3 * s, 0x3c2417, 1)
      board.strokeRoundedRect(-38 * s, -30 * s, 76 * s, 60 * s, 7 * s)
      board.fillStyle(0xd0a067, 0.2)
      board.fillRect(-35 * s, -25 * s, 70 * s, 5 * s)

      // Bullseye
      board.fillStyle(0xffffff, 0.9)
      board.fillCircle(0, -3 * s, 17 * s)
      board.fillStyle(0x2e7d32, 1)
      board.fillCircle(0, -3 * s, 12 * s)
      board.fillStyle(0x7cfc00, 1)
      board.fillCircle(0, -3 * s, 5 * s)
      const label = this.add.text(0, 20 * s, 'RELEASE', {
        fontSize: `${Math.round(8 * s)}px`, color: '#ffffff', fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold', letterSpacing: 1.4 * s,
      }).setOrigin(0.5)

      target.add([ropeSeg, glow, board, label])

      // Slight sway
      this.tweens.add({
        targets: target,
        angle: { from: -3, to: 3 },
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      this.targetContainer = target
    }

    private drawInstructions(w: number, h: number, isMobile: boolean) {
      const text = this.add.text(w / 2, Math.max(210, h * 0.36), 'HIT THE RELEASE  •  REVEAL THE IDENTITY', {
        fontSize: `${isMobile ? 11 : 13}px`, color: '#ffffff', fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold', letterSpacing: isMobile ? 1.2 : 2.2,
        backgroundColor: '#0a1628cc', padding: { x: 12, y: 7 },
      }).setOrigin(0.5).setDepth(20).setAlpha(0)
      this.tweens.add({ targets: text, alpha: 0.78, duration: 500, delay: 1450 })
      this.instructionText = text
    }

    // ─── Slingshot ───

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

    // ─── Power Bar ───

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

    // ─── Arrow Projectile ───

    private createArrow() {
      const arrow = this.add.container(this.slingshotX, this.slingshotY - 78)

      // Shaft
      const shaft = this.add.graphics()
      shaft.fillStyle(0x6D4C41, 1)
      shaft.fillRect(-1.5, -15, 3, 30)
      shaft.fillStyle(0x5D4037, 0.5)
      shaft.fillRect(-1.5, -15, 1, 30)

      // Arrowhead
      const head = this.add.graphics()
      head.fillStyle(0xC0C0C0, 1)
      head.fillTriangle(0, -28, -5, -15, 5, -15)
      head.fillStyle(0x808080, 0.5)
      head.fillTriangle(0, -28, -5, -15, 0, -15)

      // Fletching
      const fletch = this.add.graphics()
      fletch.fillStyle(0x7CFC00, 0.8)
      fletch.fillTriangle(0, 15, -6, 24, 0, 24)
      fletch.fillTriangle(0, 15, 6, 24, 0, 24)
      fletch.fillStyle(0x2E7D32, 0.6)
      fletch.fillTriangle(0, 15, -6, 24, -2, 20)
      fletch.fillTriangle(0, 15, 6, 24, 2, 20)

      arrow.add([shaft, head, fletch])
      arrow.setDepth(60)

      this.arrow = arrow
      this.arrowStartX = arrow.x
      this.arrowStartY = arrow.y
    }

    // ─── Countdown ───

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

    // ─── Input Handlers ───

    private onPointerDown(pointer: Phaser.Input.Pointer) {
      if (this.hasScored) {
        this.time.removeAllEvents()
        onResult(this.scoredHit, this.lastHitDistance)
        return
      }
      if (this.isResetting || !this.canDrag || this.hasLaunched) return
      const dx = pointer.x - this.arrow.x
      const dy = pointer.y - this.arrow.y
      if (Math.sqrt(dx * dx + dy * dy) < 80) this.isDragging = true
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
      if (!this.isDragging || this.hasLaunched) return
      const maxPull = 130
      let dx = pointer.x - this.arrowStartX
      let dy = pointer.y - this.arrowStartY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > maxPull) { dx = (dx / dist) * maxPull; dy = (dy / dist) * maxPull }

      this.arrow.x = this.arrowStartX + dx
      this.arrow.y = this.arrowStartY + dy

      const pullFactor = dist / maxPull
      this.currentPull = pullFactor

      this.updatePowerBar(pullFactor)

      this.rubberBand.clear()
      const fl = this.slingshotForkLeft
      const fr = this.slingshotForkRight
      this.rubberBand.lineStyle(6, 0x5D4037, 1)
      this.rubberBand.lineBetween(fl.x, fl.y, this.arrow.x - 10, this.arrow.y - 10)
      this.rubberBand.lineBetween(fr.x, fr.y, this.arrow.x + 10, this.arrow.y - 10)
      this.rubberBand.lineStyle(3, 0x8D6E63, 0.6)
      this.rubberBand.lineBetween(fl.x, fl.y, this.arrow.x - 10, this.arrow.y - 10)
      this.rubberBand.lineBetween(fr.x, fr.y, this.arrow.x + 10, this.arrow.y - 10)

      this.dragLine.clear()

      this.dragLine.lineStyle(4, 0xff5252, 0.9)
      this.dragLine.lineBetween(this.arrowStartX, this.arrowStartY, this.arrow.x, this.arrow.y)

      this.dragLine.lineStyle(6, 0xffffff, 0.3)
      this.dragLine.lineBetween(this.arrowStartX, this.arrowStartY, this.arrow.x, this.arrow.y)

      const arrowSize = 12
      const ang = Math.atan2(this.arrow.y - this.arrowStartY, this.arrow.x - this.arrowStartX)
      const tipX = this.arrow.x + Math.cos(ang) * 5
      const tipY = this.arrow.y + Math.sin(ang) * 5
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
      const dx = this.arrow.x - this.arrowStartX
      const dy = this.arrow.y - this.arrowStartY
      const power = (Math.min(this.cameras.main.width, this.cameras.main.height) < 600) ? 0.28 : 0.22
      const vx = -dx * power
      const vy = -dy * power
      for (let t = 0; t < 40; t++) {
        const time = t * 6
        const px = this.arrowStartX + vx * (time / 16.67)
        const py = this.arrowStartY + vy * (time / 16.67) + 0.5 * this.gravity * (time / 16.67) * (time / 16.67)
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

      const dx = this.arrow.x - this.arrowStartX
      const dy = this.arrow.y - this.arrowStartY
      const power = (Math.min(this.cameras.main.width, this.cameras.main.height) < 600) ? 0.28 : 0.22
      this.vx = -dx * power
      this.vy = -dy * power

      this.tweens.add({
        targets: this.arrow,
        scaleX: 0.8,
        scaleY: 1.25,
        duration: 60,
        yoyo: true,
        ease: 'Power2',
      })

      this.tweens.add({
        targets: this.arrow,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        delay: 60,
        ease: 'Elastic.easeOut',
      })
    }

    // ─── Physics Update ───

    update() {
      if (!this.hasLaunched || this.hasScored) return

      this.arrow.x += this.vx
      this.arrow.y += this.vy
      this.vy += this.gravity

      // Arrow points in direction of travel
      if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
        this.arrow.angle = Math.atan2(this.vy, this.vx) * 180 / Math.PI + 90
      }

      const dx = this.arrow.x - this.slotX
      const dy = this.arrow.y - this.slotY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Pull mechanism toward target
      if (dist < 140 && this.vy > 0) {
        const pullStrength = Math.max(0, 1 - dist / 140) * 0.05
        this.vx -= dx * pullStrength
        this.vy -= dy * pullStrength
      }

      // Trail dots
      if (this.trailDots.length < 25) {
        const dot = this.add.circle(this.arrow.x, this.arrow.y, 3, 0xFFD700, 0.6)
        dot.setDepth(55)
        this.trailDots.push(dot)
      } else {
        const oldest = this.trailDots.shift()
        oldest?.destroy()
        const dot = this.add.circle(this.arrow.x, this.arrow.y, 3, 0xFFD700, 0.6)
        dot.setDepth(55)
        this.trailDots.push(dot)
      }
      this.trailDots.forEach((d, i) => {
        const f = (i + 1) / this.trailDots.length
        d.setAlpha(f * 0.6)
        d.setScale(f * 0.9 + 0.1)
      })

      // Hit detection
      if (dist < this.hitZone && this.vy > 0) {
        this.onReveal(dist)
        return
      }

      // Miss detection (off screen)
      const h = this.cameras.main.height
      const w = this.cameras.main.width
      if (this.arrow.y > h + 60 || this.arrow.x < -60 || this.arrow.x > w + 60) {
        this.onMissCovered()
        return
      }
    }

    // ─── Reveal Animation (Hit) ───

    private onReveal(hitDistance: number) {
      this.hasScored = true
      this.scoredHit = true
      this.lastHitDistance = hitDistance
      this.vx = 0
      this.vy = 0

      play('hit')

      // Clear trail
      this.trailDots.forEach((d) => d.destroy())
      this.trailDots = []

      // Arrow sticks into target
      this.arrow.setPosition(this.slotX - 2, this.slotY + 7)
      this.arrow.setAngle(-8)
      this.arrow.setScale(0.96)

      // Flash
      this.cameras.main.flash(180, 255, 248, 222)
      this.tweens.add({
        targets: this.instructionText,
        alpha: 0,
        y: this.instructionText.y - 8,
        duration: 240,
        ease: 'Quad.easeOut',
      })

      // Impact particles (splinters)
      this.spawnImpactParticles(this.slotX, this.slotY)
      const crack = this.add.graphics().setDepth(70)
      crack.lineStyle(2, 0xf8e0b5, 0.95)
      crack.lineBetween(this.slotX - 3, this.slotY, this.slotX - 18, this.slotY - 13)
      crack.lineBetween(this.slotX - 3, this.slotY, this.slotX + 17, this.slotY - 9)
      crack.lineBetween(this.slotX - 3, this.slotY, this.slotX + 12, this.slotY + 15)
      this.tweens.add({
        targets: this.targetContainer,
        x: this.slotX + 10,
        angle: 11,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
      })
      this.tweens.add({
        targets: crack,
        alpha: 0,
        duration: 180,
        delay: 140,
        onComplete: () => crack.destroy(),
      })

      // After brief delay, snap ropes and drop cover
      this.time.delayedCall(220, () => {
        this.releaseLine.clear()
        this.spawnRopeFibres(this.slotX - 3, this.slotY - 24)
        this.ropes.forEach((rope, index) => {
          this.tweens.add({
            targets: rope,
            x: index === 0 ? -14 : 18,
            y: rope.y + (index === 0 ? 58 : 105),
            angle: index === 0 ? -3 : 7,
            alpha: 0,
            duration: index === 0 ? 620 : 440,
            delay: index === 0 ? 240 : 0,
            ease: 'Cubic.easeIn',
          })
        })

        this.clothStrips.forEach((strip, index) => {
          this.tweens.add({
            targets: strip,
            x: (index - 3.5) * 0.6,
            y: 5 + index * 2.8,
            angle: (index - 3.5) * 0.35,
            scaleY: 1.035 + index * 0.006,
            duration: 260 + index * 28,
            ease: 'Sine.easeIn',
          })
        })

        this.tweens.add({
          targets: this.cover,
          x: this.cover.x + 18,
          y: this.cover.y + 34,
          angle: 7,
          scaleX: 0.98,
          scaleY: 1.05,
          duration: 260,
          ease: 'Quad.easeIn',
          onComplete: () => {
            this.tweens.add({
              targets: this.cover,
              x: this.cover.x + 48,
              y: this.cameras.main.height + 250,
              angle: 18,
              scaleX: 0.88,
              scaleY: 1.14,
              duration: 1080,
              ease: 'Cubic.easeIn',
            })
          },
        })

        this.tweens.add({
          targets: this.logoGroup,
          alpha: 1,
          scaleX: { from: 0.94, to: 1 },
          scaleY: { from: 0.94, to: 1 },
          duration: 1100,
          ease: 'Cubic.easeOut',
        })

        this.tweens.add({
          targets: this.targetContainer,
          y: this.cameras.main.height + 250,
          x: this.targetContainer.x + 80,
          angle: 44,
          duration: 1050,
          ease: 'Cubic.easeIn',
        })
        this.tweens.add({
          targets: this.arrow,
          y: this.cameras.main.height + 257,
          x: this.slotX + 78,
          angle: 36,
          duration: 1050,
          ease: 'Cubic.easeIn',
        })

        this.cameras.main.zoomTo(1.035, 1450, 'Cubic.easeOut')
      })

      // Reveal particles after cover drops
      this.time.delayedCall(900, () => {
        this.spawnRevealParticles()
      })

      // "REVEALED!" text
      this.time.delayedCall(1100, () => {
        const cx = this.cameras.main.width / 2
        const isMobile = Math.min(this.cameras.main.width, this.cameras.main.height) < 600
        const cy = this.cameras.main.height * (isMobile ? 0.42 : 0.45)

        const revealText = this.add.text(cx, cy, 'REVEALED!', {
          fontSize: `${isMobile ? 42 : 64}px`,
          color: '#FFD166',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
          stroke: '#1B5E20',
          strokeThickness: 6,
        }).setOrigin(0.5).setDepth(150).setAlpha(0).setScale(0.5)

        this.tweens.add({
          targets: revealText,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          ease: 'Back.easeOut',
        })

        // Subtitle
        const subtitle = this.add.text(cx, cy + 55, 'Some identities cannot stay covered.', {
          fontSize: `${isMobile ? 14 : 20}px`,
          color: '#ffffff',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'italic',
          stroke: '#07111f',
          strokeThickness: isMobile ? 5 : 4,
          shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 6, fill: true },
          align: 'center',
          wordWrap: { width: this.cameras.main.width - 48 },
        }).setOrigin(0.5).setDepth(150).setAlpha(0)

        this.tweens.add({
          targets: subtitle,
          alpha: 0.9,
          duration: 600,
          delay: 300,
        })
      })

      // Call onResult after delay
      this.time.delayedCall(3500, () => onResult(true, hitDistance))
    }

    // ─── Miss Animation (Retry) ───

    private onMissCovered() {
      this.isResetting = true
      this.hasLaunched = false
      this.vx = 0
      this.vy = 0

      play('miss')

      // Clear trail
      this.trailDots.forEach((d) => d.destroy())
      this.trailDots = []

      // Fade out arrow
      this.tweens.add({
        targets: this.arrow,
        alpha: 0,
        duration: 300,
      })

      // Show "STILL COVERED" text
      const cx = this.cameras.main.width / 2
      const cy = this.cameras.main.height * 0.45
      const missText = this.add.text(cx, cy, 'STILL COVERED', {
        fontSize: `${Math.min(this.cameras.main.width, this.cameras.main.height) < 600 ? 34 : 52}px`,
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#5D4037',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(150).setAlpha(0).setScale(0.5)
      const retryText = this.add.text(cx, cy + 47, 'Aim for the glowing release board', {
        fontSize: `${Math.min(this.cameras.main.width, this.cameras.main.height) < 600 ? 12 : 15}px`,
        color: '#ffffff', fontFamily: 'Poppins, sans-serif',
      }).setOrigin(0.5).setDepth(150).setAlpha(0)

      this.tweens.add({
        targets: missText,
        alpha: 0.9,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      })
      this.tweens.add({ targets: retryText, alpha: 0.72, duration: 300, delay: 120 })

      // After delay, reset for retry
      this.time.delayedCall(1500, () => {
        // Fade out text
        this.tweens.add({
          targets: missText,
          alpha: 0,
          duration: 400,
          onComplete: () => missText.destroy(),
        })
        this.tweens.add({
          targets: retryText,
          alpha: 0,
          duration: 300,
          onComplete: () => retryText.destroy(),
        })

        // Reset arrow
        this.arrow.setPosition(this.arrowStartX, this.arrowStartY)
        this.arrow.setAngle(0)
        this.arrow.setScale(1)
        this.arrow.setAlpha(0)

        this.tweens.add({
          targets: this.arrow,
          alpha: 1,
          duration: 400,
          onComplete: () => {
            this.isResetting = false
            this.canDrag = true
          },
        })
      })
    }

    // ─── Particles ───

    private spawnImpactParticles(x: number, y: number) {
      const colors = [0xC0C0C0, 0x8D6E63, 0xffffff, 0xFFD700]
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 6
        const p = this.add.circle(x, y, 1 + Math.random() * 3, colors[i % colors.length], 1)
        p.setDepth(100)
        this.tweens.add({
          targets: p,
          x: p.x + Math.cos(angle) * speed * 15,
          y: p.y + Math.sin(angle) * speed * 15,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 300 + Math.random() * 200,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        })
      }
    }

    private spawnRopeFibres(x: number, y: number) {
      for (let index = 0; index < 9; index++) {
        const fibre = this.add.rectangle(x, y, 2, 12, index % 2 === 0 ? 0xd4a76a : 0x6f4a2d)
        fibre.setDepth(105).setAngle(-45 + index * 11)
        this.tweens.add({
          targets: fibre,
          x: x + (index - 4) * 10,
          y: y + 28 + Math.abs(index - 4) * 4,
          angle: fibre.angle + 80,
          alpha: 0,
          duration: 420 + index * 24,
          ease: 'Quad.easeOut',
          onComplete: () => fibre.destroy(),
        })
      }
    }

    private spawnRevealParticles() {
      const cx = this.cameras.main.width / 2
      const cy = this.cameras.main.height * 0.16
      const colors = [0xFFD700, 0x2E7D32, 0x7CFC00, 0xffffff, 0x4CAF50, 0x87CEEB]
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 10
        const p = this.add.circle(cx, cy, 2 + Math.random() * 4, colors[i % colors.length], 1)
        p.setDepth(100)
        this.tweens.add({
          targets: p,
          x: p.x + Math.cos(angle) * speed * 20,
          y: p.y + Math.sin(angle) * speed * 20,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 500 + Math.random() * 300,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        })
      }
      this.spawnConfetti()
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
