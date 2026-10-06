import Link from 'next/link'
import { CalendarDays, MapPin, Sprout } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/farm-utils'
import type { Project } from '@/lib/types'

export function ProjectCard({
  project,
  fieldCount,
  totalPlants,
  usedPlants,
  href,
}: {
  project: Project
  fieldCount: number
  totalPlants?: number
  usedPlants?: number
  href?: string
}) {
  const active = project.endDate === null
  return (
    <Link href={href ?? `/projects/${project.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{project.year}年度 ・ {project.cropName}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {active ? '進行中' : '終了'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="size-4" />畑 {fieldCount}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" />{formatDate(project.startDate)} – {project.endDate ? formatDate(project.endDate) : '進行中'}</span>
            {totalPlants !== undefined && <span className="inline-flex items-center gap-1"><Sprout className="size-4" />個体 {usedPlants ?? 0} / {totalPlants}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
