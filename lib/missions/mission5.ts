import * as Phaser from 'phaser'
import type { MissionConfig, MissionUpdate } from './core'

const NODE_LABELS = ['Research', 'Analysis', 'Strategy', 'Impact']
const NODE_COLORS = [0x2979FF, 0xFFA000, 0xAB47BC, 0x00E676]
const BOTTLENECK_POSITIONS = [1, 2, 3]

const BOTTLENECK_POPUPS = [
  { title: 'Research → Analysis', body: 'Data now flows freely from research into analysis.', color: 0xE53935 },
  { title: 'Analysis → Strategy', body: 'Insights reach strategy teams without delay.', color: 0xFFA000 },
  { title: 'Strategy → Impact', body: 'Strategic plans execute through to real impact.', color: 0x00E676 },
]

function getBottleneckBounds(bn: any): { x: number; y: number; w: number; h: number } {
  return { x: bn.x, y: bn.y, w: bn.bw ?? 70, h: bn.bh ?? 55 }
}

function hitTestBottleneck(bottlenecks: any[], px: number, py: number): number {
  for (let i = 0; i < bottlenecks.length; i++) {
    const bn = bottlenecks[i]
    if (bn.destroyed) continue
    const b = getBottleneckBounds(bn)
    if (Math.abs(px - b.x) < b.w / 2 && Math.abs(py - b.y) < b.h / 2) {
      return i
    }
  }
  return -1
}

function createFlowDots(scene: Phaser.Scene, nodes: any[], from: number, to: number): Phaser.GameObjects.Arc[] {
  const dots: Phaser.GameObjects.Arc[] = []
  const startX = nodes[from].x + nodes[from].w / 2
  const endX = nodes[to].x - nodes[to].w / 2
  const y = nodes[0].y
  for (let i = 0; i < 10; i++) {
    const t = i / 10
    const x = startX + (endX - startX) * t
    const dot = scene.add.circle(x, y + (Math.random() - 0.5) * 6, 3, 0x00E676, 0)
    dot.setData('startX', startX)
    dot.setData('endX', endX)
    dot.setData('initialT', t)
    dot.setData('seed', Math.random() * 100)
    dot.setDepth(8)
    dot.setAlpha(0)
    dot.setScale(0.5)
    scene.tweens.add({
      targets: dot,
      alpha: { from: 0, to: 0.8 },
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      delay: i * 30,
    })
    dots.push(dot)
  }
  return dots
}

let flowDots: Phaser.GameObjects.Arc[] = [];
let flowActive = false;
let flowTime = 0;

function resetFlowDots() {
  flowDots = [];
  flowActive = false;
  flowTime = 0;
}

function startFlowOnSection(scene: Phaser.Scene, nodes: any[], sectionIdx: number) {
  const from = sectionIdx;
  const to = sectionIdx + 1;
  const newDots = createFlowDots(scene, nodes, from, to);
  flowDots = flowDots.concat(newDots);
}

function enableFullFlow(scene: Phaser.Scene, nodes: any[]) {
  for (let s = 0; s < nodes.length - 1; s++) {
    startFlowOnSection(scene, nodes, s);
  }
  flowActive = true;
}

export const mission5Config: MissionConfig = {
  sceneKey: 'Mission5',
  gravity: 0.20,
  maxPull: 125,
  power: 0.24,
  hitZone: 55,
  multiShot: true,
  multiShotOnHit: true,
  totalShots: 6,
  countdownColor: '#CC0000',

  drawEnvironment(scene: Phaser.Scene, w: number, h: number) {
    const bg = scene.add.graphics()
    for (let y = 0; y < h; y++) {
      const t = y / h
      const r = Math.floor(13 + (26 - 13) * t)
      const g = Math.floor(17 + (30 - 17) * t)
      const b = Math.floor(23 + (46 - 23) * t)
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      bg.fillRect(0, y, w, 1)
    }
    bg.setDepth(-20)

    const floorG = scene.add.graphics().setDepth(-18)
    floorG.fillStyle(0x2a2a30, 1)
    floorG.fillRect(0, h * 0.85, w, h * 0.15)
    floorG.fillStyle(0x222228, 1)
    floorG.fillRect(0, h * 0.85, w, 3)
    floorG.fillStyle(0x33333a, 0.3)
    for (let i = 0; i < 20; i++) {
      floorG.fillRect(i * (w / 20), h * 0.87, 1, h * 0.13)
    }

    const pipeY = h * 0.45
    const pipeG = scene.add.graphics().setDepth(-9)

    const isMobile = w < 500
    const nodeW = isMobile ? Math.min(80, (w - 60) / 4 - 10) : 100
    const nodeH = isMobile ? nodeW * 0.55 : 60
    const spacing = (w - nodeW * NODE_LABELS.length) / (NODE_LABELS.length + 1)

    const nodes: any[] = []
    const nodeCenters: { x: number; y: number }[] = []

    NODE_LABELS.forEach((label, i) => {
      const nx = spacing * (i + 1) + nodeW * i + nodeW / 2
      const ny = pipeY
      nodeCenters.push({ x: nx, y: ny })

      const color = NODE_COLORS[i]
      const darkerColor = Phaser.Display.Color.IntegerToColor(color).darken(30).color

      pipeG.fillStyle(0x606070, 0.3)
      pipeG.fillRoundedRect(nx - nodeW / 2 - 2, ny - nodeH / 2 - 2, nodeW + 4, nodeH + 4, 8)
      pipeG.fillStyle(color, 0.9)
      pipeG.fillRoundedRect(nx - nodeW / 2, ny - nodeH / 2, nodeW, nodeH, 6)
      pipeG.fillStyle(darkerColor, 0.5)
      pipeG.fillRoundedRect(nx - nodeW / 2 + 4, ny - nodeH / 2 + 4, nodeW - 8, 4, 2)
      pipeG.lineStyle(2, 0xffffff, 0.3)
      pipeG.strokeRoundedRect(nx - nodeW / 2, ny - nodeH / 2, nodeW, nodeH, 6)

      const stepNum = scene.add.text(nx, ny - (isMobile ? 10 : 16), `${i + 1}`, {
        fontSize: isMobile ? '12px' : '14px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(-7).setAlpha(0.9)

      const labelText = scene.add.text(nx, ny + (isMobile ? 3 : 6), label, {
        fontSize: isMobile ? '10px' : '13px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(-7)

      nodes.push({ x: nx, y: ny, w: nodeW, h: nodeH })
    })

    for (let i = 0; i < nodeCenters.length - 1; i++) {
      const from = nodeCenters[i]
      const to = nodeCenters[i + 1]
      const midX = (from.x + to.x) / 2
      const midY = from.y

      pipeG.fillStyle(0x505060, 1)
      pipeG.fillRect(from.x + nodeW / 2 - 2, midY - 12, to.x - from.x - nodeW + 4, 24)
      pipeG.lineStyle(1, 0x606070, 0.4)
      pipeG.strokeRect(from.x + nodeW / 2 - 2, midY - 12, to.x - from.x - nodeW + 4, 24)

      for (let r = 0; r < 3; r++) {
        pipeG.fillStyle(0x404050, 0.6)
        pipeG.fillCircle(from.x + nodeW / 2 + 10 + r * 20, midY - 12, 3)
        pipeG.fillCircle(from.x + nodeW / 2 + 10 + r * 20, midY + 12, 3)
      }

      const arrowG = scene.add.graphics().setDepth(-8)
      arrowG.fillStyle(0x707080, 0.6)
      arrowG.fillTriangle(midX + 8, midY, midX - 4, midY - 8, midX - 4, midY + 8)
    }

    const greenFlowG = scene.add.graphics().setDepth(-5).setName('greenFlow')
    const flowStartX = nodeCenters[0].x - nodeW / 2
    const firstBlockMidX = (nodeCenters[0].x + nodeCenters[1].x) / 2
    greenFlowG.fillStyle(0x00E676, 0.35)
    greenFlowG.fillRoundedRect(flowStartX, pipeY - 8, firstBlockMidX - flowStartX - 35, 16, 8)
    greenFlowG.lineStyle(2, 0x00E676, 0.6)
    greenFlowG.strokeRoundedRect(flowStartX, pipeY - 8, firstBlockMidX - flowStartX - 35, 16, 8)

    const flowDotG = scene.add.graphics().setDepth(-4).setName('greenFlowDots')
    for (let i = 0; i < 5; i++) {
      const t = i / 5
      const dx = flowStartX + (firstBlockMidX - flowStartX - 35) * t
      flowDotG.fillStyle(0x00E676, 0.7)
      flowDotG.fillCircle(dx, pipeY, 3)
    }

    const counter = scene.add.text(w / 2, 24, '', {
      fontSize: '13px', color: '#FF6B6B', fontFamily: 'Poppins, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setName('bnCounter')
  },

  createProjectile(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const body = scene.add.graphics()
    body.fillStyle(0x708090, 1)
    body.fillCircle(0, 0, 16)
    body.lineStyle(2, 0x909090, 1)
    body.strokeCircle(0, 0, 16)

    const crossX = scene.add.graphics()
    crossX.lineStyle(4, 0xA0A0A0, 0.9)
    crossX.lineBetween(-10, 0, 10, 0)
    crossX.lineBetween(0, -10, 0, 10)

    const crossY = scene.add.graphics()
    crossY.lineStyle(2, 0x404040, 0.7)
    crossY.lineBetween(-8, -8, 8, 8)
    crossY.lineBetween(-8, 8, 8, -8)

    const highlight = scene.add.graphics()
    highlight.fillStyle(0xC0C0C0, 0.5)
    highlight.fillCircle(-5, -5, 4)

    const container = scene.add.container(
      scene.cameras.main.width / 2,
      scene.cameras.main.height - 178,
      [body, crossX, crossY, highlight],
    )
    return container
  },

  setupTargets(scene: Phaser.Scene, w: number, h: number): any {
    const pipeY = h * 0.45
    const isMobile = w < 500
    const nodeW = isMobile ? Math.min(80, (w - 60) / 4 - 10) : 100
    const nodeCount = NODE_LABELS.length
    const spacing = (w - nodeW * nodeCount) / (nodeCount + 1)

    const nodes: any[] = []
    NODE_LABELS.forEach((label, i) => {
      const nx = spacing * (i + 1) + nodeW * i + nodeW / 2
      nodes.push({ x: nx, y: pipeY, w: nodeW, h: 60, label })
    })

    const bottlenecks: any[] = []
    const nodeCenters = nodes.map((n) => ({ x: n.x, y: n.y, w: n.w }))

    BOTTLENECK_POSITIONS.forEach((pos, idx) => {
      const from = nodeCenters[pos - 1]
      const to = nodeCenters[pos]
      const midX = (from.x + to.x) / 2
      const midY = from.y

      const bnW = isMobile ? Math.min(60, (to.x - from.x) * 0.6) : 70
      const bnH = isMobile ? bnW * 0.75 : 55
      const halfBW = bnW / 2
      const halfBH = bnH / 2

      const bnContainer = scene.add.container(midX, midY).setDepth(10)
      const bnG = scene.add.graphics()
      bnG.fillStyle(0xCC0000, 1)
      bnG.fillRoundedRect(-halfBW, -halfBH, bnW, bnH, 5)
      bnG.lineStyle(2, 0x880000, 1)
      bnG.strokeRoundedRect(-halfBW, -halfBH, bnW, bnH, 5)

      for (let j = 0; j < 4; j++) {
        const stripeY = -halfBH + 5 + j * (bnH / 4)
        bnG.fillStyle(0xFFDD00, 0.5)
        bnG.fillRect(-halfBW, stripeY, bnW * 0.22, bnH * 0.15)
        bnG.fillRect(-halfBW + bnW * 0.3, stripeY, bnW * 0.42, bnH * 0.15)
        bnG.fillRect(halfBW - bnW * 0.28, stripeY, bnW * 0.28, bnH * 0.15)
      }

      const redGlow = scene.add.graphics()
      redGlow.fillStyle(0xFF0000, 0.2)
      redGlow.fillRoundedRect(-halfBW - 4, -halfBH - 4, bnW + 8, bnH + 8, 8)
      bnContainer.add(redGlow)
      scene.tweens.add({
        targets: redGlow,
        alpha: { from: 0.2, to: 0.6 },
        scaleX: { from: 0.95, to: 1.05 },
        scaleY: { from: 0.95, to: 1.05 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      bnContainer.add(bnG)

      const blockLabel = scene.add.text(midX, midY - (isMobile ? 1 : 2), 'BLOCKED', {
        fontSize: isMobile ? '8px' : '10px',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11)

      const blockIcon = scene.add.text(midX, midY + (isMobile ? 8 : 12), '✖', {
        fontSize: isMobile ? '12px' : '14px',
        color: '#ff6666',
        fontFamily: 'Poppins, sans-serif',
      }).setOrigin(0.5).setDepth(11)

      const warnTri = scene.add.graphics().setDepth(11)
      warnTri.fillStyle(0xFFDD00, 0.6)
      warnTri.fillTriangle(midX - 4, midY + (isMobile ? 16 : 20), midX + 4, midY + (isMobile ? 16 : 20), midX, midY + (isMobile ? 10 : 14))

      scene.tweens.add({
        targets: warnTri,
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      bottlenecks.push({
        x: midX,
        y: midY,
        bw: bnW,
        bh: bnH,
        index: idx,
        position: pos,
        destroyed: false,
        container: bnContainer,
        graphics: bnG,
        redGlow: redGlow,
        blockLabel,
        blockIcon,
        warnTri,
        segmentFrom: pos - 1,
        segmentTo: pos,
      })
    })

    return {
      bottlenecks,
      nodes,
      destroyedCount: 0,
      totalBottlenecks: 3,
      shotsUsed: 0,
      flowActiveSections: [false, false, false],
      isFullyUnlocked: false,
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
    const counter = scene.children.getByName('bnCounter') as Phaser.GameObjects.Text | null
    if (counter) {
      counter.setText(`Blocked: ${targets.destroyedCount} / ${targets.totalBottlenecks}  |  Shots: ${targets.shotsUsed} / 6`)
    }

    const hitIdx = hitTestBottleneck(targets.bottlenecks, projectileX, projectileY)
    if (hitIdx >= 0) {
      return { hit: true, hitDistance: 20 }
    }
    return {}
  },

  onHit(
    scene: Phaser.Scene,
    targets: any,
    projectileX: number,
    projectileY: number,
  ): { distance: number; completed: boolean; popups?: { title: string; body: string; color?: number }[] } {
    const hitIdx = hitTestBottleneck(targets.bottlenecks, projectileX, projectileY)
    targets.shotsUsed++

    if (hitIdx < 0) return { distance: 100, completed: false }

    const bn = targets.bottlenecks[hitIdx]
    if (bn.destroyed) return { distance: 100, completed: false }
    bn.destroyed = true
    targets.destroyedCount++

    const popup = BOTTLENECK_POPUPS[bn.index]

    const cx = bn.x
    const cy = bn.y

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 8
      const metalFrag = scene.add.circle(
        cx, cy, 2 + Math.random() * 4, 0x808080, 1,
      ).setDepth(100)
      scene.tweens.add({
        targets: metalFrag,
        x: cx + Math.cos(angle) * speed * 15,
        y: cy + Math.sin(angle) * speed * 15,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => metalFrag.destroy(),
      })
    }

    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 6
      const spark = scene.add.circle(cx, cy, 1 + Math.random() * 2, 0xFFDD00, 1).setDepth(100)
      scene.tweens.add({
        targets: spark,
        x: cx + Math.cos(angle) * speed * 10,
        y: cy + Math.sin(angle) * speed * 10 - 20,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 200 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      })
    }

    bn.container.setAlpha(0)
    bn.container.destroy()
    if (bn.warnTri && bn.warnTri.active) bn.warnTri.destroy()
    if (bn.blockLabel && bn.blockLabel.active) bn.blockLabel.destroy()
    if (bn.blockIcon && bn.blockIcon.active) bn.blockIcon.destroy()

    targets.flowActiveSections[bn.index] = true

    startFlowOnSection(scene, targets.nodes, bn.segmentFrom)

    const greenFlowG = scene.children.getByName('greenFlow') as Phaser.GameObjects.Graphics
    const flowDotG = scene.children.getByName('greenFlowDots') as Phaser.GameObjects.Graphics
    if (greenFlowG && flowDotG) {
      const nodeW = targets.nodes[0].w
      const pipeY = targets.nodes[0].y
      const flowStartX = targets.nodes[0].x - nodeW / 2

      greenFlowG.clear()
      flowDotG.clear()

      const nextBlockedIdx = targets.bottlenecks.findIndex((b: any) => !b.destroyed)
      let flowEndX: number

      if (nextBlockedIdx >= 0) {
        const blockedBn = targets.bottlenecks[nextBlockedIdx]
        flowEndX = blockedBn.x - (blockedBn.bw ?? 70) / 2
      } else {
        const lastNode = targets.nodes[targets.nodes.length - 1]
        flowEndX = lastNode.x + lastNode.w / 2
      }

      const flowWidth = flowEndX - flowStartX
      if (flowWidth > 0) {
        greenFlowG.fillStyle(0x00E676, 0.35)
        greenFlowG.fillRoundedRect(flowStartX, pipeY - 8, flowWidth, 16, 8)
        greenFlowG.lineStyle(2, 0x00E676, 0.6)
        greenFlowG.strokeRoundedRect(flowStartX, pipeY - 8, flowWidth, 16, 8)

        const dotCount = Math.min(15, Math.floor(flowWidth / 25))
        for (let i = 0; i < dotCount; i++) {
          const t = i / dotCount
          const dx = flowStartX + flowWidth * t
          flowDotG.fillStyle(0x00E676, 0.7)
          flowDotG.fillCircle(dx, pipeY, 3)
        }
      }
    }

    if (targets.destroyedCount >= targets.totalBottlenecks) {
      flowActive = true
      enableFullFlow(scene, targets.nodes)
      targets.isFullyUnlocked = true

      const impactNode = targets.nodes[targets.nodes.length - 1]
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 10
        const p = scene.add.circle(
          impactNode.x, impactNode.y,
          2 + Math.random() * 4,
          [0xFFD700, 0xFF6F00, 0xE53935, 0xFFFFFF, 0x00E676][i % 5],
          1,
        ).setDepth(100)
        scene.tweens.add({
          targets: p,
          x: p.x + Math.cos(angle) * speed * 20,
          y: p.y + Math.sin(angle) * speed * 20,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 500 + Math.random() * 400,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        })
      }

      const confettiColors = [0xFFD700, 0x00E676, 0x2979FF, 0xFF4081, 0xFFFFFF]
      const cw = scene.cameras.main.width
      for (let i = 0; i < 50; i++) {
        const x = cw * Math.random()
        const y = -20
        const p = scene.add.rectangle(
          x, y, 5 + Math.random() * 8, 5 + Math.random() * 8,
          confettiColors[i % confettiColors.length], 1,
        ).setDepth(100).setAngle(Math.random() * 360)
        scene.tweens.add({
          targets: p,
          x: x + (Math.random() - 0.5) * 200,
          y: scene.cameras.main.height + 30,
          angle: p.angle + 360 + Math.random() * 540,
          alpha: { from: 1, to: 0.2 },
          duration: 1500 + Math.random() * 1000,
          delay: i * 20,
          ease: 'Power1',
          onComplete: () => p.destroy(),
        })
      }

      const label = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height * 0.30,
        'PIPELINE UNLOCKED!',
        {
          fontSize: '28px',
          color: '#00E676',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        },
      ).setOrigin(0.5).setDepth(150).setAlpha(0)

      scene.tweens.add({
        targets: label,
        alpha: 1,
        y: label.y - 20,
        duration: 500,
        ease: 'Back.easeOut',
      })

      for (let s = 0; s < targets.nodes.length; s++) {
        const nodeX = targets.nodes[s].x
        const nodeY = targets.nodes[s].y
        const pulseG = scene.add.graphics().setDepth(20)
        pulseG.fillStyle(0x00E676, 0.15)
        pulseG.fillRoundedRect(nodeX - 50, nodeY - 30, 100, 60, 10)
        scene.tweens.add({
          targets: pulseG,
          alpha: { from: 0.5, to: 0 },
          scaleX: { from: 0.9, to: 1.3 },
          scaleY: { from: 0.9, to: 1.3 },
          duration: 1500,
          delay: s * 200,
          repeat: 2,
          onComplete: () => pulseG.destroy(),
        })
      }
    } else {
      const label = scene.add.text(
        bn.x, bn.y - 50,
        'BLOCKAGE CLEARED!',
        {
          fontSize: '18px',
          color: '#00E676',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        },
      ).setOrigin(0.5).setDepth(150).setAlpha(0)

      scene.tweens.add({
        targets: label,
        y: label.y - 20,
        alpha: { from: 0, to: 1 },
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
    }

    const completed = targets.destroyedCount >= targets.totalBottlenecks
    return { distance: 15, completed, popups: popup ? [popup] : [] }
  },

  onMiss(scene: Phaser.Scene, targets: any): void {
    targets.shotsUsed++
  },

  isComplete(targets: any): boolean {
    return targets.destroyedCount >= targets.totalBottlenecks || targets.shotsUsed >= 6
  },

  getScore(targets: any): number {
    const base = (targets.destroyedCount / targets.totalBottlenecks) * 70
    const shotBonus = Math.max(0, (6 - targets.shotsUsed) * 10)
    return Math.min(100, Math.round(base + shotBonus))
  },
}
