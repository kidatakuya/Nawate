import { z } from 'zod'
import { FieldType } from '@/types/enums'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const fertilizerItemSchema = z.object({
  name: z.string().trim().min(1, '肥料名を入力してください'),
  date: z.string().regex(datePattern, '日付形式が不正です'),
  amount: z.string().optional().default(''),
  note: z.string().optional().default(''),
})

export const fertilizerPlanSchema = z.object({
  baseFertilizers: z.array(fertilizerItemSchema),
  topDressings: z.array(fertilizerItemSchema),
})

const soilWorkObjectSchema = z.object({
  fertilizerMode: z.enum(['shared', 'perField']),
  sharedFertilizers: fertilizerPlanSchema,
  fieldFertilizers: z.record(z.string(), fertilizerPlanSchema).refine(
    (plans) => Object.keys(plans).every((fieldId) => Object.values(FieldType).includes(fieldId as FieldType)),
    '畑の識別子が不正です',
  ),
  sowing: z.string().optional().default(''),
  sowingDate: z.string().regex(datePattern).optional().or(z.literal('')).default(''),
  note: z.string().optional().default(''),
})

export const soilWorkSchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const legacy = value as Record<string, unknown>
  if (!('baseFertilizers' in legacy) && !('topDressings' in legacy)) return value
  return {
    fertilizerMode: 'shared',
    sharedFertilizers: {
      baseFertilizers: legacy.baseFertilizers ?? [],
      topDressings: legacy.topDressings ?? [],
    },
    fieldFertilizers: {},
    sowing: legacy.sowing,
    sowingDate: legacy.sowingDate,
    note: legacy.note,
  }
}, soilWorkObjectSchema)
