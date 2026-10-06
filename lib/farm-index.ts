import { plantDisplayName } from '@/lib/farm-utils'
import type { AppState, Field, GrowthRecord, Plant, Ridge, Row } from '@/lib/types'

export type FarmIndex = {
  fieldById: Map<string, Field>
  ridgeById: Map<string, Ridge>
  rowById: Map<string, Row>
  plantById: Map<string, Plant>
  ridgesByField: Map<string, Ridge[]>
  rowsByRidge: Map<string, Row[]>
  plantsByField: Map<string, Plant[]>
  plantsByRidge: Map<string, Plant[]>
  plantsByRow: Map<string, Plant[]>
  sortedRecords: GrowthRecord[]
  recordsByPlant: Map<string, GrowthRecord[]>
}

function groupBy<T>(items: readonly T[], getKey: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = getKey(item)
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return map
}

function byId<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

/** Newest date first; among equal dates the most recently added comes first. */
export function sortRecordsDesc(records: readonly GrowthRecord[]): GrowthRecord[] {
  return [...records]
    .reverse()
    .sort((a, b) => (a.recordedAt === b.recordedAt ? 0 : a.recordedAt < b.recordedAt ? 1 : -1))
}

export function buildFarmIndex(state: AppState): FarmIndex {
  const sortedRecords = sortRecordsDesc(state.records)
  return {
    fieldById: byId(state.fields),
    ridgeById: byId(state.ridges),
    rowById: byId(state.rows),
    plantById: byId(state.plants),
    ridgesByField: groupBy(state.ridges, (ridge) => ridge.fieldId),
    rowsByRidge: groupBy(state.rows, (row) => row.ridgeId),
    plantsByField: groupBy(state.plants, (plant) => plant.fieldId),
    plantsByRidge: groupBy(state.plants, (plant) => plant.ridgeId),
    plantsByRow: groupBy(state.plants, (plant) => plant.rowId),
    sortedRecords,
    recordsByPlant: groupBy(sortedRecords, (record) => record.plantId),
  }
}

export type PlantContext = {
  plant: Plant
  field: Field
  ridge: Ridge
  row: Row
  displayName: string
}

export function describePlant(index: FarmIndex, plantId: string): PlantContext | null {
  const plant = index.plantById.get(plantId)
  if (!plant) return null
  const field = index.fieldById.get(plant.fieldId)
  const ridge = index.ridgeById.get(plant.ridgeId)
  const row = index.rowById.get(plant.rowId)
  if (!field || !ridge || !row) return null
  return {
    plant,
    field,
    ridge,
    row,
    displayName: plantDisplayName(field.name, ridge.ridgeNumber, row.rowNumber, plant.plantNumber),
  }
}
