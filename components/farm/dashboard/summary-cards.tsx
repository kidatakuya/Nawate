'use client'

import { ClipboardList, Grid3x3, MapIcon, Sprout } from 'lucide-react'
import { useDashboard } from '@/hooks/use-farm'
import { numberFormatter } from '@/lib/farm-utils'

export function SummaryCards() {
  const { fieldCount, totalPlants, activePlants, recordCount, totals } = useDashboard()

  const items = [
    { label: '畑数', value: fieldCount, unit: '面', icon: MapIcon, note: null },
    { label: '総個体数', value: totalPlants, unit: '個', icon: Grid3x3, note: `空き ${numberFormatter.format(totals.empty)}` },
    {
      label: '使用中個体数',
      value: activePlants,
      unit: '個',
      icon: Sprout,
      note: `収穫済 ${totals.harvested}・枯死 ${totals.withered} は除く`,
    },
    { label: '生育記録数', value: recordCount, unit: '件', icon: ClipboardList, note: null },
  ]

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, value, unit, icon: Icon, note }) => (
        <li key={label} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
          <span className="flex items-center justify-between text-sm text-muted-foreground">
            {label}
            <Icon className="size-4 text-primary" aria-hidden="true" />
          </span>
          <span className="tabular-nums">
            <span className="text-3xl font-bold">{numberFormatter.format(value)}</span>
            <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
          </span>
          {note && <span className="text-xs text-muted-foreground">{note}</span>}
        </li>
      ))}
    </ul>
  )
}
