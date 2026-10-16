import { z } from 'zod'
import { FieldType } from '@/types/enums'
import { soilWorkSchema } from '@/schemas/soilWork'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

const projectObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'プロジェクト名を入力してください').max(100),
  year: z.number().int().min(2000).max(2100),
  cropName: z.string().trim().min(1, '作物名を入力してください'),
  fieldIds: z.array(z.nativeEnum(FieldType)).min(1, '畑を1つ以上選択してください'),
  startDate: z.string().regex(datePattern, '開始日を入力してください'),
  endDate: z.string().regex(datePattern).nullable(),
  soilWork: soilWorkSchema,
  createdAt: z.string().datetime(),
})

const validateProject = (
  project: { startDate: string; endDate: string | null; fieldIds: FieldType[]; soilWork: z.infer<typeof soilWorkSchema> },
  context: z.RefinementCtx,
) => {
  if (project.endDate !== null && project.endDate < project.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: '終了日は開始日以降の日付にしてください',
    })
  }
  if (project.soilWork.fertilizerMode !== 'perField') return
  for (const fieldId of project.fieldIds) {
    if (!project.soilWork.fieldFertilizers[fieldId]) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['soilWork', 'fieldFertilizers', fieldId],
        message: '使用する畑ごとの肥料設定が必要です',
      })
    }
  }
}

export const projectSchema = projectObjectSchema.superRefine(validateProject)

export const createProjectSchema = projectObjectSchema.omit({ id: true, createdAt: true }).superRefine(validateProject)

export type CreateProjectInput = z.input<typeof createProjectSchema>
