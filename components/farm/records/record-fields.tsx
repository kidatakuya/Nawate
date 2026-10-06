'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CropStatus } from '@/lib/types'
import { StatusPicker } from '../shared'

export type RecordValues = {
  recordedAt: string
  status: CropStatus
  note: string
}

export function RecordFields({
  idPrefix,
  values,
  onChange,
}: {
  idPrefix: string
  values: RecordValues
  onChange: (values: RecordValues) => void
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-date`}>記録日</Label>
        <Input
          id={`${idPrefix}-date`}
          type="date"
          value={values.recordedAt}
          onChange={(e) => onChange({ ...values, recordedAt: e.target.value })}
          required
        />
      </div>
      <StatusPicker
        name={`${idPrefix}-status`}
        legend="記録時の状態"
        value={values.status}
        onChange={(status) => onChange({ ...values, status })}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-note`}>メモ</Label>
        <Textarea
          id={`${idPrefix}-note`}
          value={values.note}
          onChange={(e) => onChange({ ...values, note: e.target.value })}
          placeholder="例: 追肥を実施。葉色良好。"
          maxLength={500}
          rows={3}
        />
      </div>
    </>
  )
}
