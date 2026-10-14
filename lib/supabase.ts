import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createRecordSchema, growthRecordSchema } from '@/schemas/record'
import { createProjectSchema, projectSchema } from '@/schemas/project'
import { plantSchema, updatePlantSchema } from '@/schemas/plant'
import type { CreateProjectInput } from '@/schemas/project'
import type { CreateRecordInput } from '@/schemas/record'
import type { GrowthRecord, Plant, Project } from '@/types/models'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

function getClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabaseの接続情報が設定されていません。')
  }
  return supabase
}

type ProjectRow = {
  id: string
  name: string
  year: number
  crop_name: string
  field_ids: string[]
  start_date: string
  end_date: string | null
  soil_work: Project['soilWork']
  created_at: string
}

type PlantRow = {
  id: string
  project_id: string
  field_id: string
  ridge_number: number
  row_number: number
  plant_number: number
  crop_name: string | null
  planted_at: string | null
  status: Plant['status']
}

type GrowthRecordRow = {
  id: string
  project_id: string
  plant_id: string
  recorded_at: string
  status: GrowthRecord['status']
  note: string
}

function projectFromRow(row: ProjectRow): Project {
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    year: row.year,
    cropName: row.crop_name,
    fieldIds: row.field_ids,
    startDate: row.start_date,
    endDate: row.end_date,
    soilWork: row.soil_work,
    createdAt: row.created_at,
  })
}

function projectToRow(project: Partial<Project>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (project.name !== undefined) row.name = project.name
  if (project.year !== undefined) row.year = project.year
  if (project.cropName !== undefined) row.crop_name = project.cropName
  if (project.fieldIds !== undefined) row.field_ids = project.fieldIds
  if (project.startDate !== undefined) row.start_date = project.startDate
  if (project.endDate !== undefined) row.end_date = project.endDate
  if (project.soilWork !== undefined) row.soil_work = project.soilWork
  return row
}

function plantFromRow(row: PlantRow): Plant {
  return plantSchema.parse({
    id: row.id,
    projectId: row.project_id,
    fieldId: row.field_id,
    ridgeNumber: row.ridge_number,
    rowNumber: row.row_number,
    plantNumber: row.plant_number,
    cropName: row.crop_name,
    plantedAt: row.planted_at,
    status: row.status,
  })
}

function plantToRow(plant: Partial<Plant>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (plant.projectId !== undefined) row.project_id = plant.projectId
  if (plant.fieldId !== undefined) row.field_id = plant.fieldId
  if (plant.ridgeNumber !== undefined) row.ridge_number = plant.ridgeNumber
  if (plant.rowNumber !== undefined) row.row_number = plant.rowNumber
  if (plant.plantNumber !== undefined) row.plant_number = plant.plantNumber
  if (plant.cropName !== undefined) row.crop_name = plant.cropName
  if (plant.plantedAt !== undefined) row.planted_at = plant.plantedAt
  if (plant.status !== undefined) row.status = plant.status
  return row
}

function recordFromRow(row: GrowthRecordRow): GrowthRecord {
  return growthRecordSchema.parse({
    id: row.id,
    projectId: row.project_id,
    plantId: row.plant_id,
    recordedAt: row.recorded_at,
    status: row.status,
    note: row.note,
  })
}

function recordToRow(record: CreateRecordInput): Record<string, unknown> {
  return {
    project_id: record.projectId,
    plant_id: record.plantId,
    recorded_at: record.recordedAt,
    status: record.status,
    note: record.note,
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await getClient().from('projects').select('*').order('start_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map((project) => projectFromRow(project as ProjectRow))
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const validated = createProjectSchema.parse(input)
  const { data, error } = await getClient()
    .from('projects')
    .insert({ ...projectToRow(validated), id: crypto.randomUUID(), created_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return projectFromRow(data as ProjectRow)
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const { data: project, error } = await getClient()
    .from('projects')
    .update(projectToRow(data))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return projectFromRow(project as ProjectRow)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await getClient().from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPlantsByProject(projectId: string): Promise<Plant[]> {
  const { data, error } = await getClient().from('plants').select('*').eq('project_id', projectId)
  if (error) throw error
  return (data ?? []).map((plant) => plantFromRow(plant as PlantRow))
}

export async function updatePlant(id: string, data: Partial<Plant>): Promise<Plant> {
  const validated = updatePlantSchema.parse(data)
  const { data: plant, error } = await getClient()
    .from('plants')
    .update(plantToRow(validated))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return plantFromRow(plant as PlantRow)
}

export async function bulkInsertPlants(plants: Plant[]): Promise<void> {
  if (!plants.length) return
  const validated = plants.map((plant) => plantSchema.parse(plant))
  const rows = validated.map((plant) => ({
    id: plant.id,
    ...plantToRow(plant),
  }))
  const { error } = await getClient().from('plants').insert(rows)
  if (error) throw error
}

export async function bulkDeletePlants(ids: string[]): Promise<void> {
  if (!ids.length) return
  const { error } = await getClient().from('plants').delete().in('id', ids)
  if (error) throw error
}

export async function fetchRecordsByProject(projectId: string): Promise<GrowthRecord[]> {
  const { data, error } = await getClient()
    .from('growth_records')
    .select('*')
    .eq('project_id', projectId)
    .order('recorded_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((record) => recordFromRow(record as GrowthRecordRow))
}

export async function createRecord(input: CreateRecordInput): Promise<GrowthRecord> {
  const validated = createRecordSchema.parse(input)
  const { data, error } = await getClient()
    .from('growth_records')
    .insert({ ...recordToRow(validated), id: crypto.randomUUID() })
    .select('*')
    .single()
  if (error) throw error
  return recordFromRow(data as GrowthRecordRow)
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await getClient().from('growth_records').delete().eq('id', id)
  if (error) throw error
}
