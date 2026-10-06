import { ProjectDetailPage } from '@/components/projects/project-pages'

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <ProjectDetailPage projectId={projectId} />
}
