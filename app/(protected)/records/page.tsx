import type { Metadata } from 'next'
import { RecordsPage } from '@/components/projects/project-pages'

export const metadata: Metadata = { title: '生育記録 | 畑ノート' }

export default function Page() {
  return <RecordsPage />
}
