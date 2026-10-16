import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { createRecordSchema, growthRecordSchema } from '@/schemas/record'
import { createProjectSchema, projectSchema } from '@/schemas/project'
import { plantSchema, updatePlantSchema } from '@/schemas/plant'
import { projectFieldConfigSchema } from '@/schemas/fieldConfig'
import { soilWorkSchema } from '@/schemas/soilWork'
import type { CreateProjectInput } from '@/schemas/project'
import type { CreateRecordInput } from '@/schemas/record'
import type { AppState } from '@/lib/types'
import { FieldType } from '@/types/enums'
import type { GrowthRecord, Plant, Project, ProjectFieldConfig } from '@/types/models'
import { z } from 'zod'

function getClient(): SupabaseClient {
  return createClient()
}

const projectRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  year: z.number(),
  crop_name: z.string(),
  field_ids: z.array(z.nativeEnum(FieldType)),
  start_date: z.string(),
  end_date: z.string().nullable(),
  soil_work: soilWorkSchema,
  created_at: z.string(),
})

const projectFieldConfigRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  field_id: z.nativeEnum(FieldType),
  ridge_count: z.number(),
  row_count_per_ridge: z.number(),
  plant_count_per_row: z.number(),
})

const plantRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  field_id: z.nativeEnum(FieldType),
  ridge_number: z.number(),
  row_number: z.number(),
  plant_number: z.number(),
  crop_name: z.string().nullable(),
  planted_at: z.string().nullable(),
  status: z.enum(['empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered']),
})

const growthRecordRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  plant_id: z.string().uuid(),
  recorded_at: z.string(),
  status: z.enum(['sprouted', 'growing', 'flowering', 'harvested', 'withered']),
  note: z.string(),
})

type ProjectRow = z.infer<typeof projectRowSchema>
type PlantRow = z.infer<typeof plantRowSchema>
type ProjectFieldConfigRow = z.infer<typeof projectFieldConfigRowSchema>
type GrowthRecordRow = z.infer<typeof growthRecordRowSchema>

type FarmTable = 'projects' | 'project_field_configs' | 'plants' | 'growth_records'

function throwOnError(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(`Supabaseへの${operation}に失敗しました: ${error.message}`)
}

async function fetchAllRows(client: SupabaseClient, table: FarmTable): Promise<unknown[]> {
  const rows: unknown[] = []
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from(table).select('*').order('id').range(offset, offset + pageSize - 1)
    throwOnError(error, `${table}の取得`)
    const page = data ?? []
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
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

function configFromRow(row: ProjectFieldConfigRow): ProjectFieldConfig {
  return {
    id: row.id,
    projectId: row.project_id,
    fieldId: z.nativeEnum(FieldType).parse(row.field_id),
    ...projectFieldConfigSchema.parse({
      ridgeCount: row.ridge_count,
      rowCountPerRidge: row.row_count_per_ridge,
      plantCountPerRow: row.plant_count_per_row,
    }),
  }
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

function configToRow(config: ProjectFieldConfig): Record<string, unknown> {
  return {
    id: config.id,
    project_id: config.projectId,
    field_id: config.fieldId,
    ridge_count: config.ridgeCount,
    row_count_per_ridge: config.rowCountPerRidge,
    plant_count_per_row: config.plantCountPerRow,
  }
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

function recordToRow(record: CreateRecordInput | GrowthRecord): Record<string, unknown> {
  const validated = createRecordSchema.parse(record)
  return {
    project_id: validated.projectId,
    plant_id: validated.plantId,
    recorded_at: validated.recordedAt,
    status: validated.status,
    note: validated.note,
  }
}

export async function loadFarmState(): Promise<AppState> {
  const client = getClient()
  const [projectRows, configRows, plantRows, recordRows] = await Promise.all([
    fetchAllRows(client, 'projects'),
    fetchAllRows(client, 'project_field_configs'),
    fetchAllRows(client, 'plants'),
    fetchAllRows(client, 'growth_records'),
  ])

  return {
    projects: projectRows.map((row) => projectFromRow(projectRowSchema.parse(row))),
    projectFieldConfigs: configRows.map((row) => configFromRow(projectFieldConfigRowSchema.parse(row))),
    plants: plantRows.map((row) => plantFromRow(plantRowSchema.parse(row))),
    records: recordRows.map((row) => recordFromRow(growthRecordRowSchema.parse(row))),
  }
}

function getChanges<T extends { id: string }>(previous: T[], next: T[]) {
  const previousById = new Map(previous.map((item) => [item.id, item]))
  const nextIds = new Set(next.map((item) => item.id))
  return {
    removedIds: previous.filter((item) => !nextIds.has(item.id)).map((item) => item.id),
    changed: next.filter((item) => {
      const oldItem = previousById.get(item.id)
      return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)
    }),
  }
}

async function deleteRows(client: SupabaseClient, table: FarmTable, ids: string[]): Promise<void> {
  if (!ids.length) return
  const { error } = await client.from(table).delete().in('id', ids)
  throwOnError(error, `${table}の削除`)
}

async function upsertRows(
  client: SupabaseClient,
  table: FarmTable,
  rows: Record<string, unknown>[],
  onConflict = 'id',
): Promise<void> {
  if (!rows.length) return
  const { error } = await client.from(table).upsert(rows, { onConflict })
  throwOnError(error, `${table}の保存`)
}

export async function saveFarmState(previous: AppState, next: AppState): Promise<void> {
  const client = getClient()
  const projectChanges = getChanges(previous.projects, next.projects)
  const configChanges = getChanges(previous.projectFieldConfigs, next.projectFieldConfigs)
  const plantChanges = getChanges(previous.plants, next.plants)
  const recordChanges = getChanges(previous.records, next.records)

  await deleteRows(client, 'growth_records', recordChanges.removedIds)
  await deleteRows(client, 'plants', plantChanges.removedIds)
  await deleteRows(client, 'project_field_configs', configChanges.removedIds)
  await deleteRows(client, 'projects', projectChanges.removedIds)

  await upsertRows(client, 'projects', projectChanges.changed.map((project) => ({
    id: project.id,
    ...projectToRow(project),
    created_at: project.createdAt,
  })))
  await upsertRows(client, 'project_field_configs', configChanges.changed.map(configToRow), 'project_id,field_id')
  await upsertRows(client, 'plants', plantChanges.changed.map((plant) => ({
    id: plant.id,
    ...plantToRow(plant),
  })))
  await upsertRows(client, 'growth_records', recordChanges.changed.map((record) => ({
    id: record.id,
    ...recordToRow(record),
  })))
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await getClient().from('projects').select('*').order('start_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map((project) => projectFromRow(projectRowSchema.parse(project)))
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const validated = createProjectSchema.parse(input)
  const { data, error } = await getClient()
    .from('projects')
    .insert({ ...projectToRow(validated), id: crypto.randomUUID(), created_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return projectFromRow(projectRowSchema.parse(data))
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const { data: project, error } = await getClient()
    .from('projects')
    .update(projectToRow(data))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return projectFromRow(projectRowSchema.parse(project))
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await getClient().from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPlantsByProject(projectId: string): Promise<Plant[]> {
  const { data, error } = await getClient().from('plants').select('*').eq('project_id', projectId)
  if (error) throw error
  return (data ?? []).map((plant) => plantFromRow(plantRowSchema.parse(plant)))
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
  return plantFromRow(plantRowSchema.parse(plant))
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
  return (data ?? []).map((record) => recordFromRow(growthRecordRowSchema.parse(record)))
}

export async function createRecord(input: CreateRecordInput): Promise<GrowthRecord> {
  const validated = createRecordSchema.parse(input)
  const { data, error } = await getClient()
    .from('growth_records')
    .insert({ ...recordToRow(validated), id: crypto.randomUUID() })
    .select('*')
    .single()
  if (error) throw error
  return recordFromRow(growthRecordRowSchema.parse(data))
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await getClient().from('growth_records').delete().eq('id', id)
  if (error) throw error
}
