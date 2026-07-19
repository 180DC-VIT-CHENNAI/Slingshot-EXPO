import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEED_NAMES = [
  'Aarav',
  'Diya',
  'Arjun',
  'Sara',
  'Vivaan',
  'Ananya',
  'Reyansh',
  'Ishaan',
  'Saanvi',
  'Aditya',
]

const SEED_COMMENTS = [
  '180DC just gained another consultant! 🎯',
  'That was smoother than our pitch decks. 💎',
  'Board meeting adjourned. You crushed it. 🏆',
  'The strategy worked... for once. 😎',
  'You just optimized our ROI by 200%. 📈',
  'Framework applied. Results: SPECTACULAR. ✨',
  'Innovation delivered. You ARE the innovation. 🧠',
  'Recommendation accepted: You should join 180DC. 🤝',
  'Presentation delivered. Standing ovation. 👏',
  'Problem solved. Data verified. Hero confirmed. 🦸',
]

async function main() {
  console.log('Seeding database...')

  for (let i = 0; i < SEED_NAMES.length; i++) {
    const player = await prisma.player.create({
      data: {
        name: SEED_NAMES[i],
        sessions: {
          create: {
            score: 100,
            comment: SEED_COMMENTS[i],
          },
        },
      },
    })
    console.log(`  Created: ${player.name}`)
  }

  const count = await prisma.player.count()
  console.log(`Seed complete. ${count} players in database.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
