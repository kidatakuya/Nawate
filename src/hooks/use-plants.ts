'use client'

import { useCallback } from 'react'
import { useAppState } from '@/hooks/use-app-state'
import type { OperationResult } from '@/hooks/operation-result'
import { updatePlantSchema } from '@/schemas/plant'
import type { FieldType } from '@/types/enums'
import type { Plant, PlantUpdate, ProjectFieldConfigInput } from '@/types/models'

export function usePlants() {
  const { plants, updatePlant, applyFieldConfig } = useAppState()

  const update = useCallback((id: string, changes: PlantUpdate): OperationResult<Plant> | null => {
    const current = plants.find((plant) => plant.id === id)
    if (!current) return null
    const result = updatePlantSchema.safeParse(changes)
    if (!result.success) return { success: false, errors: result.error }
    const updated = { ...current, ...result.data }
    updatePlant(id, result.data)
    return { success: true, data: updated }
  }, [plants, updatePlant])

  const applyConfig = useCallback((projectId: string, fieldId: FieldType, config: ProjectFieldConfigInput) => (
    applyFieldConfig(projectId, fieldId, config)
  ), [applyFieldConfig])

  return { plants, update, applyConfig }
}
