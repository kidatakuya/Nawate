import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export {
  calculateCapacity,
  formatDate,
  generateId,
  getFieldLabel,
  todayString,
} from '@/lib/farm-utils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
