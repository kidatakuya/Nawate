'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useFarmIndex } from '@/hooks/use-farm'
import { calcTotalSlots, countStatuses, numberFormatter, usedOf } from '@/lib/farm-utils'
import { MissingState, PageHeader, SectionHeading } from '../shared'
import { StatusLegend, UsageBar, UsageLegend } from '../status-badge'
import { FieldMatrix } from './field-matrix'
import { PlantList } from './plant-list'
import { PlantModal } from './plant-modal'
import { RidgeGrid } from './ridge-grid'
import { RowGrid } from './row-grid'

function useHierarchy(fieldId: string, ridgeId?: string, rowId?: string) {
  const index = useFarmIndex()
  const field = index.fieldById.get(fieldId)
  const ridgeCandidate = ridgeId ? index.ridgeById.get(ridgeId) : undefined
  const ridge = field && ridgeCandidate?.fieldId === field.id ? ridgeCandidate : undefined
  const rowCandidate = rowId ? index.rowById.get(rowId) : undefined
  const row = ridge && rowCandidate?.ridgeId === ridge.id ? rowCandidate : undefined
  return { index, field, ridge, row }
}

export function FieldDetailView({ fieldId }: { fieldId: string }) {
  const { index, field } = useHierarchy(fieldId)
  if (!field) return <MissingState what="畑" />

  const counts = countStatuses(index.plantsByField.get(field.id) ?? [])
  const total = calcTotalSlots(field)

  return (
    <>
      <PageHeader
        eyebrow="畑の詳細"
        title={field.name}
        description={`畝${field.ridgeCount} × 列${field.rowCountPerRidge} × ${field.plantCountPerRow}個 = ${numberFormatter.format(total)}スロット（使用 ${numberFormatter.format(usedOf(counts))}）`}
      />
      <div className="mb-8 flex flex-col gap-2 rounded-xl border bg-card p-4">
        <UsageBar counts={counts} className="h-3" />
        <UsageLegend />
      </div>

      <section className="mb-10">
        <SectionHeading title="畝を選択" description="畝を選ぶと、その畝の列を表示します。" />
        <RidgeGrid field={field} />
      </section>

      <section>
        <SectionHeading title="畝×列マトリックス" description="各セルは1列分の個体です。セルを選ぶとその列へ移動します。" />
        <StatusLegend className="mb-3" />
        <FieldMatrix field={field} />
      </section>
    </>
  )
}

export function RidgeDetailView({ fieldId, ridgeId }: { fieldId: string; ridgeId: string }) {
  const { index, field, ridge } = useHierarchy(fieldId, ridgeId)
  if (!field || !ridge) return <MissingState what="畝" />

  const counts = countStatuses(index.plantsByRidge.get(ridge.id) ?? [])

  return (
    <>
      <PageHeader
        eyebrow="畝の詳細"
        title={`${field.name} / 畝${ridge.ridgeNumber}`}
        description={`列${field.rowCountPerRidge}本 × ${field.plantCountPerRow}個（使用 ${usedOf(counts)} / ${field.rowCountPerRidge * field.plantCountPerRow}）`}
      />
      <section>
        <SectionHeading title="列を選択" description="列を選ぶと、その列の個体一覧を表示します。" />
        <StatusLegend className="mb-3" />
        <RowGrid field={field} ridge={ridge} />
      </section>
    </>
  )
}

export function RowDetailView({ fieldId, ridgeId, rowId }: { fieldId: string; ridgeId: string; rowId: string }) {
  const { index, field, ridge, row } = useHierarchy(fieldId, ridgeId, rowId)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedPlantId = searchParams.get('plant')

  if (!field || !ridge || !row) return <MissingState what="列" />

  const counts = countStatuses(index.plantsByRow.get(row.id) ?? [])

  return (
    <>
      <PageHeader
        eyebrow="個体管理"
        title={`${field.name} / 畝${ridge.ridgeNumber} / 列${row.rowNumber}`}
        description={`使用 ${usedOf(counts)} / ${field.plantCountPerRow}個。個体を選ぶと詳細の編集や記録の追加ができます。`}
      />
      <StatusLegend className="mb-4" />
      <PlantList
        field={field}
        ridge={ridge}
        row={row}
        onSelect={(plantId) => router.replace(`${pathname}?plant=${plantId}`, { scroll: false })}
      />
      <PlantModal
        plantId={selectedPlantId && index.plantById.get(selectedPlantId)?.rowId === row.id ? selectedPlantId : null}
        onClose={() => router.replace(pathname, { scroll: false })}
      />
    </>
  )
}
