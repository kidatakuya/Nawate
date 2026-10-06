import type { AppState, CropStatus, Plant } from '@/lib/types'

const fieldMasters = [
  { id: 'field-east', name: '東の畑' },
  { id: 'field-greenhouse', name: '南のハウス' },
  { id: 'field-north', name: '北の畑' },
]

const projects = [
  { id: 'project-tomato-2026', name: '2026年春トマト', year: 2026, cropName: 'トマト', fieldIds: ['field-east', 'field-greenhouse'], startDate: '2026-03-15', endDate: null, createdAt: '2026-03-01T09:00:00.000Z' },
  { id: 'project-lettuce-2026', name: '2026年秋レタス', year: 2026, cropName: 'レタス', fieldIds: ['field-north'], startDate: '2026-08-20', endDate: null, createdAt: '2026-08-01T09:00:00.000Z' },
  { id: 'project-cucumber-2025', name: '2025年夏キュウリ', year: 2025, cropName: 'キュウリ', fieldIds: ['field-east'], startDate: '2025-04-10', endDate: '2025-09-25', createdAt: '2025-04-01T09:00:00.000Z' },
]

const projectFieldConfigs = [
  { id: 'config-tomato-east', projectId: 'project-tomato-2026', fieldId: 'field-east', ridgeCount: 3, rowCountPerRidge: 2, plantCountPerRow: 8 },
  { id: 'config-tomato-house', projectId: 'project-tomato-2026', fieldId: 'field-greenhouse', ridgeCount: 2, rowCountPerRidge: 2, plantCountPerRow: 6 },
  { id: 'config-lettuce-north', projectId: 'project-lettuce-2026', fieldId: 'field-north', ridgeCount: 3, rowCountPerRidge: 2, plantCountPerRow: 8 },
  { id: 'config-cucumber-east', projectId: 'project-cucumber-2025', fieldId: 'field-east', ridgeCount: 2, rowCountPerRidge: 2, plantCountPerRow: 5 },
]

const statusFor = (projectId: string, ridge: number, row: number, number: number): CropStatus => {
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
        const status = statusFor(project.id, ridgeNumber, rowNumber, plantNumber)
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

export const initialState: AppState = { fieldMasters, projects, projectFieldConfigs, plants, records }
