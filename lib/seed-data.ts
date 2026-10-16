import type { AppState, CropStatus, Plant, Project, ProjectFieldConfig } from '@/lib/types'
import { FieldType } from '@/lib/types'

const blankSoilWork = {
  fertilizerMode: 'shared' as const,
  sharedFertilizers: { baseFertilizers: [], topDressings: [] },
  fieldFertilizers: {},
  sowing: '',
  sowingDate: '',
  note: '',
}

const projects: Project[] = [
  {
    id: 'project-tomato-2026',
    name: '2026年春トマト',
    year: 2026,
    cropName: 'トマト',
    fieldIds: [FieldType.YAMADA2, FieldType.YAMADA3],
    startDate: '2026-03-15',
    endDate: null,
    soilWork: { ...blankSoilWork, sharedFertilizers: { ...blankSoilWork.sharedFertilizers, baseFertilizers: [{ name: '完熟堆肥・有機配合肥料', date: '2026-03-08', amount: '畝全体に施用', note: '' }] }, sowing: 'トマト苗', sowingDate: '2026-03-15' },
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'project-lettuce-2026',
    name: '2026年秋レタス',
    year: 2026,
    cropName: 'レタス',
    fieldIds: [FieldType.IKENOUCHI1],
    startDate: '2026-08-20',
    endDate: null,
    soilWork: { ...blankSoilWork, sharedFertilizers: { ...blankSoilWork.sharedFertilizers, baseFertilizers: [{ name: '完熟堆肥・有機肥料', date: '2026-08-10', amount: '', note: '' }] } },
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'project-cucumber-2025',
    name: '2025年夏キュウリ',
    year: 2025,
    cropName: 'キュウリ',
    fieldIds: [FieldType.YAMADA2],
    startDate: '2025-04-10',
    endDate: '2025-09-25',
    soilWork: { ...blankSoilWork, sharedFertilizers: { ...blankSoilWork.sharedFertilizers, baseFertilizers: [{ name: '完熟堆肥・有機肥料', date: '2025-04-05', amount: '', note: '' }] } },
    createdAt: '2025-04-01T09:00:00.000Z',
  },
]

const projectFieldConfigs: ProjectFieldConfig[] = [
  { id: 'config-tomato-east', projectId: 'project-tomato-2026', fieldId: FieldType.YAMADA2, ridgeCount: 3, rowCountPerRidge: 2, plantCountPerRow: 8 },
  { id: 'config-tomato-west', projectId: 'project-tomato-2026', fieldId: FieldType.YAMADA3, ridgeCount: 2, rowCountPerRidge: 2, plantCountPerRow: 6 },
  { id: 'config-lettuce-north', projectId: 'project-lettuce-2026', fieldId: FieldType.IKENOUCHI1, ridgeCount: 3, rowCountPerRidge: 2, plantCountPerRow: 8 },
  { id: 'config-cucumber-east', projectId: 'project-cucumber-2025', fieldId: FieldType.YAMADA2, ridgeCount: 2, rowCountPerRidge: 2, plantCountPerRow: 5 },
]

function initialStatus(projectId: string, ridge: number, row: number, number: number): CropStatus {
  if (projectId === 'project-tomato-2026') {
    if (ridge === 1 && number <= 2) return 'harvested'
    if (ridge === 2) return row === 1 ? 'flowering' : 'growing'
    if (ridge === 3 && number <= 6) return 'sprouted'
  }
  if (projectId === 'project-lettuce-2026' && (ridge === 1 || number <= 5)) return 'growing'
  if (projectId === 'project-cucumber-2025') {
    if (ridge === 1 && number <= 4) return 'harvested'
    if (ridge === 2 && row === 1 && number === 1) return 'withered'
    return 'growing'
  }
  return 'empty'
}

const plants: Plant[] = []
const records: AppState['records'] = []
let plantCounter = 0
for (const config of projectFieldConfigs) {
  const project = projects.find((item) => item.id === config.projectId)!
  for (let ridgeNumber = 1; ridgeNumber <= config.ridgeCount; ridgeNumber += 1) {
    for (let rowNumber = 1; rowNumber <= config.rowCountPerRidge; rowNumber += 1) {
      for (let plantNumber = 1; plantNumber <= config.plantCountPerRow; plantNumber += 1) {
        const status = initialStatus(project.id, ridgeNumber, rowNumber, plantNumber)
        const id = `seed-plant-${++plantCounter}`
        plants.push({
          id,
          projectId: project.id,
          fieldId: config.fieldId,
          ridgeNumber,
          rowNumber,
          plantNumber,
          cropName: status === 'empty' ? null : project.cropName,
          plantedAt: status === 'empty' ? null : project.startDate,
          status,
        })
        if (status !== 'empty' && plantCounter % 7 === 0) {
          records.push({
            id: `seed-record-${records.length + 1}`,
            projectId: project.id,
            plantId: id,
            recordedAt: project.startDate,
            status,
            note: status === 'harvested' ? '収穫を記録しました。' : '生育状態を確認しました。',
          })
        }
      }
    }
  }
}

export const initialState: AppState = { projects, projectFieldConfigs, plants, records }
