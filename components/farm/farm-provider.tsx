'use client'

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { buildFarmIndex, type FarmIndex } from '@/lib/farm-index'
import { farmReducer } from '@/lib/farm-reducer'
import { initialState } from '@/lib/seed-data'
import type { AppAction, AppState } from '@/lib/types'

type FarmContextValue = {
  state: AppState
  index: FarmIndex
  dispatch: Dispatch<AppAction>
}

const FarmContext = createContext<FarmContextValue | null>(null)

export function FarmProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(farmReducer, initialState)
  const index = useMemo(() => buildFarmIndex(state), [state])
  const value = useMemo(() => ({ state, index, dispatch }), [state, index])
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>
}

export function useFarmContext(): FarmContextValue {
  const context = useContext(FarmContext)
  if (!context) {
    throw new Error('useFarmContext must be used within FarmProvider')
  }
  return context
}
