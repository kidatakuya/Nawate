'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useFarmIndex, useRidges } from '@/hooks/use-farm'
import { countStatuses, hrefs, totalOf, usedOf } from '@/lib/farm-utils'
import type { Field } from '@/lib/types'
import { UsageBar } from '../status-badge'

export function RidgeGrid({ field }: { field: Field }) {
  const ridges = useRidges(field.id)
  const index = useFarmIndex()

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ridges.map((ridge) => {
        const counts = countStatuses(index.plantsByRidge.get(ridge.id) ?? [])
        const used = usedOf(counts)
        const total = totalOf(counts)
        return (
          <li key={ridge.id}>
            <Link
              href={hrefs.ridge(field.id, ridge.id)}
              className="group flex min-h-32 flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex items-center justify-between">
                <span className="text-lg font-bold">畝{ridge.ridgeNumber}</span>
                <ChevronRight
                  className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </span>
              <span className="tabular-nums">
                <span className="text-2xl font-bold">{used}</span>
                <span className="text-sm text-muted-foreground"> / {total} 使用</span>
              </span>
              <UsageBar counts={counts} />
              <span className="text-xs text-muted-foreground">
                {field.rowCountPerRidge}列 × {field.plantCountPerRow}個
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
