'use client'

import Link from 'next/link'
import { useDashboard } from '@/hooks/use-farm'
import { countUsage, hrefs, numberFormatter, USAGE_CATEGORIES } from '@/lib/farm-utils'
import { EmptyState } from '../shared'
import { UsageBar, UsageLegend } from '../status-badge'

export function FieldUsageChart() {
  const { fieldSummaries } = useDashboard()

  if (fieldSummaries.length === 0) {
    return <EmptyState title="畑がありません" description="畑管理から畑を登録すると使用状況が表示されます。" />
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-4 sm:p-5">
      <UsageLegend />
      <ul className="flex flex-col gap-5">
        {fieldSummaries.map(({ field, totalSlots, statusCounts }) => {
          const usage = countUsage(statusCounts)
          return (
            <li key={field.id} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={hrefs.field(field.id)}
                  className="font-bold text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {field.name}
                </Link>
                <span className="text-xs tabular-nums text-muted-foreground">{numberFormatter.format(totalSlots)} スロット</span>
              </div>
              <UsageBar counts={statusCounts} className="h-4" />
              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {USAGE_CATEGORIES.map(({ key, label }) => (
                  <div key={key} className="flex gap-1">
                    <dt>{label}</dt>
                    <dd className="tabular-nums font-medium text-foreground">
                      {usage[key]}
                      <span className="ml-0.5 font-normal text-muted-foreground">
                        ({totalSlots > 0 ? Math.round((usage[key] / totalSlots) * 100) : 0}%)
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
