'use client'

import Link from 'next/link'
import { useState, type ReactNode, type SelectHTMLAttributes } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CROP_STATUS_LABELS, CROP_STATUSES } from '@/lib/farm-utils'
import type { CropStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { STATUS_DOT_CLASS } from './status-badge'

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
        {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
      </div>
      {action && <div className="flex shrink-0 gap-2 print:hidden">{action}</div>}
    </div>
  )
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
      {action && <div className="print:hidden">{action}</div>}
    </div>
  )
}

export function MissingState({ what }: { what: string }) {
  return (
    <EmptyState
      title={`${what}が見つかりません`}
      description="データはメモリ上で管理しているため、ページを再読み込みすると追加した畑は消えます。"
      action={
        <Button nativeButton={false} render={<Link href="/fields" />} variant="outline">
          畑一覧へ戻る
        </Button>
      }
    />
  )
}

export function NativeSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function StatusPicker({
  name,
  value,
  onChange,
  legend = '状態',
}: {
  name: string
  value: CropStatus
  onChange: (status: CropStatus) => void
  legend?: string
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {CROP_STATUSES.map((status) => (
          <label
            key={status}
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border bg-card px-2.5 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-accent has-checked:font-medium has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={status}
              checked={value === status}
              onChange={() => onChange(status)}
              className="sr-only"
            />
            <span className={cn('size-3 shrink-0 rounded-full', STATUS_DOT_CLASS[status])} aria-hidden="true" />
            {CROP_STATUS_LABELS[status]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90dvh] overflow-y-auto sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function DeleteButton({
  label,
  title,
  description,
  onConfirm,
  showLabel = false,
}: {
  label: string
  title: string
  description: string
  onConfirm: () => void
  showLabel?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size={showLabel ? 'sm' : 'icon-sm'}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive print:hidden"
        onClick={() => setOpen(true)}
        aria-label={showLabel ? undefined : label}
      >
        <Trash2 aria-hidden="true" />
        {showLabel && label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
