export function calculateScore(distance: number): number {
  if (distance <= 3) return 100
  if (distance <= 5) return 98
  if (distance <= 10) return 95
  if (distance <= 15) return 92
  if (distance <= 20) return 90
  if (distance <= 30) return 85
  if (distance <= 40) return 80
  if (distance <= 50) return 75
  if (distance <= 60) return 70
  if (distance <= 75) return 60
  if (distance <= 90) return 50
  if (distance <= 110) return 40
  if (distance <= 130) return 30
  if (distance <= 160) return 20
  if (distance <= 200) return 10
  return 0
}

export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, error: 'Name is required' }
  if (trimmed.length > 20) return { valid: false, error: 'Name must be 20 characters or less' }
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) return { valid: false, error: 'Only letters and spaces allowed' }
  return { valid: true }
}

const RATE_LIMIT = new Map<string, number>()

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const last = RATE_LIMIT.get(ip)
  if (last && now - last < 15000) return false
  RATE_LIMIT.set(ip, now)

  if (RATE_LIMIT.size > 10000) {
    const cutoff = now - 60000
    for (const [key, val] of RATE_LIMIT) {
      if (val < cutoff) RATE_LIMIT.delete(key)
    }
  }

  return true
}
