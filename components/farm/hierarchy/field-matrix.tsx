'use client'

import Link from 'next/link'
import { useFarmIndex } from '@/hooks/use-farm'
import { CROP_STATUS_LABELS, hrefs, isUsedStatus } from '@/lib/farm-utils'
import type { Field } from '@/lib/types'
import { cn } from '@/lib/utils'
import { STATUS_DOT_CLASS } from '../status-badge'

export function FieldMatrix({ field }: { field: Field }) {
  const index = useFarmIndex()
  const ridges = index.ridgesByField.get(field.id) ?? []
  const columns = Array.from({ length: field.rowCountPerRidge }, (_, i) => i + 1)
  const dotColumns = Math.min(field.plantCountPerRow, 10)

  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-3">
      <table className="border-separate border-spacing-1.5">
        <caption className="sr-only">{field.name}の畝×列マトリックス</caption>
        <thead>
          <tr>
            <th scope="col" className="w-14">
              <span className="sr-only">畝</span>
            </th>
            {columns.map((n) => (
              <th key={n} scope="col" className="px-1 text-left text-xs font-medium text-muted-foreground">
                列{n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ridges.map((ridge) => (
            <tr key={ridge.id}>
              <th scope="row" className="pr-1 text-left">
                <Link
                  href={hrefs.ridge(field.id, ridge.id)}
                  className="whitespace-nowrap rounded-md px-1.5 py-1 text-sm font-bold hover:bg-accent hover:text-accent-foreground"
                >
                  畝{ridge.ridgeNumber}
                </Link>
              </th>
              {(index.rowsByRidge.get(ridge.id) ?? []).map((row) => {
                const plants = index.plantsByRow.get(row.id) ?? []
                const used = plants.filter((p) => isUsedStatus(p.status)).length
                return (
                  <td key={row.id} className="align-top">
                    <Link
                      href={hrefs.row(field.id, ridge.id, row.id)}
                      aria-label={`畝${ridge.ridgeNumber} 列${row.rowNumber}: ${used} / ${plants.length} 使用`}
                      className="flex flex-col gap-1.5 rounded-lg border bg-background p-2 transition hover:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span
                        className="grid gap-0.5"
                        style={{ gridTemplateColumns: `repeat(${dotColumns}, 0.625rem)` }}
                        aria-hidden="true"
                      >
                        {plants.map((plant) => (
                          <span
                            key={plant.id}
                            title={`${plant.plantNumber}番: ${plant.cropName ?? ''} ${CROP_STATUS_LABELS[plant.status]}`}
                            className={cn('size-2.5 rounded-[2px]', STATUS_DOT_CLASS[plant.status])}
                          />
                        ))}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {used}/{plants.length}
                      </span>
                    </Link>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
