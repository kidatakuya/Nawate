'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useFarmIndex, useFields, useGrowthRecords } from '@/hooks/use-farm'
import { FormDialog, NativeSelect, PageHeader } from '../shared'
import { RecordForm } from './record-form'
import { RecordList } from './record-list'

export function RecordsPage() {
  const [open, setOpen] = useState(false)
  const [fieldFilter, setFieldFilter] = useState('all')
  const { fields } = useFields()
  const { sortedRecords } = useGrowthRecords()
  const index = useFarmIndex()

  const records =
    fieldFilter === 'all'
      ? sortedRecords
      : sortedRecords.filter((r) => index.plantById.get(r.plantId)?.fieldId === fieldFilter)

  return (
    <>
      <PageHeader
        title="生育記録"
        description={`個体ごとの記録を日付の新しい順に表示しています（${records.length}件）。`}
        action={
          <Button onClick={() => setOpen(true)} disabled={fields.length === 0}>
            <Plus aria-hidden="true" />
            記録を追加
          </Button>
        }
      />
      <div className="mb-4 flex items-center gap-2 print:hidden">
        <Label htmlFor="record-filter" className="shrink-0 text-sm">畑で絞り込み</Label>
        <NativeSelect id="record-filter" value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className="max-w-56">
          <option value="all">すべての畑</option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </NativeSelect>
      </div>
      <RecordList records={records} />
      <FormDialog open={open} onOpenChange={setOpen} title="生育記録を追加" className="sm:max-w-lg">
        <RecordForm onDone={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}
