import type { AppAction, AppState, Plant } from '@/lib/types'
import { generateId } from '@/lib/farm-utils'

type Dimensions = { ridgeCount: number; rowCountPerRidge: number; plantCountPerRow: number }

export function plantsRemovedByConfig(plants: Plant[], config: Dimensions): Plant[] {
  return plants.filter((plant) => plant.status !== 'empty' && (
    plant.ridgeNumber > config.ridgeCount ||
    plant.rowNumber > config.rowCountPerRidge ||
    plant.plantNumber > config.plantCountPerRow
  ))
}

function createPlants(projectId: string, fieldId: string, config: Dimensions, previous: Plant[]): Plant[] {
  const retained = new Map(
    previous.filter((plant) => plant.status !== 'empty').map((plant) => [
      `${plant.ridgeNumber}:${plant.rowNumber}:${plant.plantNumber}`,
      plant,
    ]),
  )
  const plants: Plant[] = []
  for (let ridgeNumber = 1; ridgeNumber <= config.ridgeCount; ridgeNumber += 1) {
    for (let rowNumber = 1; rowNumber <= config.rowCountPerRidge; rowNumber += 1) {
      for (let plantNumber = 1; plantNumber <= config.plantCountPerRow; plantNumber += 1) {
        const key = `${ridgeNumber}:${rowNumber}:${plantNumber}`
        plants.push(retained.get(key) ?? {
          id: generateId(),
          projectId,
          fieldId,
          ridgeNumber,
          rowNumber,
          plantNumber,
          cropName: null,
          plantedAt: null,
          status: 'empty',
        })
      }
    }
  }
  return plants
}

export function farmReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'field/add':
      return { ...state, fieldMasters: [...state.fieldMasters, action.payload] }
    case 'field/delete': {
      const id = action.payload.id
      if (state.projects.some((project) => project.endDate === null && project.fieldIds.includes(id))) return state
      const removedIds = new Set(state.plants.filter((plant) => plant.fieldId === id).map((plant) => plant.id))
      return {
        ...state,
        fieldMasters: state.fieldMasters.filter((field) => field.id !== id),
        projects: state.projects.map((project) => ({ ...project, fieldIds: project.fieldIds.filter((fieldId) => fieldId !== id) })),
        projectFieldConfigs: state.projectFieldConfigs.filter((config) => config.fieldId !== id),
        plants: state.plants.filter((plant) => plant.fieldId !== id),
        records: state.records.filter((record) => !removedIds.has(record.plantId)),
      }
    }
    case 'project/add':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'project/delete': {
      const id = action.payload.id
      const removedIds = new Set(state.plants.filter((plant) => plant.projectId === id).map((plant) => plant.id))
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== id),
        projectFieldConfigs: state.projectFieldConfigs.filter((config) => config.projectId !== id),
        plants: state.plants.filter((plant) => plant.projectId !== id),
        records: state.records.filter((record) => record.projectId !== id && !removedIds.has(record.plantId)),
      }
    }
    case 'project/end':
      return {
        ...state,
        projects: state.projects.map((project) => project.id === action.payload.id ? { ...project, endDate: action.payload.endDate } : project),
      }
    case 'config/apply': {
      const { projectId, fieldId, config } = action.payload
      const previous = state.plants.filter((plant) => plant.projectId === projectId && plant.fieldId === fieldId)
      const retainedPositionKeys = new Set<string>()
      for (let ridge = 1; ridge <= config.ridgeCount; ridge += 1) {
        for (let row = 1; row <= config.rowCountPerRidge; row += 1) {
          for (let number = 1; number <= config.plantCountPerRow; number += 1) {
            retainedPositionKeys.add(`${ridge}:${row}:${number}`)
          }
        }
      }
      const removedIds = new Set(
        previous
          .filter((plant) => !retainedPositionKeys.has(`${plant.ridgeNumber}:${plant.rowNumber}:${plant.plantNumber}`))
          .map((plant) => plant.id),
      )
      const saved = state.projectFieldConfigs.find((item) => item.projectId === projectId && item.fieldId === fieldId)
      return {
        ...state,
        projectFieldConfigs: [
          ...state.projectFieldConfigs.filter((item) => item.projectId !== projectId || item.fieldId !== fieldId),
          { id: saved?.id ?? generateId(), projectId, fieldId, ...config },
        ],
        plants: [
          ...state.plants.filter((plant) => plant.projectId !== projectId || plant.fieldId !== fieldId),
          ...createPlants(projectId, fieldId, config, previous),
        ],
        records: state.records.filter((record) => !removedIds.has(record.plantId)),
      }
    }
    case 'plant/update':
      return { ...state, plants: state.plants.map((plant) => plant.id === action.payload.id ? { ...plant, ...action.payload.changes } : plant) }
    case 'plant/bulk-update': {
      const ids = new Set(action.payload.ids)
      return { ...state, plants: state.plants.map((plant) => ids.has(plant.id) ? { ...plant, ...action.payload.changes } : plant) }
    }
    case 'record/add':
      return {
        ...state,
        records: [...state.records, action.payload],
        plants: state.plants.map((plant) => plant.id === action.payload.plantId
          ? {
              ...plant,
              status: action.payload.status,
              cropName: plant.cropName ?? state.projects.find((project) => project.id === action.payload.projectId)?.cropName ?? null,
            }
          : plant),
      }
    case 'record/delete':
      return { ...state, records: state.records.filter((record) => record.id !== action.payload.id) }
    default:
      return state
  }
}
