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

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await getClient().from('projects').select('*').order('startDate', { ascending: false })
  if (error) throw error
  return (data ?? []).map((project) => projectSchema.parse(project))
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const validated = createProjectSchema.parse(input)
  const { data, error } = await getClient()
    .from('projects')
    .insert({ ...validated, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return projectSchema.parse(data)
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const { data: project, error } = await getClient()
    .from('projects')
    .update(data)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return projectSchema.parse(project)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await getClient().from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPlantsByProject(projectId: string): Promise<Plant[]> {
  const { data, error } = await getClient().from('plants').select('*').eq('projectId', projectId)
  if (error) throw error
  return (data ?? []).map((plant) => plantSchema.parse(plant))
}

export async function updatePlant(id: string, data: Partial<Plant>): Promise<Plant> {
  const validated = updatePlantSchema.parse(data)
  const { data: plant, error } = await getClient()
    .from('plants')
    .update(validated)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return plantSchema.parse(plant)
}

export async function bulkInsertPlants(plants: Plant[]): Promise<void> {
  if (!plants.length) return
  const validated = plants.map((plant) => plantSchema.parse(plant))
  const { error } = await getClient().from('plants').insert(validated)
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
    .eq('projectId', projectId)
    .order('recordedAt', { ascending: false })
  if (error) throw error
  return (data ?? []).map((record) => growthRecordSchema.parse(record))
}

export async function createRecord(input: CreateRecordInput): Promise<GrowthRecord> {
  const validated = createRecordSchema.parse(input)
  const { data, error } = await getClient()
    .from('growth_records')
    .insert({ ...validated, id: crypto.randomUUID() })
    .select('*')
    .single()
  if (error) throw error
  return growthRecordSchema.parse(data)
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await getClient().from('growth_records').delete().eq('id', id)
  if (error) throw error
}
