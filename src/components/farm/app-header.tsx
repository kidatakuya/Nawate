"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  ClipboardList,
  LayoutDashboard,
  Sprout,
  FolderKanban,
} from "lucide-react";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectHierarchyNav } from "./project-hierarchy-nav";

const NAV_ITEMS = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/projects", label: "プロジェクト", icon: FolderKanban },
  { href: "/records", label: "生育記録", icon: ClipboardList },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur print:static print:border-b-2 print:bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-wide">Nawate</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            プロジェクト別 生育管理
          </span>
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <nav aria-label="メインナビゲーション" className="min-w-0 flex-1 print:hidden md:flex-none">
            <ul className="-mx-1 flex gap-1 overflow-x-auto pb-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <form action={signOut} className="print:hidden">
            <Button type="submit" variant="outline" size="sm" className="min-h-10 px-2 sm:px-2.5">
              ログアウト
            </Button>
          </form>
        </div>
      </div>
      <Suspense fallback={null}>
        <ProjectHierarchyNav />
      </Suspense>
    </header>
  );
}
