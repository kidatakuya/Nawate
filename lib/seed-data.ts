import { buildFieldStructure } from '@/lib/farm-utils'
import type { AppState, CropStatus, FieldStructure, GrowthRecord } from '@/lib/types'

type PlantingRule = {
  ridgeNumber: number
  cropName: string
  plantedAt: string
  statusFor: (rowNumber: number, plantNumber: number) => CropStatus
}

function applyPlantings(structure: FieldStructure, rules: PlantingRule[]): FieldStructure {
  const ridgeNumberById = new Map(structure.ridges.map((ridge) => [ridge.id, ridge.ridgeNumber]))
  const rowNumberById = new Map(structure.rows.map((row) => [row.id, row.rowNumber]))

  return {
    ...structure,
    plants: structure.plants.map((plant) => {
      const rule = rules.find((r) => r.ridgeNumber === ridgeNumberById.get(plant.ridgeId))
      if (!rule) return plant
      const status = rule.statusFor(rowNumberById.get(plant.rowId) ?? 0, plant.plantNumber)
      if (status === 'empty') return plant
      return { ...plant, cropName: rule.cropName, plantedAt: rule.plantedAt, status }
    }),
  }
}

// Seed IDs are deterministic so server and client renders match.
const north = applyPlantings(
  buildFieldStructure(
    { name: '北の畑', ridgeCount: 4, rowCountPerRidge: 3, plantCountPerRow: 8 },
    (key) => `seed-north${key}`,
  ),
  [
    {
      ridgeNumber: 1,
      cropName: 'トマト',
      plantedAt: '2026-05-08',
      statusFor: (row, n) =>
        n === 8 ? 'empty' : n === 7 && row === 3 ? 'withered' : n <= 2 ? 'harvested' : 'flowering',
    },
    {
      ridgeNumber: 2,
      cropName: 'ナス',
      plantedAt: '2026-05-20',
      statusFor: (row, n) => (n > 6 ? 'empty' : row === 1 ? 'flowering' : 'growing'),
    },
    {
      ridgeNumber: 3,
      cropName: 'キュウリ',
      plantedAt: '2026-07-01',
      statusFor: (row, n) => (row === 3 || n > 5 ? 'empty' : 'sprouted'),
    },
  ],
)

const house = applyPlantings(
  buildFieldStructure(
    { name: '南のハウス', ridgeCount: 2, rowCountPerRidge: 2, plantCountPerRow: 6 },
    (key) => `seed-house${key}`,
  ),
  [
    {
      ridgeNumber: 1,
      cropName: 'イチゴ',
      plantedAt: '2026-09-10',
      statusFor: (_row, n) => (n <= 4 ? 'sprouted' : 'empty'),
    },
    {
      ridgeNumber: 2,
      cropName: 'レタス',
      plantedAt: '2026-08-15',
      statusFor: (row) => (row === 1 ? 'harvested' : 'growing'),
    },
  ],
)

const seedRecords: GrowthRecord[] = [
  { id: 'seed-rec-1', plantId: 'seed-north-r1-c1-p3', recordedAt: '2026-05-15', status: 'sprouted', note: '活着良好。支柱を設置。' },
  { id: 'seed-rec-2', plantId: 'seed-north-r1-c1-p3', recordedAt: '2026-06-05', status: 'growing', note: '脇芽かきを実施。' },
  { id: 'seed-rec-3', plantId: 'seed-north-r1-c1-p3', recordedAt: '2026-07-02', status: 'flowering', note: '第1花房が開花。' },
  { id: 'seed-rec-4', plantId: 'seed-north-r1-c1-p1', recordedAt: '2026-08-10', status: 'harvested', note: '初収穫 6個。' },
  { id: 'seed-rec-5', plantId: 'seed-north-r1-c3-p7', recordedAt: '2026-08-20', status: 'withered', note: '青枯病の疑い。抜き取り済み。' },
  { id: 'seed-rec-6', plantId: 'seed-north-r2-c1-p1', recordedAt: '2026-07-18', status: 'flowering', note: '' },
  { id: 'seed-rec-7', plantId: 'seed-north-r3-c1-p1', recordedAt: '2026-07-08', status: 'sprouted', note: '本葉2枚。' },
  { id: 'seed-rec-8', plantId: 'seed-house-r2-c1-p1', recordedAt: '2026-09-28', status: 'harvested', note: '結球良好。' },
  { id: 'seed-rec-9', plantId: 'seed-house-r1-c1-p1', recordedAt: '2026-09-20', status: 'sprouted', note: 'ランナーを整理。' },
]

export const initialState: AppState = {
  fields: [north.field, house.field],
  ridges: [...north.ridges, ...house.ridges],
  rows: [...north.rows, ...house.rows],
  plants: [...north.plants, ...house.plants],
  records: seedRecords,
}
