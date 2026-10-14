import type { ZodError } from 'zod'

export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ZodError }
