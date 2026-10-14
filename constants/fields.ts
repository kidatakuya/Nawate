import type { FieldType } from '@/lib/types'

export const FIELD_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'east', label: '東の畑' },
  { value: 'west', label: '西の畑' },
  { value: 'north', label: '北の畑' },
  { value: 'south', label: '南の畑' },
]

export function fieldLabel(fieldId: FieldType): string {
  return FIELD_OPTIONS.find((field) => field.value === fieldId)?.label ?? fieldId
}
