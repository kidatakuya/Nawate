import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/farm/app-header'
import { FarmProvider } from '@/components/farm/farm-provider'
import type { FarmDataMode } from '@/lib/farm-api'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const dataMode: FarmDataMode = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
    ? 'mock'
    : 'supabase'

  if (process.env.NODE_ENV !== 'development') {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    ) {
      redirect('/login?setup=1')
    }

    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect('/login')
    }
  }

  return (
    <FarmProvider dataMode={dataMode}>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-8">{children}</main>
    </FarmProvider>
  )
}
