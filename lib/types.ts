export type CropStatus = 'empty' | 'sprouted' | 'growing' | 'flowering' | 'harvested' | 'withered'

export type Field = {
  id: string
  name: string
  ridgeCount: number
  rowCountPerRidge: number
  plantCountPerRow: number
}

export type Ridge = {
  id: string
  fieldId: string
  ridgeNumber: number
}

export type Row = {
  id: string
  ridgeId: string
  fieldId: string
  rowNumber: number
}

export type Plant = {
  id: string
  fieldId: string
  ridgeId: string
  rowId: string
  plantNumber: number
  cropName: string | null
  plantedAt: string | null
  status: CropStatus
}

export type GrowthRecord = {
  id: string
  plantId: string
  recordedAt: string
  status: CropStatus
  note: string
}

export type AppState = {
  fields: Field[]
  ridges: Ridge[]
  rows: Row[]
  plants: Plant[]
  records: GrowthRecord[]
}

export type FieldInput = Omit<Field, 'id'>

export type PlantUpdate = Partial<Pick<Plant, 'cropName' | 'plantedAt' | 'status'>>

export type GrowthRecordInput = Omit<GrowthRecord, 'id'>

export type FieldStructure = {
  field: Field
  ridges: Ridge[]
  rows: Row[]
  plants: Plant[]
}

export type AppAction =
  | { type: 'field/add'; payload: FieldStructure }
  | { type: 'field/delete'; payload: { id: string } }
  | { type: 'plant/update'; payload: { id: string; changes: PlantUpdate } }
  | { type: 'record/add'; payload: GrowthRecord }
  | { type: 'record/delete'; payload: { id: string } }
