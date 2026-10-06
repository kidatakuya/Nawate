import type { AppAction, AppState } from '@/lib/types'

export function farmReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'field/add': {
      const { field, ridges, rows, plants } = action.payload
      return {
        ...state,
        fields: [...state.fields, field],
        ridges: [...state.ridges, ...ridges],
        rows: [...state.rows, ...rows],
        plants: [...state.plants, ...plants],
      }
    }
    case 'field/delete': {
      const { id } = action.payload
      const removedPlantIds = new Set(
        state.plants.filter((plant) => plant.fieldId === id).map((plant) => plant.id),
      )
      return {
        fields: state.fields.filter((field) => field.id !== id),
        ridges: state.ridges.filter((ridge) => ridge.fieldId !== id),
        rows: state.rows.filter((row) => row.fieldId !== id),
        plants: state.plants.filter((plant) => plant.fieldId !== id),
        records: state.records.filter((record) => !removedPlantIds.has(record.plantId)),
      }
    }
    case 'plant/update': {
      const { id, changes } = action.payload
      return {
        ...state,
        plants: state.plants.map((plant) => (plant.id === id ? { ...plant, ...changes } : plant)),
      }
    }
    case 'record/add': {
      const record = action.payload
      if (!state.plants.some((plant) => plant.id === record.plantId)) return state
      return {
        ...state,
        records: [...state.records, record],
        plants: state.plants.map((plant) =>
          plant.id === record.plantId ? { ...plant, status: record.status } : plant,
        ),
      }
    }
    case 'record/delete':
      return {
        ...state,
        records: state.records.filter((record) => record.id !== action.payload.id),
      }
    default:
      return state
  }
}
