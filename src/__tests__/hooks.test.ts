import { generatePlantsForConfig, plantsRemovedByConfig, updatePlantsFromRecord } from '@/lib/farm-reducer'
import type { Plant } from '@/types/models'
import { FieldType } from '@/types/enums'

const existingPlants: Plant[] = [
  {
    id: 'retained-plant',
    projectId: 'project-1',
    fieldId: FieldType.YAMADA2,
    ridgeNumber: 1,
    rowNumber: 1,
    plantNumber: 1,
    cropName: 'トマト',
    plantedAt: '2026-03-15',
    status: 'growing',
  },
  {
    id: 'empty-plant',
    projectId: 'project-1',
    fieldId: FieldType.YAMADA2,
    ridgeNumber: 1,
    rowNumber: 1,
    plantNumber: 2,
    cropName: null,
    plantedAt: null,
    status: 'empty',
  },
  {
    id: 'removed-plant',
    projectId: 'project-1',
    fieldId: FieldType.YAMADA2,
    ridgeNumber: 2,
    rowNumber: 1,
    plantNumber: 1,
    cropName: 'トマト',
    plantedAt: '2026-03-15',
    status: 'flowering',
  },
]

describe('plant configuration operations', () => {
  it('preserves registered plants by position and creates empty slots', () => {
    const regenerated = generatePlantsForConfig('project-1', FieldType.YAMADA2, {
      ridgeCount: 1,
      rowCountPerRidge: 1,
      plantCountPerRow: 3,
    }, existingPlants)

    expect(regenerated).toHaveLength(3)
    expect(regenerated[0]).toEqual(existingPlants[0])
    expect(regenerated[1]).toEqual(existingPlants[1])
    expect(regenerated[2]).toMatchObject({ status: 'empty', ridgeNumber: 1, rowNumber: 1, plantNumber: 3 })
  })

  it('reports only non-empty plants excluded by a reduced configuration', () => {
    expect(plantsRemovedByConfig(existingPlants, {
      ridgeCount: 1,
      rowCountPerRidge: 1,
      plantCountPerRow: 1,
    })).toEqual([existingPlants[2]])
  })

  it('updates the matching plant from a record and fills its default crop name', () => {
    const updated = updatePlantsFromRecord(existingPlants, 'empty-plant', 'sprouted', 'レタス')
    expect(updated[1]).toMatchObject({ status: 'sprouted', cropName: 'レタス' })
    expect(updated[0]).toEqual(existingPlants[0])
  })
})
