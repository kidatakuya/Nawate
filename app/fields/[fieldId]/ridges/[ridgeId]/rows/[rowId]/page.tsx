import { RowDetailView } from '@/components/farm/hierarchy/detail-views'

export default async function Page({
  params,
}: {
  params: Promise<{ fieldId: string; ridgeId: string; rowId: string }>
}) {
  const { fieldId, ridgeId, rowId } = await params
  return <RowDetailView fieldId={fieldId} ridgeId={ridgeId} rowId={rowId} />
}
