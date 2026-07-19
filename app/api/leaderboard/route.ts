import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const allSessions = await prisma.session.findMany({
      include: { player: true },
      orderBy: { score: 'desc' },
    })

    const bestByPlayer = new Map<string, { name: string; score: number; comment: string; createdAt: Date }>()
    for (const s of allSessions) {
      const existing = bestByPlayer.get(s.playerId)
      if (!existing || s.score > existing.score) {
        bestByPlayer.set(s.playerId, {
          name: s.player.name,
          score: s.score,
          comment: s.comment,
          createdAt: s.createdAt,
        })
      }
    }

    const leaderboard = Array.from(bestByPlayer.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((entry, idx) => ({
        rank: idx + 1,
        name: entry.name,
        score: entry.score,
        comment: entry.comment,
        createdAt: entry.createdAt,
      }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
