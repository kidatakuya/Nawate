export type CropStatus = 'empty' | 'sprouted' | 'growing' | 'flowering' | 'harvested' | 'withered'

export type FieldMaster = {
  id: string
  name: string
}

export type Project = {
  id: string
  name: string
  year: number
  cropName: string
  fieldIds: string[]
  startDate: string
  endDate: string | null
  createdAt: string
}

export type ProjectFieldConfig = {
  id: string
  projectId: string
  fieldId: string
  ridgeCount: number
  rowCountPerRidge: number
  plantCountPerRow: number
}

export type Plant = {
  id: string
  projectId: string
  fieldId: string
  ridgeNumber: number
  rowNumber: number
  plantNumber: number
  cropName: string | null
  plantedAt: string | null
  status: CropStatus
}

export type GrowthRecord = {
  id: string
  projectId: string
  plantId: string
  recordedAt: string
  status: CropStatus
  note: string
}

export type AppState = {
  fieldMasters: FieldMaster[]
  projects: Project[]
  projectFieldConfigs: ProjectFieldConfig[]
  plants: Plant[]
  records: GrowthRecord[]
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt'>
export type ProjectFieldConfigInput = Omit<ProjectFieldConfig, 'id' | 'projectId' | 'fieldId'>
export type PlantUpdate = Partial<Pick<Plant, 'cropName' | 'plantedAt' | 'status'>>
export type GrowthRecordInput = Omit<GrowthRecord, 'id'>

export type AppAction =
  | { type: 'field/add'; payload: FieldMaster }
  | { type: 'field/delete'; payload: { id: string } }
  | { type: 'project/add'; payload: Project }
  | { type: 'project/delete'; payload: { id: string } }
  | { type: 'project/end'; payload: { id: string; endDate: string } }
  | { type: 'config/apply'; payload: { projectId: string; fieldId: string; config: ProjectFieldConfigInput } }
  | { type: 'plant/update'; payload: { id: string; changes: PlantUpdate } }
  | { type: 'plant/bulk-update'; payload: { ids: string[]; changes: PlantUpdate } }
  | { type: 'record/add'; payload: GrowthRecord }
  | { type: 'record/delete'; payload: { id: string } }
