import { z } from 'zod'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const fertilizerItemSchema = z.object({
  name: z.string().trim().min(1, '肥料名を入力してください'),
  date: z.string().regex(datePattern, '日付形式が不正です'),
  amount: z.string().optional().default(''),
  note: z.string().optional().default(''),
})

export const soilWorkSchema = z.object({
  baseFertilizers: z.array(fertilizerItemSchema),
  topDressings: z.array(fertilizerItemSchema),
  sowing: z.string().optional().default(''),
  sowingDate: z.string().regex(datePattern).optional().or(z.literal('')).default(''),
  note: z.string().optional().default(''),
})
