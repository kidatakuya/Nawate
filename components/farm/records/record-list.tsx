'use client'

import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFarmIndex, useGrowthRecords } from '@/hooks/use-farm'
import { describePlant } from '@/lib/farm-index'
import { formatDate, hrefs } from '@/lib/farm-utils'
import type { GrowthRecord } from '@/lib/types'
import { DeleteButton, EmptyState } from '../shared'
import { StatusBadge } from '../status-badge'

export function RecordList({ records }: { records: GrowthRecord[] }) {
  const index = useFarmIndex()
  const { deleteRecord } = useGrowthRecords()

  if (records.length === 0) {
    return <EmptyState title="生育記録がありません" description="「記録を追加」から最初の記録を登録しましょう。" />
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">日付</TableHead>
            <TableHead>個体</TableHead>
            <TableHead>作物名</TableHead>
            <TableHead>状態</TableHead>
            <TableHead>メモ</TableHead>
            <TableHead className="w-12 print:hidden">
              <span className="sr-only">操作</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const context = describePlant(index, record.plantId)
            return (
              <TableRow key={record.id}>
                <TableCell className="tabular-nums">{formatDate(record.recordedAt)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {context ? (
                    <Link
                      href={hrefs.plant(context.field.id, context.ridge.id, context.row.id, context.plant.id)}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {context.displayName}
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{context?.plant.cropName ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={record.status} />
                </TableCell>
                <TableCell className="min-w-48 whitespace-normal text-pretty text-muted-foreground">
                  {record.note || '—'}
                </TableCell>
                <TableCell className="print:hidden">
                  <DeleteButton
                    label={`${formatDate(record.recordedAt)}の記録を削除`}
                    title="記録を削除しますか？"
                    description="個体の現在の状態は変わりません。この操作は取り消せません。"
                    onConfirm={() => deleteRecord(record.id)}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
