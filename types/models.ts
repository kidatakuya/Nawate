import type { CropStatus, FieldType } from '@/types/enums'

export type FertilizerItem = {
  name: string
  date: string
  amount: string
  note: string
}

export type SoilWork = {
  baseFertilizers: FertilizerItem[]
  topDressings: FertilizerItem[]
  sowing: string
  sowingDate: string
  note: string
}

export type Project = {
  id: string
  name: string
  year: number
  cropName: string
  fieldIds: FieldType[]
  startDate: string
  endDate: string | null
  soilWork: SoilWork
  createdAt: string
}

export type ProjectFieldConfig = {
  id: string
  projectId: string
  fieldId: FieldType
  ridgeCount: number
  rowCountPerRidge: number
  plantCountPerRow: number
}

export type Plant = {
  id: string
  projectId: string
  fieldId: FieldType
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

export type ProjectInput = Omit<Project, 'id' | 'createdAt'>
export type ProjectFieldConfigInput = Omit<ProjectFieldConfig, 'id' | 'projectId' | 'fieldId'>
export type PlantUpdate = Partial<Pick<Plant, 'cropName' | 'plantedAt' | 'status'>>
export type GrowthRecordInput = Omit<GrowthRecord, 'id'>
