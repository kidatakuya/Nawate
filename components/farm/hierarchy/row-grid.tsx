'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useFarmIndex, useRows } from '@/hooks/use-farm'
import { CROP_STATUS_LABELS, hrefs, isUsedStatus } from '@/lib/farm-utils'
import type { Field, Ridge } from '@/lib/types'
import { cn } from '@/lib/utils'
import { STATUS_DOT_CLASS } from '../status-badge'

export function RowGrid({ field, ridge }: { field: Field; ridge: Ridge }) {
  const rows = useRows(ridge.id)
  const index = useFarmIndex()

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => {
        const plants = index.plantsByRow.get(row.id) ?? []
        const used = plants.filter((p) => isUsedStatus(p.status)).length
        const crops = [...new Set(plants.map((p) => p.cropName).filter((c): c is string => c !== null))]
        return (
          <li key={row.id}>
            <Link
              href={hrefs.row(field.id, ridge.id, row.id)}
              className="group flex min-h-32 flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex items-center justify-between">
                <span className="text-lg font-bold">列{row.rowNumber}</span>
                <span className="flex items-center gap-1 text-sm tabular-nums text-muted-foreground">
                  <span className="text-base font-bold text-foreground">{used}</span> / {field.plantCountPerRow}
                  <ChevronRight
                    className="size-4 transition group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </span>
              </span>
              <span className="flex flex-wrap gap-1" aria-hidden="true">
                {plants.map((plant) => (
                  <span
                    key={plant.id}
                    title={`${plant.plantNumber}番: ${CROP_STATUS_LABELS[plant.status]}`}
                    className={cn('size-3.5 rounded-sm', STATUS_DOT_CLASS[plant.status])}
                  />
                ))}
              </span>
              <span className="text-xs text-muted-foreground text-pretty">
                {crops.length > 0 ? crops.join('・') : '作物未登録'}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
