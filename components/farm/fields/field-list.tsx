'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useFarmIndex, useFields } from '@/hooks/use-farm'
import { calcTotalSlots, countStatuses, hrefs, numberFormatter, usedOf } from '@/lib/farm-utils'
import { DeleteButton, EmptyState } from '../shared'
import { UsageBar } from '../status-badge'

export function FieldList() {
  const { fields, deleteField } = useFields()
  const index = useFarmIndex()

  if (fields.length === 0) {
    return <EmptyState title="畑がまだ登録されていません" description="「畑を登録」から最初の畑を追加しましょう。" />
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => {
        const plants = index.plantsByField.get(field.id) ?? []
        const counts = countStatuses(plants)
        const total = calcTotalSlots(field)
        const used = usedOf(counts)
        const recordCount = plants.reduce((sum, p) => sum + (index.recordsByPlant.get(p.id)?.length ?? 0), 0)

        return (
          <li key={field.id} className="flex flex-col rounded-xl border bg-card shadow-xs">
            <div className="flex items-start justify-between gap-2 p-4 pb-3">
              <h2 className="text-lg font-bold text-pretty">{field.name}</h2>
              <DeleteButton
                label={`${field.name}を削除`}
                title={`「${field.name}」を削除しますか？`}
                description={`畝${field.ridgeCount}本・列${field.ridgeCount * field.rowCountPerRidge}本・個体${numberFormatter.format(total)}個と、生育記録${recordCount}件もすべて削除されます。この操作は取り消せません。`}
                onConfirm={() => deleteField(field.id)}
              />
            </div>

            <dl className="grid grid-cols-4 gap-2 px-4 text-center">
              {[
                { term: '畝数', value: field.ridgeCount },
                { term: '列数/畝', value: field.rowCountPerRidge },
                { term: '個数/列', value: field.plantCountPerRow },
                { term: '総スロット', value: total },
              ].map(({ term, value }) => (
                <div key={term} className="rounded-lg bg-muted px-1 py-2">
                  <dt className="text-[11px] text-muted-foreground">{term}</dt>
                  <dd className="text-base font-bold tabular-nums">{numberFormatter.format(value)}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-1.5 px-4 pt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">使用スロット</span>
                <span className="tabular-nums">
                  <span className="font-bold">{numberFormatter.format(used)}</span> / {numberFormatter.format(total)}
                </span>
              </div>
              <UsageBar counts={counts} />
            </div>

            <Link
              href={hrefs.field(field.id)}
              className="mt-4 flex items-center justify-between border-t px-4 py-3 text-sm font-medium text-primary hover:bg-accent print:hidden"
            >
              畝を見る
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
