export interface MissionMeta {
  id: number
  title: string
  subtitle: string
  description: string
  rank: string
  stage: string
}

export const MISSIONS: MissionMeta[] = [
  {
    id: 1,
    title: 'Restore the Missing Zero',
    subtitle: 'Research',
    description: 'Launch the missing "0" back into the 180DC logo.',
    rank: 'Intern',
    stage: 'Research',
  },
  {
    id: 2,
    title: 'Eliminate Inefficiency',
    subtitle: 'Research',
    description: 'Smash through crates of consulting problems.',
    rank: 'Analyst',
    stage: 'Research',
  },
  {
    id: 3,
    title: 'Collect Client Data',
    subtitle: 'Analysis',
    description: 'Gather floating data folders into your briefcase.',
    rank: 'Associate',
    stage: 'Analysis',
  },
  {
    id: 4,
    title: 'Choose the Best Strategy',
    subtitle: 'Analysis',
    description: 'Pick the one strategy that best drives business growth.',
    rank: 'Consultant',
    stage: 'Strategy',
  },
  {
    id: 5,
    title: 'Break the Bottleneck',
    subtitle: 'Implementation',
    description: 'Remove blockers to let the consulting pipeline flow from Research to Impact.',
    rank: 'Senior Consultant',
    stage: 'Implementation',
  },
  {
    id: 6,
    title: 'Final Presentation',
    subtitle: 'Impact',
    description: 'The grand finale — restore the missing zero on the big stage.',
    rank: 'Partner',
    stage: 'Impact',
  },
]

export const RANKS = [
  { name: 'Intern', minStars: 0 },
  { name: 'Analyst', minStars: 2 },
  { name: 'Associate', minStars: 5 },
  { name: 'Consultant', minStars: 9 },
  { name: 'Senior Consultant', minStars: 13 },
  { name: 'Partner', minStars: 16 },
  { name: 'Managing Partner', minStars: 18 },
]

export function calculateStars(score: number, isHit: boolean): number {
  if (!isHit) return 0
  if (score >= 90) return 3
  if (score >= 60) return 2
  return 1
}

const STORAGE_KEY = '180dc_campaign'

export interface CampaignProgress {
  playerName: string
  levelStars: Record<number, number>
  levelScores: Record<number, number>
  completedLevels: number[]
  attemptedLevels: number[]
  currentLevel: number
}

export function loadProgress(): CampaignProgress {
  if (typeof window === 'undefined') {
    return { playerName: '', levelStars: {}, levelScores: {}, completedLevels: [], attemptedLevels: [], currentLevel: 1 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { playerName: '', levelStars: {}, levelScores: {}, completedLevels: [], attemptedLevels: [], currentLevel: 1 }
}

export function saveProgress(progress: CampaignProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {}
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export function updateLevelResult(levelId: number, stars: number, score: number): CampaignProgress {
  const progress = loadProgress()
  if (stars > (progress.levelStars[levelId] ?? 0)) progress.levelStars[levelId] = stars
  if (score > (progress.levelScores[levelId] ?? 0)) progress.levelScores[levelId] = score
  if (stars > 0 && !progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId)
  }
  if (!progress.attemptedLevels.includes(levelId)) {
    progress.attemptedLevels.push(levelId)
  }
  progress.currentLevel = Math.min(
    Math.max(...progress.attemptedLevels, ...progress.completedLevels, 0) + 1,
    MISSIONS.length,
  )
  saveProgress(progress)
  return progress
}

export function getTotalStars(progress: CampaignProgress): number {
  return Object.values(progress.levelStars).reduce((a, b) => a + b, 0)
}

export function getCurrentRank(progress: CampaignProgress): string {
  const total = getTotalStars(progress)
  let rank = RANKS[0].name
  for (const r of RANKS) {
    if (total >= r.minStars) rank = r.name
  }
  return rank
}

export function isLevelUnlocked(levelId: number, progress: CampaignProgress): boolean {
  if (levelId === 1) return true
  const attempted = progress.attemptedLevels ?? []
  return progress.completedLevels.includes(levelId - 1) || attempted.includes(levelId - 1)
}
