import { z } from 'zod'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const plantSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  fieldId: z.enum(['east', 'west', 'north', 'south']),
  ridgeNumber: z.number().int().min(1),
  rowNumber: z.number().int().min(1),
  plantNumber: z.number().int().min(1),
  cropName: z.string().nullable(),
  plantedAt: z.string().regex(datePattern).nullable(),
  status: z.enum(['empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered']),
})

export const updatePlantSchema = plantSchema.partial()
