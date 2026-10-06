'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useFarmIndex, useFields, useGrowthRecords } from '@/hooks/use-farm'
import { CROP_STATUS_LABELS, isValidDateString, NEXT_STATUS, todayString } from '@/lib/farm-utils'
import { NativeSelect } from '../shared'
import { RecordFields, type RecordValues } from './record-fields'

export function RecordForm({ onDone }: { onDone: () => void }) {
  const { fields } = useFields()
  const index = useFarmIndex()
  const { addRecord } = useGrowthRecords()

  const [fieldId, setFieldId] = useState(fields[0]?.id ?? '')
  const [ridgeId, setRidgeId] = useState('')
  const [rowId, setRowId] = useState('')
  const [plantId, setPlantId] = useState('')
  const [values, setValues] = useState<RecordValues>(() => ({ recordedAt: todayString(), status: 'sprouted', note: '' }))
  const [error, setError] = useState<string | null>(null)

  const ridges = index.ridgesByField.get(fieldId) ?? []
  const ridge = ridges.find((r) => r.id === ridgeId) ?? ridges[0]
  const rows = ridge ? (index.rowsByRidge.get(ridge.id) ?? []) : []
  const row = rows.find((r) => r.id === rowId) ?? rows[0]
  const plants = row ? (index.plantsByRow.get(row.id) ?? []) : []
  const plant = plants.find((p) => p.id === plantId) ?? plants[0]

  function selectPlant(id: string) {
    setPlantId(id)
    const next = index.plantById.get(id)
    if (next) setValues((v) => ({ ...v, status: NEXT_STATUS[next.status] ?? next.status }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!plant) return setError('個体を選択してください。')
    if (!isValidDateString(values.recordedAt)) return setError('記録日を入力してください。')
    addRecord({ plantId: plant.id, recordedAt: values.recordedAt, status: values.status, note: values.note.trim() })
    onDone()
  }

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">先に畑を登録してください。</p>
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-2 text-sm font-medium">個体を選択</legend>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="record-field" className="text-xs">畑</Label>
          <NativeSelect id="record-field" value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="record-ridge" className="text-xs">畝</Label>
          <NativeSelect id="record-ridge" value={ridge?.id ?? ''} onChange={(e) => setRidgeId(e.target.value)}>
            {ridges.map((r) => (
              <option key={r.id} value={r.id}>畝{r.ridgeNumber}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="record-row" className="text-xs">列</Label>
          <NativeSelect id="record-row" value={row?.id ?? ''} onChange={(e) => setRowId(e.target.value)}>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>列{r.rowNumber}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="record-plant" className="text-xs">個体</Label>
          <NativeSelect id="record-plant" value={plant?.id ?? ''} onChange={(e) => selectPlant(e.target.value)}>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plantNumber}番 — {p.cropName ?? '空き'}（{CROP_STATUS_LABELS[p.status]}）
              </option>
            ))}
          </NativeSelect>
        </div>
      </fieldset>

      <RecordFields idPrefix="record" values={values} onChange={setValues} />

      <p className="text-xs text-muted-foreground">記録を追加すると、その個体の状態も自動で更新されます。</p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">{error}</p>
      )}
      <Button type="submit" className="w-full">記録を追加</Button>
    </form>
  )
}
