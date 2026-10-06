import { RidgeDetailView } from '@/components/farm/hierarchy/detail-views'

export default async function Page({ params }: { params: Promise<{ fieldId: string; ridgeId: string }> }) {
  const { fieldId, ridgeId } = await params
  return <RidgeDetailView fieldId={fieldId} ridgeId={ridgeId} />
}
