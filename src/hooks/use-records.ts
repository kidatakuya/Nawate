'use client'

import { useCallback } from 'react'
import { useAppState } from '@/hooks/use-app-state'
import type { OperationResult } from '@/hooks/operation-result'
import { createRecordSchema } from '@/schemas/record'
import type { CreateRecordInput } from '@/schemas/record'
import type { GrowthRecord } from '@/types/models'
import { generateId } from '@/lib/farm-utils'

export function validateCreateRecord(input: CreateRecordInput) {
  return createRecordSchema.safeParse(input)
}

export function useRecords() {
  const { records, addRecord, deleteRecord } = useAppState()
  const create = useCallback((input: CreateRecordInput): OperationResult<GrowthRecord> => {
    const result = validateCreateRecord(input)
    if (!result.success) return { success: false, errors: result.error }
    const record = { ...result.data, id: generateId() }
    addRecord(record)
    return { success: true, data: record }
  }, [addRecord])

  return { records, create, remove: deleteRecord }
}
