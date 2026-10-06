'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useFarm } from '@/hooks/use-farm'
import { plantDisplayName } from '@/lib/farm-utils'

export function ProjectHierarchyNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { projects, fieldMasters, projectFieldConfigs, plants } = useFarm()
  const projectId = pathname.startsWith('/projects/') ? pathname.split('/')[2] : ''
  const project = projects.find((item) => item.id === projectId)
  const requestedFieldId = searchParams.get('field') ?? project?.fieldIds[0] ?? ''
  const fieldId = project?.fieldIds.includes(requestedFieldId) ? requestedFieldId : ''
  const field = fieldMasters.find((item) => item.id === fieldId)
  const config = projectFieldConfigs.find((item) => item.projectId === project?.id && item.fieldId === field?.id)
  const requestedRidge = Number(searchParams.get('ridge')) || null
  const ridge = config && requestedRidge && requestedRidge <= config.ridgeCount ? requestedRidge : null
  const requestedRow = Number(searchParams.get('row')) || null
  const row = config && requestedRow && requestedRow <= config.rowCountPerRidge ? requestedRow : null
  const selectedPlant = plants.find((plant) =>
    plant.id === searchParams.get('plant') &&
    plant.projectId === project?.id &&
    plant.fieldId === field?.id &&
    plant.ridgeNumber === ridge &&
    plant.rowNumber === row,
  )
  const detailHref = project ? `/projects/${project.id}` : '/projects'
  const fieldHref = project && field ? `${detailHref}?field=${field.id}` : '/fields'
  const ridgeHref = project && field && ridge ? `${fieldHref}&ridge=${ridge}` : detailHref
  const rowHref = project && field && ridge && row ? `${ridgeHref}&row=${row}` : ridgeHref
  const plantHref = selectedPlant ? `${rowHref}&plant=${selectedPlant.id}` : rowHref
  const fieldName = field?.name ?? '畑'
  const plantName = selectedPlant && field
    ? plantDisplayName(field.name, selectedPlant.ridgeNumber, selectedPlant.rowNumber, selectedPlant.plantNumber)
    : '個体'

  return (
    <nav aria-label="栽培階層" className="border-t print:hidden">
      <ol className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 text-xs text-muted-foreground sm:px-6">
        <li><Link href="/projects" className="whitespace-nowrap hover:text-primary">プロジェクト</Link></li>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <li>{project ? <Link href={detailHref} className="max-w-44 truncate hover:text-primary">{project.name}</Link> : <span>プロジェクトを選択</span>}</li>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <li>{field ? <Link href={fieldHref} className="whitespace-nowrap hover:text-primary">{fieldName}</Link> : <Link href="/fields" className="whitespace-nowrap hover:text-primary">畑</Link>}</li>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <li>{ridge && config ? <Link href={ridgeHref} className="whitespace-nowrap hover:text-primary">畝{ridge}</Link> : <span>畝</span>}</li>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <li>{row && config ? <Link href={rowHref} className="whitespace-nowrap hover:text-primary">列{row}</Link> : <span>列</span>}</li>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <li>{selectedPlant ? <Link href={plantHref} className="max-w-56 truncate hover:text-primary">{plantName}</Link> : <span>個体</span>}</li>
      </ol>
    </nav>
  )
}
