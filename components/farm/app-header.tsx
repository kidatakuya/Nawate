'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ClipboardList, LayoutDashboard, MapIcon, Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HierarchyNav, HierarchyNavFallback } from './hierarchy-nav'

const NAV_ITEMS = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/fields', label: '畑管理', icon: MapIcon },
  { href: '/records', label: '生育記録', icon: ClipboardList },
] as const

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur print:static print:border-b-2 print:bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-wide">畑ノート</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">個体別 生育管理</span>
        </Link>

        <nav aria-label="メインナビゲーション" className="print:hidden">
          <ul className="-mx-1 flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      <Suspense fallback={<HierarchyNavFallback />}>
        <HierarchyNav />
      </Suspense>
    </header>
  )
}
