import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const topSessions = await prisma.session.findMany({
      take: 20,
      orderBy: { score: 'desc' },
      include: { player: true },
    })

    const leaderboard = topSessions.map((s, idx) => ({
      rank: idx + 1,
      name: s.player.name,
      score: s.score,
      comment: s.comment,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
