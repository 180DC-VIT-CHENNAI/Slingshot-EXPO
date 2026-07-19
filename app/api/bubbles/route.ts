import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: { player: true },
    })

    const totalPlayers = await prisma.player.count()

    const seen = new Set<string>()
    const bubbles: { id: string; name: string; comment: string; score: number; createdAt: Date }[] = []
    for (const s of sessions) {
      if (seen.has(s.playerId)) continue
      seen.add(s.playerId)
      bubbles.push({
        id: s.id,
        name: s.player.name,
        comment: s.comment,
        score: s.score,
        createdAt: s.createdAt,
      })
      if (bubbles.length >= 80) break
    }

    return NextResponse.json({ bubbles, totalPlayers })
  } catch (error) {
    console.error('Bubbles fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
