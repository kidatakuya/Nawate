import { z } from 'zod'
import { soilWorkSchema } from '@/schemas/soilWork'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

const projectObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'プロジェクト名を入力してください').max(100),
  year: z.number().int().min(2000).max(2100),
  cropName: z.string().trim().min(1, '作物名を入力してください'),
  fieldIds: z.array(z.enum(['east', 'west', 'north', 'south'])).min(1, '畑を1つ以上選択してください'),
  startDate: z.string().regex(datePattern, '開始日を入力してください'),
  endDate: z.string().regex(datePattern).nullable(),
  soilWork: soilWorkSchema,
  createdAt: z.string().datetime(),
})

const dateOrder = (project: { startDate: string; endDate: string | null }) => (
  project.endDate === null || project.endDate >= project.startDate
)
const dateOrderError = {
  path: ['endDate'],
  message: '終了日は開始日以降の日付にしてください',
}

export const projectSchema = projectObjectSchema.refine(dateOrder, dateOrderError)

export const createProjectSchema = projectObjectSchema.omit({ id: true, createdAt: true }).refine(dateOrder, dateOrderError)

export type CreateProjectInput = z.input<typeof createProjectSchema>
