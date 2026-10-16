import { createProjectSchema, projectSchema } from '@/schemas/project'
import { plantSchema, updatePlantSchema } from '@/schemas/plant'
import { createRecordSchema, growthRecordSchema } from '@/schemas/record'
import { fertilizerItemSchema, soilWorkSchema } from '@/schemas/soilWork'
import { FieldType } from '@/types/enums'

const soilWork = {
  fertilizerMode: 'shared' as const,
  sharedFertilizers: {
    baseFertilizers: [{ name: '有機肥料', date: '2026-03-01', amount: '1kg', note: '' }],
    topDressings: [],
  },
  fieldFertilizers: {},
  sowing: 'トマト苗',
  sowingDate: '2026-03-15',
  note: '',
}

const project = {
  id: 'f4d6f445-90da-46ab-bd03-41446e0bc58f',
  name: '2026年春トマト',
  year: 2026,
  cropName: 'トマト',
  fieldIds: [FieldType.YAMADA2],
  startDate: '2026-03-15',
  endDate: null,
  soilWork,
  createdAt: '2026-03-01T09:00:00.000Z',
}

describe('soilWorkSchema', () => {
  it('accepts multiple fertilizer items and supplies optional defaults', () => {
    expect(fertilizerItemSchema.parse({
      name: '有機肥料',
      date: '2026-03-01',
    })).toEqual({
      name: '有機肥料',
      date: '2026-03-01',
      amount: '',
      note: '',
    })
    expect(soilWorkSchema.parse({
      fertilizerMode: 'perField',
      sharedFertilizers: { baseFertilizers: [], topDressings: [] },
      fieldFertilizers: {
        yamada2: {
          baseFertilizers: [
            { name: '堆肥', date: '2026-02-20' },
            { name: '有機肥料', date: '2026-03-01', amount: '1kg', note: '畝ごとに施用' },
          ],
          topDressings: [{ name: '液肥', date: '2026-03-20' }],
        },
      },
    })).toEqual({
      fertilizerMode: 'perField',
      sharedFertilizers: { baseFertilizers: [], topDressings: [] },
      fieldFertilizers: {
        yamada2: {
          baseFertilizers: [
            { name: '堆肥', date: '2026-02-20', amount: '', note: '' },
            { name: '有機肥料', date: '2026-03-01', amount: '1kg', note: '畝ごとに施用' },
          ],
          topDressings: [{ name: '液肥', date: '2026-03-20', amount: '', note: '' }],
        },
      },
      sowing: '',
      sowingDate: '',
      note: '',
    })
  })

  it('rejects missing fertilizer names and malformed dates', () => {
    expect(fertilizerItemSchema.safeParse({ name: '', date: '2026-03-01' }).success).toBe(false)
    expect(fertilizerItemSchema.safeParse({ name: '肥料', date: '2026/03/01' }).success).toBe(false)
    expect(soilWorkSchema.safeParse({ ...soilWork, sowingDate: '2026/03/01' }).success).toBe(false)
  })

  it('converts existing shared fertilizer data to the new shared mode', () => {
    expect(soilWorkSchema.parse({
      baseFertilizers: [{ name: '有機肥料', date: '2026-03-01' }],
      topDressings: [],
      sowing: '',
      sowingDate: '',
      note: '',
    })).toMatchObject({
      fertilizerMode: 'shared',
      sharedFertilizers: { baseFertilizers: [{ name: '有機肥料', date: '2026-03-01', amount: '', note: '' }] },
    })
  })
})

describe('project schemas', () => {
  it('accepts complete project and its creation input', () => {
    expect(projectSchema.safeParse(project).success).toBe(true)
    const { id, createdAt, ...input } = project
    expect(createProjectSchema.safeParse(input).success).toBe(true)
    expect(id).toBeTruthy()
    expect(createdAt).toBeTruthy()
  })

  it('rejects invalid fields, years, required fields, and date order', () => {
    expect(createProjectSchema.safeParse({ ...project, fieldIds: [] }).success).toBe(false)
    expect(createProjectSchema.safeParse({ ...project, year: 2200 }).success).toBe(false)
    expect(createProjectSchema.safeParse({ ...project, name: '' }).success).toBe(false)
    expect(createProjectSchema.safeParse({ ...project, endDate: '2026-03-01' }).success).toBe(false)
    expect(createProjectSchema.safeParse({ ...project, soilWork: { ...soilWork, sharedFertilizers: { baseFertilizers: [{ name: '', date: '2026-03-01' }], topDressings: [] } } }).success).toBe(false)
  })

  it('requires a fertilizer plan for every selected field in per-field mode', () => {
    const perFieldProject = {
      ...project,
      fieldIds: [FieldType.YAMADA2, FieldType.YAMADA3],
      soilWork: {
        ...soilWork,
        fertilizerMode: 'perField' as const,
        fieldFertilizers: {
          [FieldType.YAMADA2]: { baseFertilizers: [], topDressings: [] },
          [FieldType.YAMADA3]: { baseFertilizers: [], topDressings: [] },
        },
      },
    }
    expect(projectSchema.safeParse(perFieldProject).success).toBe(true)
    expect(projectSchema.safeParse({
      ...perFieldProject,
      soilWork: { ...perFieldProject.soilWork, fieldFertilizers: { [FieldType.YAMADA2]: { baseFertilizers: [], topDressings: [] } } },
    }).success).toBe(false)
  })
})

describe('plant schemas', () => {
  const plant = {
    id: 'a2d97b05-e7e4-429c-a81a-95e27b0d0e22',
    projectId: project.id,
    fieldId: FieldType.YAMADA2,
    ridgeNumber: 1,
    rowNumber: 1,
    plantNumber: 1,
    cropName: 'トマト',
    plantedAt: '2026-03-15',
    status: 'growing',
  }

  it('accepts valid plant and partial updates', () => {
    expect(plantSchema.safeParse(plant).success).toBe(true)
    expect(updatePlantSchema.safeParse({ status: 'empty', cropName: null, plantedAt: null }).success).toBe(true)
  })

  it('rejects invalid coordinates and dates', () => {
    expect(plantSchema.safeParse({ ...plant, ridgeNumber: 0 }).success).toBe(false)
    expect(plantSchema.safeParse({ ...plant, plantedAt: 'yesterday' }).success).toBe(false)
  })
})

describe('growth record schemas', () => {
  const record = {
    id: 'f9d7d7bc-1e4b-47c8-b032-2dc210fdb087',
    projectId: project.id,
    plantId: 'a2d97b05-e7e4-429c-a81a-95e27b0d0e22',
    recordedAt: '2026-04-01',
    status: 'flowering',
    note: '開花を確認',
  }

  it('accepts a valid record and defaults its note', () => {
    expect(growthRecordSchema.safeParse(record).success).toBe(true)
    const { id, ...input } = record
    expect(createRecordSchema.parse({ ...input, note: undefined }).note).toBe('')
    expect(id).toBeTruthy()
  })

  it('rejects empty status, invalid dates, and overlong notes', () => {
    expect(createRecordSchema.safeParse({ ...record, status: 'empty' }).success).toBe(false)
    expect(createRecordSchema.safeParse({ ...record, recordedAt: '2026/04/01' }).success).toBe(false)
    expect(createRecordSchema.safeParse({ ...record, note: 'x'.repeat(501) }).success).toBe(false)
  })
})
