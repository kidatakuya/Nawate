import type { CropStatus, Field, FieldInput, FieldStructure, Plant, Ridge, Row } from '@/lib/types'

export const CROP_STATUSES: readonly CropStatus[] = [
  'empty',
  'sprouted',
  'growing',
  'flowering',
  'harvested',
  'withered',
]

export const CROP_STATUS_LABELS: Record<CropStatus, string> = {
  empty: '未使用',
  sprouted: '発芽',
  growing: '生育中',
  flowering: '開花',
  harvested: '収穫済',
  withered: '枯死',
}

export const NEXT_STATUS: Record<CropStatus, CropStatus | null> = {
  empty: 'sprouted',
  sprouted: 'growing',
  growing: 'flowering',
  flowering: 'harvested',
  harvested: null,
  withered: null,
}

export function isCropStatus(value: string): value is CropStatus {
  return (CROP_STATUSES as readonly string[]).includes(value)
}

export function isUsedStatus(status: CropStatus): boolean {
  return status !== 'empty'
}

export type UsageCategory = 'empty' | 'active' | 'harvested' | 'withered'

export const USAGE_CATEGORIES: readonly { key: UsageCategory; label: string }[] = [
  { key: 'empty', label: '空き' },
  { key: 'active', label: '使用中' },
  { key: 'harvested', label: '収穫済' },
  { key: 'withered', label: '枯死' },
]

export function usageCategoryOf(status: CropStatus): UsageCategory {
  if (status === 'empty' || status === 'harvested' || status === 'withered') return status
  return 'active'
}

export type StatusCounts = Record<CropStatus, number>

export function emptyStatusCounts(): StatusCounts {
  return { empty: 0, sprouted: 0, growing: 0, flowering: 0, harvested: 0, withered: 0 }
}

export function countStatuses(plants: readonly Plant[]): StatusCounts {
  const counts = emptyStatusCounts()
  for (const plant of plants) counts[plant.status] += 1
  return counts
}

export function countUsage(counts: StatusCounts): Record<UsageCategory, number> {
  return {
    empty: counts.empty,
    active: counts.sprouted + counts.growing + counts.flowering,
    harvested: counts.harvested,
    withered: counts.withered,
  }
}

export function totalOf(counts: StatusCounts): number {
  return CROP_STATUSES.reduce((sum, status) => sum + counts[status], 0)
}

export function usedOf(counts: StatusCounts): number {
  return totalOf(counts) - counts.empty
}

export const FIELD_LIMITS = {
  nameMaxLength: 40,
  ridgeCount: { min: 1, max: 50 },
  rowCountPerRidge: { min: 1, max: 20 },
  plantCountPerRow: { min: 1, max: 200 },
  totalSlots: 10000,
} as const

export function calcTotalSlots(
  field: Pick<Field, 'ridgeCount' | 'rowCountPerRidge' | 'plantCountPerRow'>,
): number {
  return field.ridgeCount * field.rowCountPerRidge * field.plantCountPerRow
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Receives a hierarchical key (e.g. "-r1-c2-p3") so seed data can use deterministic IDs. */
export type IdFactory = (key: string) => string

export function buildFieldStructure(
  input: FieldInput,
  createId: IdFactory = () => generateId(),
): FieldStructure {
  const field: Field = { id: createId(''), ...input }
  const ridges: Ridge[] = []
  const rows: Row[] = []
  const plants: Plant[] = []

  for (let r = 1; r <= input.ridgeCount; r++) {
    const ridge: Ridge = { id: createId(`-r${r}`), fieldId: field.id, ridgeNumber: r }
    ridges.push(ridge)
    for (let c = 1; c <= input.rowCountPerRidge; c++) {
      const row: Row = { id: createId(`-r${r}-c${c}`), ridgeId: ridge.id, fieldId: field.id, rowNumber: c }
      rows.push(row)
      for (let p = 1; p <= input.plantCountPerRow; p++) {
        plants.push({
          id: createId(`-r${r}-c${c}-p${p}`),
          fieldId: field.id,
          ridgeId: ridge.id,
          rowId: row.id,
          plantNumber: p,
          cropName: null,
          plantedAt: null,
          status: 'empty',
        })
      }
    }
  }

  return { field, ridges, rows, plants }
}

export function plantDisplayName(
  fieldName: string,
  ridgeNumber: number,
  rowNumber: number,
  plantNumber: number,
): string {
  return `${fieldName} / 畝${ridgeNumber} / 列${rowNumber} / ${plantNumber}番`
}

export const hrefs = {
  fields: () => '/fields',
  field: (fieldId: string) => `/fields/${fieldId}`,
  ridge: (fieldId: string, ridgeId: string) => `/fields/${fieldId}/ridges/${ridgeId}`,
  row: (fieldId: string, ridgeId: string, rowId: string) =>
    `/fields/${fieldId}/ridges/${ridgeId}/rows/${rowId}`,
  plant: (fieldId: string, ridgeId: string, rowId: string, plantId: string) =>
    `/fields/${fieldId}/ridges/${ridgeId}/rows/${rowId}?plant=${plantId}`,
}

export function formatDate(value: string | null): string {
  return value ? value.replaceAll('-', '/') : '—'
}

export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

export function todayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const numberFormatter = new Intl.NumberFormat('ja-JP')
