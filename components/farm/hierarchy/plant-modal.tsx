'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGrowthRecords, usePlants } from '@/hooks/use-farm'
import { CROP_STATUS_LABELS, formatDate, isValidDateString, NEXT_STATUS, todayString } from '@/lib/farm-utils'
import type { CropStatus, Plant } from '@/lib/types'
import { RecordFields, type RecordValues } from '../records/record-fields'
import { DeleteButton, StatusPicker } from '../shared'
import { StatusBadge } from '../status-badge'

export function PlantModal({ plantId, onClose }: { plantId: string | null; onClose: () => void }) {
  const { getPlantContext } = usePlants()
  const context = plantId ? getPlantContext(plantId) : null

  return (
    <Dialog open={context !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {context && (
          <>
            <DialogHeader>
              <DialogTitle className="text-pretty">{context.displayName}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                現在の状態 <StatusBadge status={context.plant.status} />
              </DialogDescription>
            </DialogHeader>
            <PlantEditForm
              key={`${context.plant.id}:${context.plant.status}:${context.plant.cropName}:${context.plant.plantedAt}`}
              plant={context.plant}
            />
            <PlantRecordSection key={context.plant.id} plant={context.plant} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PlantEditForm({ plant }: { plant: Plant }) {
  const { updatePlant, clearPlant } = usePlants()
  const [cropName, setCropName] = useState(plant.cropName ?? '')
  const [plantedAt, setPlantedAt] = useState(plant.plantedAt ?? '')
  const [status, setStatus] = useState<CropStatus>(plant.status)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (plantedAt && !isValidDateString(plantedAt)) return setError('植えた日の形式が正しくありません。')
    const name = cropName.trim()
    if (status !== 'empty' && !name) return setError('使用中の個体には作物名を入力してください。')
    setError(null)
    updatePlant(plant.id, { cropName: name || null, plantedAt: plantedAt || null, status })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-xl border p-4">
      <h3 className="text-sm font-bold">個体情報</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="plant-crop">作物名</Label>
          <Input
            id="plant-crop"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            placeholder="例: トマト"
            maxLength={40}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plant-planted">植えた日</Label>
          <Input id="plant-planted" type="date" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} />
        </div>
      </div>
      <StatusPicker name="plant-status" value={status} onChange={setStatus} />
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-2 print:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => clearPlant(plant.id)}
          disabled={plant.status === 'empty' && plant.cropName === null && plant.plantedAt === null}
        >
          空きスロットに戻す
        </Button>
        <Button type="submit">個体情報を保存</Button>
      </div>
    </form>
  )
}

function PlantRecordSection({ plant }: { plant: Plant }) {
  const { addRecord, deleteRecord, getRecordsByPlant } = useGrowthRecords()
  const records = getRecordsByPlant(plant.id)
  const [values, setValues] = useState<RecordValues>(() => ({
    recordedAt: todayString(),
    status: NEXT_STATUS[plant.status] ?? plant.status,
    note: '',
  }))
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidDateString(values.recordedAt)) return setError('記録日を入力してください。')
    setError(null)
    addRecord({ plantId: plant.id, recordedAt: values.recordedAt, status: values.status, note: values.note.trim() })
    setMessage(`記録を追加し、状態を「${CROP_STATUS_LABELS[values.status]}」に更新しました。`)
    setValues((v) => ({ ...v, status: NEXT_STATUS[v.status] ?? v.status, note: '' }))
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-xl border p-4 print:hidden">
        <h3 className="text-sm font-bold">生育記録を追加</h3>
        <RecordFields idPrefix="plant-record" values={values} onChange={setValues} />
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <p aria-live="polite" className="text-sm text-primary empty:hidden">
          {message}
        </p>
        <Button type="submit" variant="secondary">
          記録を追加
        </Button>
      </form>

      <section aria-labelledby="plant-history-heading">
        <h3 id="plant-history-heading" className="mb-2 text-sm font-bold">
          記録履歴（{records.length}件）
        </h3>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ記録はありません。</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {records.map((record) => (
              <li key={record.id} className="flex items-start gap-3 rounded-lg bg-muted px-3 py-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tabular-nums">{formatDate(record.recordedAt)}</span>
                    <StatusBadge status={record.status} />
                  </div>
                  {record.note && <p className="text-sm text-pretty">{record.note}</p>}
                </div>
                <DeleteButton
                  label={`${formatDate(record.recordedAt)}の記録を削除`}
                  title="記録を削除しますか？"
                  description="個体の現在の状態は変わりません。"
                  onConfirm={() => deleteRecord(record.id)}
                />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
