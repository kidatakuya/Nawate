import { z } from 'zod'
import { FIELD_LIMITS } from '@/lib/farm-utils'

export const projectFieldConfigSchema = z.object({
  ridgeCount: z.number().int().min(FIELD_LIMITS.ridgeCount.min).max(FIELD_LIMITS.ridgeCount.max),
  rowCountPerRidge: z.number().int().min(FIELD_LIMITS.rowCountPerRidge.min).max(FIELD_LIMITS.rowCountPerRidge.max),
  plantCountPerRow: z.number().int().min(FIELD_LIMITS.plantCountPerRow.min).max(FIELD_LIMITS.plantCountPerRow.max),
}).refine((config) => (
  config.ridgeCount * config.rowCountPerRidge * config.plantCountPerRow <= FIELD_LIMITS.totalSlots
), `総個体数は${FIELD_LIMITS.totalSlots}以下にしてください`)
