import { initialState } from '@/lib/seed-data'
import type { AppState } from '@/lib/types'

let mockState = structuredClone(initialState)

export const mockFarmApi = {
  async load(): Promise<AppState> {
    return structuredClone(mockState)
  },
  async save(state: AppState): Promise<void> {
    mockState = structuredClone(state)
  },
}
