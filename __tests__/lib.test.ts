import { calculateCapacity, formatDate, generateId, getFieldLabel, todayString } from '@/lib/utils'

describe('utility functions', () => {
  it('generates UUIDs', () => {
    expect(generateId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('formats dates as YYYY/MM/DD', () => {
    expect(formatDate('2026-03-05')).toBe('2026/03/05')
  })

  it('returns today as YYYY-MM-DD', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('calculates field capacity', () => {
    expect(calculateCapacity(3, 2, 8)).toBe(48)
  })

  it('returns the configured field label', () => {
    expect(getFieldLabel('north')).toBe('北の畑')
  })
})
