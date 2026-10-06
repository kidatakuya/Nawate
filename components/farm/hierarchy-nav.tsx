'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useFarmIndex } from '@/hooks/use-farm'
import { hrefs } from '@/lib/farm-utils'
import { cn } from '@/lib/utils'

type Level = {
  caption: string
  label: string | null
  href: string | null
}

const PATH_PATTERN = /^\/fields(?:\/([^/]+)(?:\/ridges\/([^/]+)(?:\/rows\/([^/]+))?)?)?/

export function HierarchyNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const index = useFarmIndex()

  const match = pathname.match(PATH_PATTERN)
  const field = match?.[1] ? index.fieldById.get(match[1]) : undefined
  const ridgeCandidate = field && match?.[2] ? index.ridgeById.get(match[2]) : undefined
  const ridge = ridgeCandidate?.fieldId === field?.id ? ridgeCandidate : undefined
  const rowCandidate = ridge && match?.[3] ? index.rowById.get(match[3]) : undefined
  const row = rowCandidate?.ridgeId === ridge?.id ? rowCandidate : undefined
  const plantId = row ? searchParams.get('plant') : null
  const plantCandidate = plantId ? index.plantById.get(plantId) : undefined
  const plant = plantCandidate?.rowId === row?.id ? plantCandidate : undefined

  const levels: Level[] = [
    { caption: '畑', label: field?.name ?? null, href: field ? hrefs.field(field.id) : null },
    {
      caption: '畝',
      label: ridge ? `畝${ridge.ridgeNumber}` : null,
      href: field && ridge ? hrefs.ridge(field.id, ridge.id) : null,
    },
    {
      caption: '列',
      label: row ? `列${row.rowNumber}` : null,
      href: field && ridge && row ? hrefs.row(field.id, ridge.id, row.id) : null,
    },
    { caption: '個体', label: plant ? `${plant.plantNumber}番` : null, href: null },
  ]
  const currentIndex = levels.findLastIndex((level) => level.label !== null)

  return (
    <nav aria-label="階層ナビゲーション" className="border-t bg-muted/60 print:hidden">
      <ol className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm sm:px-6">
        <li className="shrink-0">
          <Link
            href="/fields"
            className="rounded-md px-2 py-1 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            畑一覧
          </Link>
        </li>
        {levels.map((level, i) => {
          const isCurrent = i === currentIndex
          const content = (
            <>
              <span className="text-xs text-muted-foreground">{level.caption}</span>
              <span className={cn(level.label ? 'font-medium' : 'text-muted-foreground/70')}>
                {level.label ?? '未選択'}
              </span>
            </>
          )
          return (
            <li key={level.caption} className="flex shrink-0 items-center gap-1">
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              {level.label && level.href && !isCurrent ? (
                <Link
                  href={level.href}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent hover:text-accent-foreground"
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2 py-1',
                    isCurrent && 'bg-card shadow-xs ring-1 ring-border',
                  )}
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function HierarchyNavFallback() {
  return <div className="h-10 border-t bg-muted/60 print:hidden" aria-hidden="true" />
}
