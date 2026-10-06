import { FieldDetailView } from '@/components/farm/hierarchy/detail-views'

export default async function Page({ params }: { params: Promise<{ fieldId: string }> }) {
  const { fieldId } = await params
  return <FieldDetailView fieldId={fieldId} />
}
