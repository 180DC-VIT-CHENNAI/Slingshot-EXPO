import * as Phaser from 'phaser'
import type { MissionConfig, MissionUpdate } from './core'

const QUESTIONS = [
  'Which strategy best drives business growth?',
  'Which approach creates the most sustainable competitive advantage?',
  'What is the most impactful strategic initiative?',
  'Which direction should the company prioritize?',
  'What strategy delivers the highest long-term value?',
]

const STRATEGIES = [
  { label: 'Expand\nMarket', icon: '📈', color: 0x4CAF50 },
  { label: 'Reduce\nCost', icon: '✂️', color: 0x2196F3 },
  { label: 'Improve\nProcess', icon: '⚙️', color: 0xFF9800 },
  { label: 'Digital\nTransform', icon: '🖥️', color: 0x9C27B0 },
  { label: 'Price\nStrategy', icon: '🏷️', color: 0xF44336 },
]

const STRATEGY_EXPLANATIONS: Record<string, { correct: string; wrong: string }> = {
  'Expand\nMarket': {
    correct: 'Expanding into new markets drives sustainable growth and diversification.',
    wrong: 'This strategy focuses on growth, but the priority here is strengthening internal operations first.',
  },
  'Reduce\nCost': {
    correct: 'Reducing costs directly improves margins and competitive positioning.',
    wrong: 'Cost savings help, but the urgent need is to build long-term market presence.',
  },
  'Improve\nProcess': {
    correct: 'Streamlining processes eliminates waste and accelerates delivery.',
    wrong: 'Process gains are valuable, but the bigger opportunity lies in market reach.',
  },
  'Digital\nTransform': {
    correct: 'Digital transformation unlocks new capabilities and future-proofs the business.',
    wrong: 'Tech upgrades are important, but the critical move is expanding the customer base.',
  },
  'Price\nStrategy': {
    correct: 'An optimized pricing strategy maximizes revenue and captures market value.',
    wrong: 'Pricing helps margins, but growth depends on reaching new markets.',
  },
}

function getCardBounds(card: any): { x: number; y: number; w: number; h: number } {
  return { x: card.x, y: card.y, w: card.w ?? 80, h: card.h ?? 110 }
}

function hitTestCard(cards: any[], px: number, py: number): number {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i]
    if (c.destroyed) continue
    const b = getCardBounds(c)
    if (Math.abs(px - b.x) < b.w / 2 && Math.abs(py - b.y) < b.h / 2) {
      return i
    }
  }
  return -1
}

export const mission4Config: MissionConfig = {
  sceneKey: 'Mission4',
  gravity: 0.18,
  maxPull: 130,
  power: 0.22,
  hitZone: 65,
  multiShot: false,
  multiShotOnHit: false,
  totalShots: 1,
  countdownColor: '#FFD700',

  drawEnvironment(scene: Phaser.Scene, w: number, h: number) {
    const isMobile = w < 500
    const bg = scene.add.graphics()
    for (let y = 0; y < h; y++) {
      const t = y / h
      const r = Math.floor(10 + (20 - 10) * t)
      const g = Math.floor(14 + (30 - 14) * t)
      const b = Math.floor(26 + (48 - 26) * t)
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      bg.fillRect(0, y, w, 1)
    }
    bg.setDepth(-20)

    const windowG = scene.add.graphics().setDepth(-18)
    const skyT = h * (isMobile ? 0.10 : 0.08)
    const skyH = h * 0.22
    windowG.fillStyle(0x1a2a4a, 1)
    windowG.fillRect(w * 0.05, skyT, w * 0.9, skyH)
    windowG.fillStyle(0x2a3a5a, 0.6)
    windowG.fillRect(w * 0.07, skyT + 4, w * 0.86, skyH - 8)

    const cityColor = 0x0a0a1e
    const bldgG = scene.add.graphics().setDepth(-17)
    const bldgs = [
      { x: 0.1, w: 0.12, h: 0.55 },
      { x: 0.24, w: 0.08, h: 0.40 },
      { x: 0.34, w: 0.10, h: 0.65 },
      { x: 0.46, w: 0.07, h: 0.35 },
      { x: 0.55, w: 0.11, h: 0.70 },
      { x: 0.68, w: 0.09, h: 0.50 },
      { x: 0.79, w: 0.10, h: 0.60 },
      { x: 0.91, w: 0.08, h: 0.45 },
    ]
    bldgs.forEach((b) => {
      const bx = w * b.x
      const by = skyT + skyH * (1 - b.h)
      const bw = w * b.w
      const bh = skyH * b.h
      bldgG.fillStyle(cityColor, 0.9)
      bldgG.fillRect(bx, by, bw, bh)
      for (let row = 0; row < Math.floor(bh / 8); row++) {
        for (let col = 0; col < Math.floor(bw / 6); col++) {
          if (Math.random() > 0.4) {
            bldgG.fillStyle(0xffdd66, 0.15 + Math.random() * 0.2)
            bldgG.fillRect(bx + 2 + col * 6, by + 2 + row * 8, 3, 4)
          }
        }
      }
    })

    const tableY = h * (isMobile ? 0.60 : 0.55)
    const tableG = scene.add.graphics().setDepth(-14)
    tableG.fillStyle(0x3E2723, 1)
    tableG.fillRoundedRect(w * 0.05, tableY - 10, w * 0.9, 20, 4)
    tableG.fillStyle(0x4E342E, 0.6)
    tableG.fillRoundedRect(w * 0.05, tableY - 8, w * 0.9, 4, 2)
    tableG.fillStyle(0x5D4037, 0.3)
    tableG.fillRoundedRect(w * 0.05, tableY + 2, w * 0.9, 3, 1)

    for (let i = 0; i < 3; i++) {
      const lightG = scene.add.graphics().setDepth(-16)
      const lx = w * (0.2 + i * 0.3)
      lightG.fillStyle(0xffeedd, 0.12)
      lightG.fillRoundedRect(lx - 35, 6, 70, 18, 4)
      lightG.fillStyle(0xffffff, 0.08)
      lightG.fillRoundedRect(lx - 30, 8, 60, 14, 3)
    }

    const chairG = scene.add.graphics().setDepth(-12)
    const chairPositions = [
      { x: w * 0.08, y: tableY + 28 },
      { x: w * 0.25, y: tableY + 28 },
      { x: w * 0.42, y: tableY + 28 },
      { x: w * 0.58, y: tableY + 28 },
      { x: w * 0.75, y: tableY + 28 },
      { x: w * 0.92, y: tableY + 28 },
      { x: w * 0.15, y: tableY - 36 },
      { x: w * 0.35, y: tableY - 36 },
      { x: w * 0.65, y: tableY - 36 },
      { x: w * 0.85, y: tableY - 36 },
    ]
    chairPositions.forEach((cp) => {
      chairG.fillStyle(0x1a1a1a, 0.4)
      chairG.fillRoundedRect(cp.x - 12, cp.y - 14, 24, 28, 6)
      chairG.fillStyle(0x222222, 0.3)
      chairG.fillRoundedRect(cp.x - 8, cp.y - 10, 16, 20, 4)
    })

    const qY = isMobile ? h * 0.06 : h * 0.01
    const qH = isMobile ? h * 0.055 : h * 0.06
    const qBg = scene.add.graphics().setDepth(5)
    qBg.fillStyle(0x000000, 0.7)
    qBg.fillRoundedRect(w * 0.08, qY, w * 0.84, qH, 8)
    qBg.lineStyle(1, 0xFFD700, 0.4)
    qBg.strokeRoundedRect(w * 0.08, qY, w * 0.84, qH, 8)

    scene.add.text(w / 2, qY + qH / 2, QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)], {
      fontSize: `${Math.max(10, Math.min(isMobile ? 12 : 16, w * 0.035))}px`,
      color: '#FFD700',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6)

    const hintGlow = scene.add.graphics().setDepth(5)
    hintGlow.fillStyle(0xFFD700, 0.04)
    hintGlow.fillRoundedRect(w * 0.08, qY, w * 0.84, qH, 8)
    scene.tweens.add({
      targets: hintGlow,
      alpha: { from: 0.3, to: 0.8 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  },

  createProjectile(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const outer = scene.add.graphics()
    outer.fillStyle(0xFFD700, 1)
    outer.fillCircle(0, 0, 20)
    outer.lineStyle(3, 0xFFA000, 1)
    outer.strokeCircle(0, 0, 20)

    const starG = scene.add.graphics()
    starG.fillStyle(0xFFA000, 1)
    const cx = 0, cy = 0, outerR = 12, innerR = 5
    starG.beginPath()
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2
      const innerAngle = outerAngle + Math.PI / 5
      if (i === 0) {
        starG.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle))
      } else {
        starG.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle))
      }
      starG.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle))
    }
    starG.closePath()
    starG.fillPath()

    const shine = scene.add.graphics()
    shine.fillStyle(0xFFFFFF, 0.5)
    shine.fillCircle(-7, -8, 4)

    const container = scene.add.container(
      scene.cameras.main.width / 2,
      scene.cameras.main.height - 178,
      [outer, starG, shine],
    )
    return container
  },

  setupTargets(scene: Phaser.Scene, w: number, h: number): any {
    const isMobile = w < 500
    const tableY = h * (isMobile ? 0.60 : 0.55)
    const cardW = isMobile ? Math.min(70, (w - 40) / 5 - 6) : 80
    const cardH = isMobile ? cardW * 1.35 : 110
    const labelSize = isMobile ? '9px' : '11px'
    const iconSize = isMobile ? '16px' : '20px'
    const spacing = w / (STRATEGIES.length + 1)
    const cards: any[] = []

    STRATEGIES.forEach((strat, i) => {
      const cx = spacing * (i + 1)
      const cy = tableY - (isMobile ? 40 : 55)

      const card = {
        x: cx,
        y: cy,
        baseY: cy,
        w: cardW,
        h: cardH,
        strategy: strat,
        destroyed: false,
        isCorrect: false,
        container: scene.add.container(cx, cy).setDepth(10),
        back: scene.add.graphics(),
        front: scene.add.graphics(),
        labelText: scene.add.text(0, 0, strat.label, {
          fontSize: labelSize,
          color: '#ffffff',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
          align: 'center',
        }).setOrigin(0.5),
        iconText: scene.add.text(0, -(isMobile ? 14 : 20), strat.icon, {
          fontSize: iconSize,
        }).setOrigin(0.5),
        correctGlow: scene.add.graphics(),
        wrongBorder: scene.add.graphics(),
        floatTween: null as any,
      }

      const halfW = cardW / 2
      const halfH = cardH / 2

      card.back.fillStyle(0x1a1a2e, 1)
      card.back.fillRoundedRect(-halfW, -halfH, cardW, cardH, 8)
      card.back.lineStyle(2, 0x333355, 1)
      card.back.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 8)
      card.back.lineStyle(1, 0x444466, 0.3)
      for (let r = -halfH + 20; r < halfH - 10; r += 12) {
        for (let c = -halfW + 10; c < halfW - 10; c += 12) {
          card.back.fillStyle(0x333355, 0.2)
          card.back.fillRect(c + 2, r + 2, 4, 4)
        }
      }

      card.front.fillStyle(0x0d0d1a, 1)
      card.front.fillRoundedRect(-halfW, -halfH, cardW, cardH, 8)
      card.front.setAlpha(0)

      card.correctGlow.fillStyle(0xFFD700, 0.2)
      card.correctGlow.fillRoundedRect(-halfW - 4, -halfH - 4, cardW + 8, cardH + 8, 10)
      card.correctGlow.setAlpha(0)

      card.wrongBorder.lineStyle(2, 0x444466, 0.6)
      card.wrongBorder.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 8)
      card.wrongBorder.setAlpha(0.7)

      card.container.add([
        card.correctGlow,
        card.back,
        card.wrongBorder,
        card.front,
        card.iconText,
        card.labelText,
      ])

      card.floatTween = scene.tweens.add({
        targets: card.container,
        y: cy - 3,
        duration: 1600 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      cards.push(card)
    })

    const correctIdx = Math.floor(Math.random() * cards.length)
    cards[correctIdx].isCorrect = true
    cards[correctIdx].correctGlow.setAlpha(0)
    cards[correctIdx].wrongBorder.setAlpha(0)

    return {
      cards,
      correctIdx,
      shotFired: false,
      answeredCorrectly: false,
      glowTween: null,
    }
  },

  updateMission(
    scene: Phaser.Scene,
    projectileX: number,
    projectileY: number,
    targets: any,
    w: number,
    h: number,
  ): MissionUpdate {
    const hitIdx = hitTestCard(targets.cards, projectileX, projectileY)
    if (hitIdx >= 0) {
      return { hit: true, hitDistance: 30 }
    }
    return {}
  },

  onHit(
    scene: Phaser.Scene,
    targets: any,
    projectileX: number,
    projectileY: number,
  ): { distance: number; completed: boolean; popups?: { title: string; body: string; color?: number }[] } {
    const hitIdx = hitTestCard(targets.cards, projectileX, projectileY)
    targets.shotFired = true

    if (hitIdx >= 0 && targets.cards[hitIdx].isCorrect) {
      targets.answeredCorrectly = true
      const card = targets.cards[hitIdx]
      card.destroyed = true
      if (card.floatTween) card.floatTween.remove()

      scene.tweens.add({
        targets: card.correctGlow,
        alpha: 0,
        duration: 300,
      })

      card.back.setAlpha(0)
      card.front.setAlpha(1)
      const halfW = card.w / 2
      const halfH = card.h / 2
      card.front.fillStyle(0x1a3a1a, 1)
      card.front.fillRoundedRect(-halfW, -halfH, card.w, card.h, 8)
      card.front.lineStyle(3, 0xFFD700, 1)
      card.front.strokeRoundedRect(-halfW, -halfH, card.w, card.h, 8)

      card.iconText.setVisible(false)
      card.labelText.setText('✓\nCORRECT')
      card.labelText.setColor('#FFD700')
      card.labelText.setFontSize(14)

      const particleColors = [0xFFD700, 0xFFA000, 0xFFFFFF, 0xFFECB3]
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 8
        const p = scene.add.circle(
          card.x, card.y,
          2 + Math.random() * 3,
          particleColors[i % particleColors.length],
          1,
        ).setDepth(100)
        scene.tweens.add({
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

      const label = scene.add.text(scene.cameras.main.width / 2, scene.cameras.main.height * 0.35, 'CORRECT STRATEGY!', {
        fontSize: '28px',
        color: '#FFD700',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(150).setAlpha(0)

      scene.tweens.add({
        targets: label,
        alpha: 1,
        y: label.y - 20,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          scene.tweens.add({
            targets: label,
            alpha: 0,
            duration: 500,
            delay: 800,
          })
        },
      })

      const explanation = STRATEGY_EXPLANATIONS[card.strategy.label]
      const popup = {
        title: '✓ ' + card.strategy.label.replace('\n', ' '),
        body: explanation.correct,
        color: 0x4CAF50,
      }

      return { distance: 5, completed: true, popups: [popup] }
    }

    if (hitIdx >= 0) {
      const card = targets.cards[hitIdx]
      if (card.floatTween) card.floatTween.remove()

      scene.tweens.add({
        targets: card.container,
        x: card.x + 5,
        duration: 50,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          const fragments: Phaser.GameObjects.Rectangle[] = []
          for (let i = 0; i < 8; i++) {
            const frag = scene.add.rectangle(
              card.x, card.y,
              10 + Math.random() * 15, 10 + Math.random() * 15,
              0x1a1a2e, 1,
            ).setDepth(100)
            fragments.push(frag)
            scene.tweens.add({
              targets: frag,
              x: frag.x + (Math.random() - 0.5) * 200,
              y: frag.y + (Math.random() - 0.5) * 200,
              angle: Math.random() * 720 - 360,
              alpha: 0,
              duration: 600 + Math.random() * 300,
              ease: 'Power2',
              onComplete: () => frag.destroy(),
            })
          }
          card.destroyed = true
          card.container.setAlpha(0)
          card.container.destroy()
        },
      })

      const correctCard = targets.cards[targets.correctIdx]
      if (correctCard && !correctCard.destroyed) {
        if (correctCard.floatTween) correctCard.floatTween.remove()
      }

      const label = scene.add.text(scene.cameras.main.width / 2, scene.cameras.main.height * 0.35, 'WRONG', {
        fontSize: '48px',
        color: '#FF5252',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      }).setOrigin(0.5).setDepth(150).setAlpha(0).setScale(0.3)

      scene.tweens.add({
        targets: label,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        y: label.y - 15,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          scene.tweens.add({
            targets: label,
            alpha: 0,
            duration: 400,
            delay: 700,
          })
        },
      })

      const pickedLabel = card.strategy.label.replace('\n', ' ')
      const correctLabel = correctCard.strategy.label.replace('\n', ' ')
      const explanation = STRATEGY_EXPLANATIONS[card.strategy.label]
      const popup = {
        title: '✗ ' + pickedLabel,
        body: explanation.wrong + '\nThe correct answer: ' + correctLabel + ' — ' + STRATEGY_EXPLANATIONS[correctCard.strategy.label].correct,
        color: 0xF44336,
      }

      return { distance: 250, completed: false, popups: [popup] }
    }

    return { distance: 300, completed: false }
  },

  onMiss(scene: Phaser.Scene, targets: any): void {
    targets.shotFired = true

    const correctCard = targets.cards[targets.correctIdx]
    if (correctCard && !correctCard.destroyed) {
      if (correctCard.floatTween) correctCard.floatTween.remove()
    }

    const label = scene.add.text(scene.cameras.main.width / 2, scene.cameras.main.height * 0.35, 'Missed! Better luck next time.', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'Poppins, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(150).setAlpha(0)

    scene.tweens.add({
      targets: label,
      alpha: 1,
      y: label.y - 15,
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
    return targets.shotFired === true
  },

  getScore(targets: any): number {
    return targets.answeredCorrectly ? 100 : 0
  },
}
