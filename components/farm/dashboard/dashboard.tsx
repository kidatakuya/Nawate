'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useFields } from '@/hooks/use-farm'
import { hrefs } from '@/lib/farm-utils'
import { cn } from '@/lib/utils'
import { FieldMatrix } from '../hierarchy/field-matrix'
import { PageHeader, SectionHeading } from '../shared'
import { StatusLegend } from '../status-badge'
import { FieldUsageChart } from './field-usage-chart'
import { SummaryCards } from './summary-cards'

export function Dashboard() {
  const { fields } = useFields()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = fields.find((f) => f.id === selectedId) ?? fields[0]

  return (
    <>
      <PageHeader title="ダッシュボード" description="畑・畝・列・個体の状況を俯瞰できます。" />

      <section aria-label="サマリー" className="mb-10">
        <SummaryCards />
      </section>

      <section className="mb-10">
        <SectionHeading title="畑ごとの使用状況" description="空き / 使用中 / 収穫済 / 枯死 の比率" />
        <FieldUsageChart />
      </section>

      {selected && (
        <section>
          <SectionHeading
            title="畝×列ヒートマップ"
            description="畝名で畝へ、セルで列の個体一覧へドリルダウンできます。"
            action={
              <Link
                href={hrefs.field(selected.id)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline print:hidden"
              >
                {selected.name}の詳細
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div role="group" aria-label="表示する畑" className="mb-3 flex flex-wrap gap-2 print:hidden">
            {fields.map((field) => (
              <button
                key={field.id}
                type="button"
                aria-pressed={field.id === selected.id}
                onClick={() => setSelectedId(field.id)}
                className={cn(
                  'min-h-9 rounded-full border px-4 text-sm font-medium transition-colors',
                  field.id === selected.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-accent',
                )}
              >
                {field.name}
              </button>
            ))}
          </div>
          <StatusLegend className="mb-3" />
          <FieldMatrix field={selected} />
        </section>
      )}
    </>
  )
}
