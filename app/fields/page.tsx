import type { Metadata } from 'next'
import { FieldsPage } from '@/components/farm/fields/fields-page'

export const metadata: Metadata = { title: '畑管理 | 畑ノート' }

export default function Page() {
  return <FieldsPage />
}
