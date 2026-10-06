'use client'

import { usePlants } from '@/hooks/use-farm'
import { formatDate, plantDisplayName } from '@/lib/farm-utils'
import type { Field, Ridge, Row } from '@/lib/types'
import { cn } from '@/lib/utils'
import { STATUS_CARD_CLASS, StatusBadge } from '../status-badge'

export function PlantList({
  field,
  ridge,
  row,
  onSelect,
}: {
  field: Field
  ridge: Ridge
  row: Row
  onSelect: (plantId: string) => void
}) {
  const { getPlantsByRow } = usePlants()
  const plants = getPlantsByRow(row.id)

  return (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {plants.map((plant) => {
        const displayName = plantDisplayName(field.name, ridge.ridgeNumber, row.rowNumber, plant.plantNumber)
        const isEmpty = plant.status === 'empty'
        return (
          <li key={plant.id}>
            <button
              type="button"
              onClick={() => onSelect(plant.id)}
              aria-haspopup="dialog"
              className={cn(
                'flex w-full flex-col gap-2 rounded-xl border-2 p-3 text-left transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                STATUS_CARD_CLASS[plant.status],
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{displayName}</span>
                <StatusBadge status={plant.status} />
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-xl font-bold tabular-nums text-foreground">{plant.plantNumber}番</span>
                <span className={cn('truncate font-medium', isEmpty ? 'text-muted-foreground' : 'text-foreground')}>
                  {plant.cropName ?? '空きスロット'}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                植えた日 <span className="tabular-nums">{formatDate(plant.plantedAt)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
