'use client'

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { farmReducer } from '@/lib/farm-reducer'
import { initialState } from '@/lib/seed-data'
import type { AppAction, AppState } from '@/lib/types'

type FarmContextValue = { state: AppState; dispatch: Dispatch<AppAction> }
const FarmContext = createContext<FarmContextValue | null>(null)

export function FarmProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(farmReducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>
}

export function useFarmContext(): FarmContextValue {
  const context = useContext(FarmContext)
  if (!context) throw new Error('useFarmContext must be used within FarmProvider')
  return context
}
