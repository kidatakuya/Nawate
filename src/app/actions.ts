'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  if (process.env.NODE_ENV === 'development') {
    redirect('/')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(`ログアウトに失敗しました: ${error.message}`)
  }
  redirect('/login')
}
