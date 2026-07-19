import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRandomHitMessage } from '@/lib/messages'
import { validateName, checkRateLimit, calculateScore } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Wait a moment.' }, { status: 429 })
    }

    const body = await request.json()
    const { name, distance } = body

    const trimmedName = (name || '').trim()
    if (trimmedName.length === 0) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    const validation = validateName(trimmedName)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const dist = typeof distance === 'number' && isFinite(distance) && distance >= 0
      ? distance
      : 0
    const finalScore = calculateScore(dist)
    const comment = getRandomHitMessage()

    console.log('[Session] Creating player:', trimmedName, 'distance:', dist, 'score:', finalScore)

    const player = await prisma.player.create({
      data: {
        name: trimmedName,
      },
    })

    console.log('[Session] Player created:', player.id)

    const session = await prisma.session.create({
      data: {
        playerId: player.id,
        score: finalScore,
        comment,
      },
      include: { player: true },
    })

    console.log('[Session] Session created:', session.id)

    return NextResponse.json({
      id: session.id,
      name: session.player.name,
      score: session.score,
      comment: session.comment,
      createdAt: session.createdAt,
    })
  } catch (error) {
    console.error('[Session] ERROR:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const body = await request.json().catch(() => ({}))
    const name = (body.name || '').trim()

    console.log('[Session] Logout:', name || 'Anonymous', 'from IP:', ip)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Session] Logout ERROR:', error)
    return NextResponse.json({ ok: true })
  }
}
