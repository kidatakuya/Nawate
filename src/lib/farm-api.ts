import { mockFarmApi } from '@/lib/mock-farm-api'
import { loadFarmState as loadSupabaseFarmState, saveFarmState as saveSupabaseFarmState } from '@/lib/supabase'
import type { AppState } from '@/lib/types'

export type FarmDataMode = 'mock' | 'supabase'

export function loadFarmState(mode: FarmDataMode): Promise<AppState> {
  return mode === 'mock' ? mockFarmApi.load() : loadSupabaseFarmState()
}

export function saveFarmState(mode: FarmDataMode, previous: AppState, next: AppState): Promise<void> {
  return mode === 'mock' ? mockFarmApi.save(next) : saveSupabaseFarmState(previous, next)
}
