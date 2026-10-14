import { z } from 'zod'

export const growthRecordSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  plantId: z.string().uuid(),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['sprouted', 'growing', 'flowering', 'harvested', 'withered']),
  note: z.string().max(500).optional().default(''),
})

export const createRecordSchema = growthRecordSchema.omit({ id: true })

export type CreateRecordInput = z.input<typeof createRecordSchema>
