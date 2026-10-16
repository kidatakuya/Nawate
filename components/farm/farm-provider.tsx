'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode } from 'react'
import { loadFarmState, saveFarmState, type FarmDataMode } from '@/lib/farm-api'
import { farmReducer } from '@/lib/farm-reducer'
import { initialState } from '@/lib/seed-data'
import type { AppAction, AppState } from '@/lib/types'

type FarmContextValue = { state: AppState; dispatch: Dispatch<AppAction> }
const FarmContext = createContext<FarmContextValue | null>(null)

export function FarmProvider({ children, dataMode }: { children: ReactNode; dataMode: FarmDataMode }) {
  const [state, setState] = useState(initialState)
  const [ready, setReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const stateRef = useRef(state)
  const persistedStateRef = useRef<AppState | null>(null)
  const persistQueueRef = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    loadFarmState(dataMode).then((loadedState) => {
      if (cancelled) return
      stateRef.current = loadedState
      persistedStateRef.current = structuredClone(loadedState)
      setState(loadedState)
      setReady(true)
    }).catch((error: unknown) => {
      if (cancelled) return
      setLoadFailed(true)
      setApiError(error instanceof Error ? error.message : '農業データの読み込みに失敗しました。')
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [dataMode])

  const persistCurrentState = useCallback(() => {
    persistQueueRef.current = persistQueueRef.current.then(async () => {
      const previousState = persistedStateRef.current
      if (!previousState) return
      const targetState = stateRef.current
      await saveFarmState(dataMode, previousState, targetState)
      persistedStateRef.current = structuredClone(targetState)
      setApiError(null)
    }).catch((error: unknown) => {
      setApiError(error instanceof Error ? error.message : '農業データの保存に失敗しました。')
    })
  }, [dataMode])

  const dispatch = useCallback<Dispatch<AppAction>>((action) => {
    if (!ready || loadFailed) return
    const nextState = farmReducer(stateRef.current, action)
    stateRef.current = nextState
    setState(nextState)
    persistCurrentState()
  }, [loadFailed, persistCurrentState, ready])

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  if (!ready) return <p role="status" className="p-6 text-sm text-muted-foreground">農業データを読み込み中です。</p>
  if (loadFailed) {
    return <div role="alert" className="mx-auto mt-8 max-w-xl rounded-xl border bg-card p-6 text-sm">
      <p className="font-semibold">農業データを読み込めませんでした。</p>
      <p className="mt-2 text-muted-foreground">{apiError}</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-md border px-3 py-2">再読み込み</button>
    </div>
  }
  return <FarmContext.Provider value={value}>
    {children}
    {apiError && <div role="alert" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-xl border border-destructive/40 bg-card p-4 text-sm shadow-lg">
      <p className="font-semibold">農業データを保存できませんでした。</p>
      <p className="mt-1 text-muted-foreground">{apiError}</p>
      <button type="button" onClick={persistCurrentState} className="mt-3 rounded-md border px-3 py-2">保存を再試行</button>
    </div>}
  </FarmContext.Provider>
}

export function useFarmContext(): FarmContextValue {
  const context = useContext(FarmContext)
  if (!context) throw new Error('useFarmContext must be used within FarmProvider')
  return context
}
