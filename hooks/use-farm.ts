'use client'

import { useCallback, useMemo } from 'react'
import { useFarmContext } from '@/components/farm/farm-provider'
import { describePlant } from '@/lib/farm-index'
import {
  buildFieldStructure,
  calcTotalSlots,
  countStatuses,
  emptyStatusCounts,
  generateId,
  type StatusCounts,
} from '@/lib/farm-utils'
import type { Field, FieldInput, GrowthRecord, GrowthRecordInput, PlantUpdate } from '@/lib/types'

export function useFarmIndex() {
  return useFarmContext().index
}

export function useFields() {
  const { state, index, dispatch } = useFarmContext()

  const addField = useCallback(
    (input: FieldInput): Field => {
      const structure = buildFieldStructure(input)
      dispatch({ type: 'field/add', payload: structure })
      return structure.field
    },
    [dispatch],
  )

  const deleteField = useCallback(
    (id: string) => dispatch({ type: 'field/delete', payload: { id } }),
    [dispatch],
  )

  const getField = useCallback((id: string) => index.fieldById.get(id), [index])

  return { fields: state.fields, addField, deleteField, getField }
}

export function useRidges(fieldId: string) {
  const index = useFarmIndex()
  return index.ridgesByField.get(fieldId) ?? []
}

export function useRows(ridgeId: string) {
  const index = useFarmIndex()
  return index.rowsByRidge.get(ridgeId) ?? []
}

export function usePlants() {
  const { index, dispatch } = useFarmContext()

  const updatePlant = useCallback(
    (id: string, changes: PlantUpdate) => dispatch({ type: 'plant/update', payload: { id, changes } }),
    [dispatch],
  )

  const clearPlant = useCallback(
    (id: string) =>
      dispatch({
        type: 'plant/update',
        payload: { id, changes: { cropName: null, plantedAt: null, status: 'empty' } },
      }),
    [dispatch],
  )

  const getPlantsByRow = useCallback((rowId: string) => index.plantsByRow.get(rowId) ?? [], [index])
  const getPlantContext = useCallback((plantId: string) => describePlant(index, plantId), [index])

  return { updatePlant, clearPlant, getPlantsByRow, getPlantContext }
}

export function useGrowthRecords() {
  const { index, dispatch } = useFarmContext()

  const addRecord = useCallback(
    (input: GrowthRecordInput): GrowthRecord => {
      const record: GrowthRecord = { id: generateId(), ...input }
      dispatch({ type: 'record/add', payload: record })
      return record
    },
    [dispatch],
  )

  const deleteRecord = useCallback(
    (id: string) => dispatch({ type: 'record/delete', payload: { id } }),
    [dispatch],
  )

  const getRecordsByPlant = useCallback(
    (plantId: string) => index.recordsByPlant.get(plantId) ?? [],
    [index],
  )

  return { sortedRecords: index.sortedRecords, addRecord, deleteRecord, getRecordsByPlant }
}

export type FieldSummary = {
  field: Field
  totalSlots: number
  statusCounts: StatusCounts
}

export function useDashboard() {
  const { state, index } = useFarmContext()

  return useMemo(() => {
    const fieldSummaries: FieldSummary[] = state.fields.map((field) => ({
      field,
      totalSlots: calcTotalSlots(field),
      statusCounts: countStatuses(index.plantsByField.get(field.id) ?? []),
    }))
    const totals = fieldSummaries.reduce((acc, summary) => {
      for (const key of Object.keys(acc) as (keyof StatusCounts)[]) {
        acc[key] += summary.statusCounts[key]
      }
      return acc
    }, emptyStatusCounts())

    return {
      fieldCount: state.fields.length,
      totalPlants: state.plants.length,
      activePlants: totals.sprouted + totals.growing + totals.flowering,
      recordCount: state.records.length,
      totals,
      fieldSummaries,
    }
  }, [state, index])
}
