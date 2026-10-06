'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFields } from '@/hooks/use-farm'
import { FIELD_LIMITS, numberFormatter } from '@/lib/farm-utils'
import type { Field, FieldInput } from '@/lib/types'

type CountKey = 'ridgeCount' | 'rowCountPerRidge' | 'plantCountPerRow'

const COUNT_FIELDS: readonly { key: CountKey; label: string; unit: string }[] = [
  { key: 'ridgeCount', label: '畝数', unit: '畝' },
  { key: 'rowCountPerRidge', label: '1畝あたりの列数', unit: '列' },
  { key: 'plantCountPerRow', label: '1列あたりの個数', unit: '個' },
]

type FormValues = Record<'name' | CountKey, string>

function parseCount(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  return Number(value)
}

export function FieldForm({ onDone }: { onDone: (field: Field) => void }) {
  const { addField } = useFields()
  const [values, setValues] = useState<FormValues>({
    name: '',
    ridgeCount: '4',
    rowCountPerRidge: '2',
    plantCountPerRow: '10',
  })
  const [error, setError] = useState<string | null>(null)

  const counts = COUNT_FIELDS.map(({ key }) => parseCount(values[key]))
  const preview = counts.every((n): n is number => n !== null) ? counts[0] * counts[1] * counts[2] : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = values.name.trim()
    if (!name) return setError('畑の名前を入力してください。')
    if (name.length > FIELD_LIMITS.nameMaxLength) {
      return setError(`畑の名前は${FIELD_LIMITS.nameMaxLength}文字以内で入力してください。`)
    }

    const input: Partial<FieldInput> = { name }
    for (const { key, label } of COUNT_FIELDS) {
      const n = parseCount(values[key])
      const { min, max } = FIELD_LIMITS[key]
      if (n === null || n < min || n > max) {
        return setError(`${label}は${min}〜${max}の整数で入力してください。`)
      }
      input[key] = n
    }
    const complete = input as FieldInput
    const total = complete.ridgeCount * complete.rowCountPerRidge * complete.plantCountPerRow
    if (total > FIELD_LIMITS.totalSlots) {
      return setError(`総スロット数は${numberFormatter.format(FIELD_LIMITS.totalSlots)}以下にしてください。`)
    }

    setError(null)
    onDone(addField(complete))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="field-name">畑の名前</Label>
        <Input
          id="field-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="例: 東の畑"
          maxLength={FIELD_LIMITS.nameMaxLength}
          autoComplete="off"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {COUNT_FIELDS.map(({ key, label, unit }) => (
          <div key={key} className="flex flex-col gap-2">
            <Label htmlFor={`field-${key}`} className="text-xs">
              {label}
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                id={`field-${key}`}
                type="number"
                inputMode="numeric"
                min={FIELD_LIMITS[key].min}
                max={FIELD_LIMITS[key].max}
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                required
              />
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
        <p>
          自動生成される個体スロット:{' '}
          <span className="font-bold tabular-nums">{preview === null ? '—' : numberFormatter.format(preview)}</span> 個
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          位置の体系を保つため、畝数・列数・個数は登録後に変更できません。
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full">
        登録する
      </Button>
    </form>
  )
}
