import {
  CROP_STATUS_LABELS,
  CROP_STATUSES,
  countUsage,
  totalOf,
  USAGE_CATEGORIES,
  type StatusCounts,
  type UsageCategory,
} from '@/lib/farm-utils'
import type { CropStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export const STATUS_DOT_CLASS: Record<CropStatus, string> = {
  empty: 'bg-status-empty',
  sprouted: 'bg-status-sprouted',
  growing: 'bg-status-growing',
  flowering: 'bg-status-flowering',
  harvested: 'bg-status-harvested',
  withered: 'bg-status-withered',
}

const STATUS_BADGE_CLASS: Record<CropStatus, string> = {
  empty: 'bg-muted border-status-empty text-muted-foreground',
  sprouted: 'bg-status-sprouted/25 border-status-sprouted',
  growing: 'bg-status-growing/15 border-status-growing/60',
  flowering: 'bg-status-flowering/20 border-status-flowering',
  harvested: 'bg-status-harvested/15 border-status-harvested/60',
  withered: 'bg-status-withered/12 border-status-withered/60',
}

export const STATUS_CARD_CLASS: Record<CropStatus, string> = {
  empty: 'border-dashed border-status-empty bg-muted/50 text-muted-foreground',
  sprouted: 'border-status-sprouted bg-status-sprouted/20',
  growing: 'border-status-growing bg-status-growing/12',
  flowering: 'border-status-flowering bg-status-flowering/18',
  harvested: 'border-status-harvested bg-status-harvested/12',
  withered: 'border-status-withered bg-status-withered/10',
}

const USAGE_BAR_CLASS: Record<UsageCategory, string> = {
  empty: 'bg-status-empty',
  active: 'bg-status-growing',
  harvested: 'bg-status-harvested',
  withered: 'bg-status-withered',
}

export function StatusDot({ status, className }: { status: CropStatus; className?: string }) {
  return <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_CLASS[status], className)} aria-hidden="true" />
}

export function StatusBadge({ status, className }: { status: CropStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium text-foreground',
        STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      <StatusDot status={status} />
      {CROP_STATUS_LABELS[status]}
    </span>
  )
}

export function StatusLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground', className)} aria-label="状態の凡例">
      {CROP_STATUSES.map((status) => (
        <li key={status} className="flex items-center gap-1.5">
          <span className={cn('size-3 rounded-sm', STATUS_DOT_CLASS[status])} aria-hidden="true" />
          {CROP_STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  )
}

export function UsageBar({ counts, className }: { counts: StatusCounts; className?: string }) {
  const usage = countUsage(counts)
  const total = totalOf(counts)
  const summary = USAGE_CATEGORIES.map(({ key, label }) => `${label}${usage[key]}`).join('、')

  return (
    <div
      role="img"
      aria-label={`内訳: ${summary}`}
      className={cn('flex h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      {total > 0 &&
        USAGE_CATEGORIES.map(({ key }) =>
          usage[key] > 0 ? (
            <span key={key} className={USAGE_BAR_CLASS[key]} style={{ width: `${(usage[key] / total) * 100}%` }} />
          ) : null,
        )}
    </div>
  )
}

export function UsageLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground', className)} aria-label="使用状況の凡例">
      {USAGE_CATEGORIES.map(({ key, label }) => (
        <li key={key} className="flex items-center gap-1.5">
          <span className={cn('size-3 rounded-sm', USAGE_BAR_CLASS[key])} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}
