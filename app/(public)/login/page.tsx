import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'ログイン | 畑ノート',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; next?: string }>
}) {
  if (process.env.NODE_ENV === 'development') {
    redirect('/')
  }

  const params = await searchParams
  const setupRequired =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  const nextPath = params.next?.startsWith('/') && !params.next.startsWith('//') ? params.next : '/'

  return <LoginForm setupRequired={setupRequired} nextPath={nextPath} />
}
