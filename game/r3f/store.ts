import { create } from 'zustand'
import { graphicsSettings } from '@/game/config/graphics'

export type FlightPhase = 'aim' | 'flying' | 'hit' | 'miss'

interface GameStore {
  countdownStep: string | null
  canDrag: boolean
  pullFactor: number
  flightPhase: FlightPhase
  bloomIntensity: number
  setCountdownStep: (s: string | null) => void
  setCanDrag: (b: boolean) => void
  setPullFactor: (p: number) => void
  setFlightPhase: (p: FlightPhase) => void
  setBloomIntensity: (n: number) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  countdownStep: null,
  canDrag: false,
  pullFactor: 0,
  flightPhase: 'aim',
  bloomIntensity: graphicsSettings.bloomIntensity,
  setCountdownStep: (countdownStep) => set({ countdownStep }),
  setCanDrag: (canDrag) => set({ canDrag }),
  setPullFactor: (pullFactor) => set({ pullFactor }),
  setFlightPhase: (flightPhase) => set({ flightPhase }),
  setBloomIntensity: (bloomIntensity) => set({ bloomIntensity }),
  reset: () =>
    set({
      countdownStep: null,
      canDrag: false,
      pullFactor: 0,
      flightPhase: 'aim',
      bloomIntensity: graphicsSettings.bloomIntensity,
    }),
}))
