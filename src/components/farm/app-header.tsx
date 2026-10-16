"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ClipboardList,
  Menu,
  LayoutDashboard,
  Sprout,
  FolderKanban,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur print:static print:border-b-2 print:bg-white">
      <div className="mx-auto w-full max-w-6xl px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-wide">Nawate</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              プロジェクト別 生育管理
            </span>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="print:hidden md:hidden"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
            aria-controls="mobile-main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
          <div className="hidden items-center gap-2 md:flex">
            <MainNavigation pathname={pathname} />
            <SignOutForm />
          </div>
        </div>
        {menuOpen && (
          <div id="mobile-main-navigation" className="mt-3 space-y-2 border-t pt-3 md:hidden">
            <MainNavigation pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <SignOutForm />
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        <ProjectHierarchyNav />
      </Suspense>
    </header>
  );
}

function MainNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="メインナビゲーション" className="print:hidden">
      <ul className="flex flex-col gap-1 md:flex-row">
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
                onClick={onNavigate}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
  );
}

function SignOutForm() {
  return (
    <form action={signOut} className="print:hidden">
      <Button type="submit" variant="outline" size="sm" className="min-h-10 w-full px-3 md:w-auto">
        ログアウト
      </Button>
    </form>
  );
}
