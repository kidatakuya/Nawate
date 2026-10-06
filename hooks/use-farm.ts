'use client'

import { useCallback } from 'react'
import { useFarmContext } from '@/components/farm/farm-provider'
import { plantsRemovedByConfig } from '@/lib/farm-reducer'
import { generateId } from '@/lib/farm-utils'
import type { GrowthRecordInput, PlantUpdate, ProjectFieldConfigInput, ProjectInput } from '@/lib/types'

export function useFarm() {
  const { state, dispatch } = useFarmContext()
  const addField = useCallback((name: string) => {
    const field = { id: generateId(), name }
    dispatch({ type: 'field/add', payload: field })
    return field
  }, [dispatch])
  const deleteField = useCallback((id: string) => dispatch({ type: 'field/delete', payload: { id } }), [dispatch])
  const addProject = useCallback((input: ProjectInput) => {
    const project = { ...input, id: generateId(), createdAt: new Date().toISOString() }
    dispatch({ type: 'project/add', payload: project })
    return project
  }, [dispatch])
  const deleteProject = useCallback((id: string) => dispatch({ type: 'project/delete', payload: { id } }), [dispatch])
  const endProject = useCallback((id: string, endDate: string) => dispatch({ type: 'project/end', payload: { id, endDate } }), [dispatch])
  const applyFieldConfig = useCallback((projectId: string, fieldId: string, config: ProjectFieldConfigInput) => {
    const plants = state.plants.filter((plant) => plant.projectId === projectId && plant.fieldId === fieldId)
    const removed = plantsRemovedByConfig(plants, config)
    if (removed.length && !window.confirm(`${removed.length}個の登録済み個体が設定範囲外になり、生育記録も削除されます。続けますか？`)) return false
    dispatch({ type: 'config/apply', payload: { projectId, fieldId, config } })
    return true
  }, [dispatch, state.plants])
  const updatePlant = useCallback((id: string, changes: PlantUpdate) => dispatch({ type: 'plant/update', payload: { id, changes } }), [dispatch])
  const bulkUpdatePlants = useCallback((ids: string[], changes: PlantUpdate) => dispatch({ type: 'plant/bulk-update', payload: { ids, changes } }), [dispatch])
  const addRecord = useCallback((input: GrowthRecordInput) => dispatch({ type: 'record/add', payload: { ...input, id: generateId() } }), [dispatch])
  const deleteRecord = useCallback((id: string) => dispatch({ type: 'record/delete', payload: { id } }), [dispatch])
  return { ...state, addField, deleteField, addProject, deleteProject, endProject, applyFieldConfig, updatePlant, bulkUpdatePlants, addRecord, deleteRecord }
}
