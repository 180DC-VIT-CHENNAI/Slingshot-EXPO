import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { player: true },
    })

    const totalPlayers = await prisma.player.count()

    const bubbles = sessions.map((s: { id: string; player: { name: string }; comment: string; score: number; createdAt: Date }) => ({
      id: s.id,
      name: s.player.name,
      comment: s.comment,
      score: s.score,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({ bubbles, totalPlayers })
  } catch (error) {
    console.error('Bubbles fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
