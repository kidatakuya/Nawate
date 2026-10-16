'use client'

import { useCallback } from 'react'
import { useFarmContext } from '@/components/farm/farm-provider'
import { plantsRemovedByConfig } from '@/lib/farm-reducer'
import { generateId } from '@/lib/farm-utils'
import type { FieldType, GrowthRecordInput, PlantUpdate, Project, ProjectFieldConfigInput, ProjectInput, SoilWork } from '@/lib/types'

export function useAppState() {
  const { state, dispatch } = useFarmContext()
  const addProject = useCallback((input: ProjectInput) => {
    const project = { ...input, id: generateId(), createdAt: new Date().toISOString() }
    dispatch({ type: 'project/add', payload: project })
    return project
  }, [dispatch])
  const deleteProject = useCallback((id: string) => dispatch({ type: 'project/delete', payload: { id } }), [dispatch])
  const updateProject = useCallback((id: string, changes: Partial<Project>) => dispatch({ type: 'project/update', payload: { id, changes } }), [dispatch])
  const endProject = useCallback((id: string, endDate: string) => dispatch({ type: 'project/end', payload: { id, endDate } }), [dispatch])
  const updateSoilWork = useCallback((id: string, soilWork: SoilWork) => dispatch({ type: 'project/soil-work-update', payload: { id, soilWork } }), [dispatch])
  const applyFieldConfig = useCallback((projectId: string, fieldId: FieldType, config: ProjectFieldConfigInput) => {
    const plants = state.plants.filter((plant) => plant.projectId === projectId && plant.fieldId === fieldId)
    const removed = plantsRemovedByConfig(plants, config)
    if (removed.length && !window.confirm(`${removed.length}個の登録済み個体が設定範囲外になり、関連する生育記録も削除されます。続けますか？`)) return false
    dispatch({ type: 'config/apply', payload: { projectId, fieldId, config } })
    return true
  }, [dispatch, state.plants])
  const updatePlant = useCallback((id: string, changes: PlantUpdate) => dispatch({ type: 'plant/update', payload: { id, changes } }), [dispatch])
  const bulkUpdatePlants = useCallback((ids: string[], changes: PlantUpdate) => dispatch({ type: 'plant/bulk-update', payload: { ids, changes } }), [dispatch])
  const addRecord = useCallback((input: GrowthRecordInput) => dispatch({ type: 'record/add', payload: { ...input, id: generateId() } }), [dispatch])
  const deleteRecord = useCallback((id: string) => dispatch({ type: 'record/delete', payload: { id } }), [dispatch])
  return { ...state, addProject, deleteProject, updateProject, endProject, updateSoilWork, applyFieldConfig, updatePlant, bulkUpdatePlants, addRecord, deleteRecord }
}
