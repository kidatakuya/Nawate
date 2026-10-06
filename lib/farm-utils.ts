import type { CropStatus } from '@/lib/types'

export const CROP_STATUSES: readonly CropStatus[] = [
  'empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered',
]

export const CROP_STATUS_LABELS: Record<CropStatus, string> = {
  empty: '空き',
  sprouted: '発芽',
  growing: '生育中',
  flowering: '開花',
  harvested: '収穫済',
  withered: '枯死',
}

export const STATUS_CLASSES: Record<CropStatus, string> = {
  empty: 'bg-status-empty',
  sprouted: 'bg-status-sprouted',
  growing: 'bg-status-growing',
  flowering: 'bg-status-flowering',
  harvested: 'bg-status-harvested',
  withered: 'bg-status-withered',
}

export const NEXT_STATUS: Record<CropStatus, CropStatus | null> = {
  empty: 'sprouted',
  sprouted: 'growing',
  growing: 'flowering',
  flowering: 'harvested',
  harvested: null,
  withered: null,
}

export type StatusCounts = Record<CropStatus, number>

export function emptyStatusCounts(): StatusCounts {
  return { empty: 0, sprouted: 0, growing: 0, flowering: 0, harvested: 0, withered: 0 }
}

export function countStatuses(plants: readonly { status: CropStatus }[]): StatusCounts {
  const counts = emptyStatusCounts()
  for (const plant of plants) counts[plant.status] += 1
  return counts
}

export function totalOf(counts: StatusCounts): number {
  return CROP_STATUSES.reduce((sum, status) => sum + counts[status], 0)
}

export function usedOf(counts: StatusCounts): number {
  return totalOf(counts) - counts.empty
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function todayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function formatDate(value: string | null | undefined): string {
  return value ? value.replaceAll('-', '/') : '—'
}

export function plantDisplayName(fieldName: string, ridgeNumber: number, rowNumber: number, plantNumber: number): string {
  return `${fieldName} / 畝${ridgeNumber} / 列${rowNumber} / ${plantNumber}番`
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const FIELD_LIMITS = {
  nameMaxLength: 40,
  ridgeCount: { min: 1, max: 50 },
  rowCountPerRidge: { min: 1, max: 20 },
  plantCountPerRow: { min: 1, max: 200 },
  totalSlots: 10000,
} as const

export const numberFormatter = new Intl.NumberFormat('ja-JP')
