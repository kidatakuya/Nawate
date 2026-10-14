'use client'

import { useCallback } from 'react'
import { useAppState } from '@/hooks/use-app-state'
import { createProjectSchema } from '@/schemas/project'
import { projectSchema } from '@/schemas/project'
import type { CreateProjectInput } from '@/schemas/project'
import type { OperationResult } from '@/hooks/operation-result'
import type { Project, ProjectInput } from '@/types/models'
import { generateId } from '@/lib/farm-utils'

export function validateCreateProject(input: CreateProjectInput) {
  return createProjectSchema.safeParse(input)
}

export function useProjects() {
  const { projects, addProject, deleteProject, updateProject } = useAppState()

  const create = useCallback((input: CreateProjectInput): OperationResult<Project> => {
    const result = validateCreateProject(input)
    if (!result.success) return { success: false, errors: result.error }
    const projectInput: ProjectInput = result.data
    const project = { ...projectInput, id: generateId(), createdAt: new Date().toISOString() }
    const validatedProject = projectSchema.parse(project)
    addProject(validatedProject)
    return { success: true, data: validatedProject }
  }, [addProject])

  const update = useCallback((id: string, changes: Partial<Project>): OperationResult<Project> | null => {
    const current = projects.find((project) => project.id === id)
    if (!current) return null
    const result = projectSchema.safeParse({ ...current, ...changes })
    if (!result.success) return { success: false, errors: result.error }
    updateProject(id, changes)
    return { success: true, data: result.data }
  }, [projects, updateProject])

  return { projects, create, update, remove: deleteProject }
}
