import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Vercel serverless, each function instance gets its own PrismaClient.
// The globalForPrisma cache keeps one client per warm instance (prevents
// connection exhaustion across requests within the same instance).
//
// IMPORTANT: ensure DATABASE_URL uses PgBouncer / connection pooling to avoid
// exhausting the DB connection pool under concurrent load.
//   Neon:  append ?pgbouncer=true&connection_limit=1&pool_timeout=1
//   Supabase: use the pooled connection string (port 6543, ?pgbouncer=true)
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
