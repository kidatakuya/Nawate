import type { GrowthRecord, Plant, PlantUpdate, Project, ProjectFieldConfig, ProjectFieldConfigInput, SoilWork } from '@/types/models'
import type { FieldType, CropStatus } from '@/types/enums'

export { FieldType } from '@/types/enums'
export type { CropStatus } from '@/types/enums'
export type {
  GrowthRecord,
  GrowthRecordInput,
  FertilizerItem,
  FertilizerPlan,
  Plant,
  PlantUpdate,
  Project,
  ProjectFieldConfig,
  ProjectFieldConfigInput,
  ProjectInput,
  SoilWork,
} from '@/types/models'

export type AppState = {
  projects: Project[]
  projectFieldConfigs: ProjectFieldConfig[]
  plants: Plant[]
  records: GrowthRecord[]
}

export type AppAction =
  | { type: 'project/add'; payload: Project }
  | { type: 'project/delete'; payload: { id: string } }
  | { type: 'project/update'; payload: { id: string; changes: Partial<Project> } }
  | { type: 'project/end'; payload: { id: string; endDate: string } }
  | { type: 'project/soil-work-update'; payload: { id: string; soilWork: SoilWork } }
  | { type: 'config/apply'; payload: { projectId: string; fieldId: FieldType; config: ProjectFieldConfigInput } }
  | { type: 'plant/update'; payload: { id: string; changes: PlantUpdate } }
  | { type: 'plant/bulk-update'; payload: { ids: string[]; changes: PlantUpdate } }
  | { type: 'record/add'; payload: GrowthRecord }
  | { type: 'record/delete'; payload: { id: string } }
