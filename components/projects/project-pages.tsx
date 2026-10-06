'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFarm } from '@/hooks/use-farm'
import { ProjectCard } from '@/components/projects/project-card'
import {
  CROP_STATUSES,
  CROP_STATUS_LABELS,
  FIELD_LIMITS,
  STATUS_CLASSES,
  countStatuses,
  formatDate,
  isValidDateString,
  numberFormatter,
  plantDisplayName,
  todayString,
  usedOf,
  type StatusCounts,
} from '@/lib/farm-utils'
import type { CropStatus, Plant, Project, ProjectFieldConfig, ProjectFieldConfigInput } from '@/lib/types'
import { cn } from '@/lib/utils'

function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="print:hidden">{action}</div>}
    </div>
  )
}

function StatusPill({ status }: { status: CropStatus }) {
  const fg: Record<CropStatus, string> = {
    empty: 'text-foreground',
    sprouted: 'text-foreground',
    growing: 'text-white',
    flowering: 'text-foreground',
    harvested: 'text-white',
    withered: 'text-white',
  }
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', STATUS_CLASSES[status], fg[status])}>{CROP_STATUS_LABELS[status]}</span>
}

function ProjectStateBadge({ ended }: { ended: boolean }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', ended ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>{ended ? '終了' : '進行中'}</span>
}

function StatusBar({ counts }: { counts: StatusCounts }) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const statuses: CropStatus[] = ['empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered']
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-label="個体の状態内訳">
        {statuses.map((status) => <span key={status} className={STATUS_CLASSES[status]} style={{ width: total ? `${counts[status] / total * 100}%` : 0 }} title={`${CROP_STATUS_LABELS[status]} ${counts[status]}`} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {statuses.map((status) => <span key={status} className="inline-flex items-center gap-1"><span className={cn('size-2 rounded-full', STATUS_CLASSES[status])} />{CROP_STATUS_LABELS[status]} {counts[status]}</span>)}
      </div>
    </div>
  )
}

function projectCounts(project: Project, plants: Plant[]) {
  const matching = plants.filter((plant) => plant.projectId === project.id)
  const counts = countStatuses(matching)
  return { counts, total: matching.length, used: usedOf(counts) }
}

export function DashboardPage() {
  const { projects, fieldMasters, projectFieldConfigs, plants } = useFarm()
  const activeProjects = projects.filter((project) => project.endDate === null)
  const [projectId, setProjectId] = useState(activeProjects[0]?.id ?? '')
  const project = activeProjects.find((item) => item.id === projectId) ?? activeProjects[0]
  const fields = project ? project.fieldIds.map((id) => fieldMasters.find((field) => field.id === id)).filter((field): field is NonNullable<typeof field> => !!field) : []
  const [fieldId, setFieldId] = useState('')
  const field = fields.find((item) => item.id === fieldId) ?? fields[0]
  const config = project && field ? projectFieldConfigs.find((item) => item.projectId === project.id && item.fieldId === field.id) : undefined
  const fieldPlants = project && field ? plants.filter((plant) => plant.projectId === project.id && plant.fieldId === field.id) : []
  const ridgeGroups = config ? Array.from({ length: config.ridgeCount }, (_, index) => index + 1) : []
  return (
    <>
      <PageTitle title="ダッシュボード" description="進行中プロジェクトと畑の生育状況を確認できます。" action={<Button nativeButton={false} render={<Link href="/projects/new" />}><Plus />新規プロジェクト</Button>} />
      {!activeProjects.length ? <EmptyNotice title="進行中のプロジェクトはありません" action={<Button nativeButton={false} render={<Link href="/projects/new" />}>プロジェクトを作成</Button>} /> : (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-2">
            {activeProjects.map((item) => {
              const summary = projectCounts(item, plants)
              return <Link key={item.id} href={`/projects/${item.id}`} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2"><CardTitle>{item.name}</CardTitle><p className="text-sm text-muted-foreground">{item.year}年度 ・ {item.cropName}</p></CardHeader>
                  <CardContent><div className="mb-3 flex flex-wrap gap-4 text-sm"><span>使用畑 {item.fieldIds.length}</span><span>総個体 {numberFormatter.format(summary.total)}</span><span>使用中 {numberFormatter.format(summary.used)}</span></div><StatusBar counts={summary.counts} /></CardContent>
                </Card>
              </Link>
            })}
          </section>
          <section className="mb-8">
            <PageTitle title="畑ごとの使用状況" description="プロジェクトを選び、畑の状態を確認します。" />
            <div className="mb-4 flex flex-wrap gap-2">
              {activeProjects.map((item) => <button key={item.id} type="button" aria-pressed={project?.id === item.id} onClick={() => { setProjectId(item.id); setFieldId('') }} className={cn('rounded-full border px-4 py-2 text-sm', project?.id === item.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent')}>{item.name}</button>)}
            </div>
            {project && fields.map((item) => {
              const counts = countStatuses(plants.filter((plant) => plant.projectId === project.id && plant.fieldId === item.id))
              return <div key={item.id} className="mb-3 rounded-xl border bg-card p-4"><div className="mb-2 flex justify-between gap-3"><strong>{item.name}</strong><span className="text-sm text-muted-foreground">{usedOf(counts)} / {Object.values(counts).reduce((a, b) => a + b, 0)} 使用</span></div><StatusBar counts={counts} /></div>
            })}
          </section>
          <section>
            <PageTitle title="畝×列ヒートマップ" description="プロジェクトと畑を選び、各列の個体状況を確認できます。" />
            {project && fields.length > 0 ? <>
              <div className="mb-4 flex flex-wrap gap-2">{fields.map((item) => <button key={item.id} type="button" aria-pressed={field?.id === item.id} onClick={() => setFieldId(item.id)} className={cn('rounded-full border px-4 py-2 text-sm', field?.id === item.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent')}>{item.name}</button>)}</div>
              {config && field && <div className="overflow-x-auto rounded-xl border bg-card p-4">
                <div className="flex w-max items-start gap-4">
                  {ridgeGroups.map((ridge) => <section key={ridge} className="rounded-lg border p-3">
                    <Link href={`/projects/${project.id}?field=${field.id}&ridge=${ridge}`} className="mb-3 inline-block text-sm font-semibold text-primary hover:underline">畝{ridge}</Link>
                    <div className="flex items-start gap-2">
                      {Array.from({ length: config.rowCountPerRidge }, (_, rowIndex) => {
                        const row = rowIndex + 1
                        const rowPlants = fieldPlants.filter((plant) => plant.ridgeNumber === ridge && plant.rowNumber === row)
                        const dominant = (['withered', 'harvested', 'flowering', 'growing', 'sprouted', 'empty'] as CropStatus[]).find((status) => rowPlants.some((plant) => plant.status === status)) ?? 'empty'
                        return <Link key={row} href={`/projects/${project.id}?field=${field.id}&ridge=${ridge}&row=${row}`} aria-label={`畝${ridge} 列${row}の個体を表示`} className="flex min-w-12 flex-col items-center gap-2 rounded-md border bg-muted/40 px-2 py-2 hover:ring-2 hover:ring-primary">
                          <span className="text-sm font-semibold text-muted-foreground">列{row}</span>
                          <span className="flex flex-col items-center gap-1">{rowPlants.map((plant) => <span key={plant.id} className={cn('size-2.5 rounded-full', STATUS_CLASSES[plant.status])} />)}</span>
                          <span className="sr-only">{CROP_STATUS_LABELS[dominant]}</span>
                        </Link>
                      })}
                    </div>
                  </section>)}
                </div>
              </div>}
              {!config && <EmptyNotice title="この畑の構成はまだ設定されていません" action={<Button nativeButton={false} render={<Link href={`/projects/${project.id}`} />}>プロジェクトで畑を設定</Button>} />}
            </> : <EmptyNotice title="プロジェクトに畑が割り当てられていません" />}
          </section>
        </>
      )}
    </>
  )
}

export function ProjectListPage() {
  const { projects, plants } = useFarm()
  const sorted = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate))
  return <>
    <PageTitle title="プロジェクト" description="作物の栽培をプロジェクト単位で管理します。" action={<Button nativeButton={false} render={<Link href="/projects/new" />}><Plus />新規プロジェクト</Button>} />
    {sorted.length ? <div className="grid gap-4 md:grid-cols-2">{sorted.map((project) => {
      const summary = projectCounts(project, plants)
      return <ProjectCard key={project.id} project={project} fieldCount={project.fieldIds.length} totalPlants={summary.total} usedPlants={summary.used} />
    })}</div> : <EmptyNotice title="プロジェクトがありません" action={<Button nativeButton={false} render={<Link href="/projects/new" />}>最初のプロジェクトを作成</Button>} />}
  </>
}

export function NewProjectPage() {
  const { fieldMasters, addProject } = useFarm()
  const router = useRouter()
  const [name, setName] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [cropName, setCropName] = useState('')
  const [fieldIds, setFieldIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(todayString())
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedYear = Number(year)
    if (!name.trim() || !cropName.trim()) return setError('プロジェクト名と作物名を入力してください。')
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 9999) return setError('年度を正しく入力してください。')
    if (!isValidDateString(startDate) || (endDate && !isValidDateString(endDate))) return setError('日付を正しく入力してください。')
    if (endDate && endDate < startDate) return setError('終了日は開始日以降の日付にしてください。')
    setError('')
    const project = addProject({ name: name.trim(), year: parsedYear, cropName: cropName.trim(), fieldIds, startDate, endDate: endDate || null })
    router.push(`/projects/${project.id}`)
  }
  return <>
    <PageTitle title="新規プロジェクト" description="作物の栽培単位を作成します。" />
    <Card className="max-w-2xl"><CardContent className="pt-6">
      <form onSubmit={submit} className="flex flex-col gap-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="project-name">プロジェクト名</Label><Input id="project-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="例：2026年春トマト" maxLength={80} /></div>
          <div className="space-y-2"><Label htmlFor="project-year">年度</Label><Input id="project-year" type="number" min={1900} max={9999} required value={year} onChange={(event) => setYear(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="project-crop">作物</Label><Input id="project-crop" required value={cropName} onChange={(event) => setCropName(event.target.value)} placeholder="例：トマト" maxLength={40} /></div>
          <div className="space-y-2"><Label htmlFor="project-start">開始日</Label><Input id="project-start" type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="project-end">終了日（任意）</Label><Input id="project-end" type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} /></div>
        </div>
        <fieldset className="space-y-2"><legend className="text-sm font-medium">使用する畑</legend>
          {!fieldMasters.length ? <p className="text-sm text-muted-foreground">先に畑マスタを登録してください。</p> : fieldMasters.map((field) => <label key={field.id} className="flex min-h-10 items-center gap-3 rounded-md border px-3"><input type="checkbox" checked={fieldIds.includes(field.id)} onChange={(event) => setFieldIds((ids) => event.target.checked ? [...ids, field.id] : ids.filter((id) => id !== field.id))} className="size-4 accent-primary" />{field.name}</label>)}
        </fieldset>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2"><Button type="submit">作成して詳細へ</Button><Button type="button" variant="outline" onClick={() => router.push('/projects')}>キャンセル</Button></div>
      </form>
    </CardContent></Card>
  </>
}

function FieldConfigEditor({ projectId, fieldId, config }: { projectId: string; fieldId: string; config?: ProjectFieldConfig }) {
  const { applyFieldConfig } = useFarm()
  const [values, setValues] = useState<ProjectFieldConfigInput>({
    ridgeCount: config?.ridgeCount ?? 3,
    rowCountPerRidge: config?.rowCountPerRidge ?? 2,
    plantCountPerRow: config?.plantCountPerRow ?? 8,
  })
  const [message, setMessage] = useState('')
  const total = values.ridgeCount * values.rowCountPerRidge * values.plantCountPerRow
  function setValue(key: keyof ProjectFieldConfigInput, value: string) {
    setValues((current) => ({ ...current, [key]: Number(value) }))
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dimensions: [number, { min: number; max: number }][] = [
      [values.ridgeCount, FIELD_LIMITS.ridgeCount],
      [values.rowCountPerRidge, FIELD_LIMITS.rowCountPerRidge],
      [values.plantCountPerRow, FIELD_LIMITS.plantCountPerRow],
    ]
    if (dimensions.some(([value, limits]) => !Number.isInteger(value) || value < limits.min || value > limits.max) || total > FIELD_LIMITS.totalSlots) {
      setMessage(`各項目の上限と、総個体数${numberFormatter.format(FIELD_LIMITS.totalSlots)}以下を確認してください。`)
      return
    }
    if (applyFieldConfig(projectId, fieldId, values)) setMessage('畑の構成を適用しました。')
  }
  return <form onSubmit={submit} className="mb-4 rounded-xl border bg-card p-4 print:hidden">
    <div className="grid grid-cols-3 gap-3">
      {([
        ['ridgeCount', '畝数', FIELD_LIMITS.ridgeCount.max],
        ['rowCountPerRidge', '1畝あたりの列数', FIELD_LIMITS.rowCountPerRidge.max],
        ['plantCountPerRow', '1列あたりの個数', FIELD_LIMITS.plantCountPerRow.max],
      ] as const).map(([key, label, max]) => <label key={key} className="space-y-1 text-xs text-muted-foreground">{label}<Input type="number" min={1} max={max} value={values[key]} onChange={(event) => setValue(key, event.target.value)} /></label>)}
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm">合計 {numberFormatter.format(total)} 個体</p><Button type="submit">設定を適用</Button></div>
    {message && <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">{message}</p>}
  </form>
}

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const farm = useFarm()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = `/projects/${projectId}`
  const project = farm.projects.find((item) => item.id === projectId)
  const fieldId = searchParams.get('field') ?? ''
  const ridgeNumber = Number(searchParams.get('ridge')) || null
  const rowNumber = Number(searchParams.get('row')) || null
  const plantId = searchParams.get('plant')
  const [bulkStatus, setBulkStatus] = useState<CropStatus | ''>('')
  const field = project?.fieldIds.map((id) => farm.fieldMasters.find((item) => item.id === id)).find((item) => item?.id === fieldId) ?? project?.fieldIds.map((id) => farm.fieldMasters.find((item) => item.id === id)).find((item) => !!item)
  const config = project && field ? farm.projectFieldConfigs.find((item) => item.projectId === project.id && item.fieldId === field.id) : undefined
  const plants = project && field ? farm.plants.filter((plant) => plant.projectId === project.id && plant.fieldId === field.id) : []
  const selectedPlant = plants.find((plant) => plant.id === plantId)
  if (!project) return <EmptyNotice title="プロジェクトが見つかりません" action={<Button nativeButton={false} render={<Link href="/projects" />}>一覧へ戻る</Button>} />
  function updateLocation(selection: { field?: string | null; ridge?: number | null; row?: number | null; plant?: string | null }) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(selection)) {
      if (value === null || value === undefined || value === '') params.delete(key)
      else params.set(key, String(value))
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }
  const allProjectPlants = farm.plants.filter((plant) => plant.projectId === project.id)
  const projectStatusCounts = countStatuses(allProjectPlants)
  const fieldName = (id: string) => farm.fieldMasters.find((item) => item.id === id)?.name ?? '削除された畑'
  const availableFields = project.fieldIds.map((id) => farm.fieldMasters.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => !!item)
  const closeProject = () => {
    if (window.confirm('このプロジェクトを今日の日付で終了しますか？終了後も詳細と記録を閲覧できます。')) farm.endProject(project.id, todayString())
  }
  const deleteProject = () => {
    if (window.confirm('プロジェクトと紐づく畑設定・個体・生育記録をすべて削除します。この操作は取り消せません。')) {
      farm.deleteProject(project.id)
      router.push('/projects')
    }
  }
  return <>
    <Link href="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="size-4" />プロジェクト一覧</Link>
    <PageTitle title={project.name} description={`${project.year}年度 ・ ${project.cropName} ・ ${formatDate(project.startDate)} – ${project.endDate ? formatDate(project.endDate) : '進行中'}`} action={<div className="flex flex-wrap gap-2">{project.endDate === null && <Button variant="outline" onClick={closeProject}>プロジェクトを終了する</Button>}<Button variant="destructive" onClick={deleteProject}><Trash2 />削除</Button></div>} />
    <nav aria-label="階層ナビゲーション" className="mb-5 flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
      <Link href="/projects" className="text-primary hover:underline">プロジェクト</Link><ChevronRight className="size-4 text-muted-foreground" />
      <span aria-current="page" className="font-medium">{project.name}</span>
      {field && <><ChevronRight className="size-4 text-muted-foreground" /><span>{field.name}</span></>}
      {ridgeNumber !== null && <><ChevronRight className="size-4 text-muted-foreground" /><span>畝{ridgeNumber}</span></>}
      {rowNumber !== null && <><ChevronRight className="size-4 text-muted-foreground" /><span>列{rowNumber}</span></>}
      {selectedPlant && <><ChevronRight className="size-4 text-muted-foreground" /><span>{selectedPlant.plantNumber}番</span></>}
    </nav>
    <section className="mb-6 rounded-xl border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">プロジェクトの栽培状況</h2><p className="text-sm text-muted-foreground">{allProjectPlants.length}個体 ・ {usedOf(projectStatusCounts)}個使用中</p></div><ProjectStateBadge ended={project.endDate !== null} /></div>
      <StatusBar counts={projectStatusCounts} />
    </section>
    <section className="mb-8">
      <PageTitle title="プロジェクトの畑" description="プロジェクト内で使う畑と、その畑ごとの栽培配置を設定します。" />
      {!availableFields.length ? <EmptyNotice title="使用する畑がありません" action={<Button nativeButton={false} render={<Link href="/fields" />}>畑マスタを登録</Button>} /> : <>
        <div className="mb-4 flex flex-wrap gap-2 print:hidden">{availableFields.map((item) => {
          const counts = countStatuses(farm.plants.filter((plant) => plant.projectId === project.id && plant.fieldId === item.id))
          return <button key={item.id} type="button" aria-pressed={field?.id === item.id} onClick={() => updateLocation({ field: item.id, ridge: null, row: null, plant: null })} className={cn('rounded-full border px-4 py-2 text-sm', field?.id === item.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent')}>{item.name}<span className="ml-2 opacity-75">{usedOf(counts)}/{Object.values(counts).reduce((a, b) => a + b, 0)}</span></button>
        })}</div>
        {field && <>
          <div className="mb-6 rounded-xl border p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">{field.name}の配置設定</h3><p className="text-xs text-muted-foreground">場所の畝数・列数はプロジェクト単位で管理します。</p></div>{config && <span className="text-xs text-muted-foreground">現在の設定を編集</span>}</div>
            <FieldConfigEditor key={`${project.id}:${field.id}:${config?.ridgeCount ?? 0}:${config?.rowCountPerRidge ?? 0}:${config?.plantCountPerRow ?? 0}`} projectId={project.id} fieldId={field.id} config={config} />
            {config && <>
              <div className="mb-5"><h4 className="mb-2 text-sm font-semibold">畝を選択</h4><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">{Array.from({ length: config.ridgeCount }, (_, index) => {
                const ridge = index + 1
                const ridgePlants = plants.filter((plant) => plant.ridgeNumber === ridge)
                return <button key={ridge} type="button" onClick={() => updateLocation({ ridge, row: null, plant: null })} aria-pressed={ridgeNumber === ridge} className={cn('rounded-xl border p-4 text-left hover:border-primary', ridgeNumber === ridge && 'border-primary bg-accent')}><span className="block font-semibold">畝{ridge}</span><span className="text-xs text-muted-foreground">{usedOf(countStatuses(ridgePlants))} / {ridgePlants.length} 使用中</span></button>
              })}</div></div>
              {ridgeNumber !== null && <div className="mb-5"><h4 className="mb-2 flex items-center gap-1 text-sm font-semibold"><ChevronRight className="size-4" />畝{ridgeNumber}の列</h4><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">{Array.from({ length: config.rowCountPerRidge }, (_, index) => {
                const row = index + 1
                const rowPlants = plants.filter((plant) => plant.ridgeNumber === ridgeNumber && plant.rowNumber === row)
                const counts = countStatuses(rowPlants)
                return <button key={row} type="button" onClick={() => updateLocation({ row, plant: null })} aria-pressed={rowNumber === row} className={cn('rounded-xl border p-3 text-left hover:border-primary', rowNumber === row && 'border-primary bg-accent')}><span className="mb-2 block text-sm font-medium">列{row}</span><div className="flex h-3 overflow-hidden rounded-full">{CROP_STATUSES.map((status) => <span key={status} className={STATUS_CLASSES[status]} style={{ width: rowPlants.length ? `${counts[status] / rowPlants.length * 100}%` : 0 }} />)}</div><span className="mt-1 block text-xs text-muted-foreground">{usedOf(counts)} / {rowPlants.length} 使用中</span></button>
              })}</div></div>}
              {ridgeNumber !== null && rowNumber !== null && (() => {
                const rowPlants = plants.filter((plant) => plant.ridgeNumber === ridgeNumber && plant.rowNumber === rowNumber)
                const bulkEligiblePlants = rowPlants.filter((plant) => plant.status !== 'withered')
                function applyBulkStatus() {
                  if (!bulkStatus || bulkStatus === 'withered' || !bulkEligiblePlants.length) return
                  if (!window.confirm(`畝${ridgeNumber} / 列${rowNumber}の${bulkEligiblePlants.length}個体（枯死個体を除く）を「${CROP_STATUS_LABELS[bulkStatus]}」に変更しますか？`)) return
                  farm.bulkUpdatePlants(bulkEligiblePlants.map((plant) => plant.id), bulkStatus === 'empty'
                    ? { status: 'empty', cropName: null, plantedAt: null }
                    : { status: bulkStatus })
                }
                return <div>
                  <h4 className="mb-2 text-sm font-semibold">個体一覧 — 畝{ridgeNumber} / 列{rowNumber}</h4>
                  <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3 print:hidden">
                    <label className="grid gap-1 text-sm">列の一括設定
                      <select className="h-9 min-w-40 rounded-lg border bg-background px-2" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as CropStatus | '')}>
                        <option value="">状態を選択</option>
                        {CROP_STATUSES.filter((status) => status !== 'withered').map((status) => <option key={status} value={status}>{CROP_STATUS_LABELS[status]}</option>)}
                      </select>
                    </label>
                    <Button type="button" variant="outline" disabled={!bulkStatus || !bulkEligiblePlants.length} onClick={applyBulkStatus}>枯死以外の{bulkEligiblePlants.length}個体に適用</Button>
                    <p className="basis-full text-xs text-muted-foreground">枯死した個体は一括変更の対象外です。個体を選択して個別に変更してください。</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">{rowPlants.map((plant) => <button key={plant.id} type="button" onClick={() => updateLocation({ plant: plant.id })} className={cn('rounded-xl border p-3 text-left transition-shadow hover:shadow-md', STATUS_CLASSES[plant.status], plant.status === 'growing' || plant.status === 'harvested' || plant.status === 'withered' ? 'text-white' : 'text-foreground')}><span className="block font-semibold">{field.name} / 畝{plant.ridgeNumber} / 列{plant.rowNumber} / {plant.plantNumber}番</span><span className="mt-1 block text-xs">{plant.cropName ?? project.cropName} ・ {CROP_STATUS_LABELS[plant.status]}</span></button>)}</div>
                </div>
              })()}
            </>}
          </div>
        </>}
      </>}
    </section>
    {selectedPlant && <PlantDialog project={project} fieldName={fieldName(selectedPlant.fieldId)} plant={selectedPlant} records={farm.records.filter((record) => record.plantId === selectedPlant.id).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))} onClose={() => updateLocation({ plant: null })} onSave={(changes) => farm.updatePlant(selectedPlant.id, changes)} onRecord={farm.addRecord} onDeleteRecord={farm.deleteRecord} />}
  </>
}

function PlantDialog({ project, fieldName, plant, records, onClose, onSave, onRecord, onDeleteRecord }: {
  project: Project
  fieldName: string
  plant: Plant
  records: ReturnType<typeof useFarm>['records']
  onClose: () => void
  onSave: (changes: Partial<Pick<Plant, 'cropName' | 'plantedAt' | 'status'>>) => void
  onRecord: (record: Omit<ReturnType<typeof useFarm>['records'][number], 'id'>) => void
  onDeleteRecord: (id: string) => void
}) {
  const [cropName, setCropName] = useState(plant.cropName ?? project.cropName)
  const [plantedAt, setPlantedAt] = useState(plant.plantedAt ?? '')
  const [status, setStatus] = useState<CropStatus>(plant.status)
  const [recordDate, setRecordDate] = useState(todayString())
  const [recordStatus, setRecordStatus] = useState<CropStatus>(plant.status === 'empty' ? 'sprouted' : plant.status)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const name = plantDisplayName(fieldName, plant.ridgeNumber, plant.rowNumber, plant.plantNumber)
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status !== 'empty' && !cropName.trim()) return setError('作物名を入力してください。')
    if (plantedAt && !isValidDateString(plantedAt)) return setError('植え付け日を正しく入力してください。')
    setError('')
    onSave({ cropName: status === 'empty' ? null : cropName.trim(), plantedAt: status === 'empty' ? null : plantedAt || null, status })
  }
  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidDateString(recordDate)) return setError('記録日を正しく入力してください。')
    if (recordStatus !== 'empty' && !cropName.trim()) return setError('生育記録を付ける前に作物名を入力してください。')
    setError('')
    onSave({
      cropName: cropName.trim() || project.cropName,
      plantedAt: plantedAt || recordDate,
      status: recordStatus,
    })
    onRecord({ projectId: project.id, plantId: plant.id, recordedAt: recordDate, status: recordStatus, note: note.trim() })
    setStatus(recordStatus)
    setCropName(cropName.trim() || project.cropName)
    setNote('')
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 print:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="plant-dialog-title" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-5 shadow-xl">
      <div className="mb-4 flex items-start justify-between"><div><h2 id="plant-dialog-title" className="text-lg font-bold">{name}</h2><p className="text-sm text-muted-foreground">{project.name} ・ 現在 {CROP_STATUS_LABELS[plant.status]}</p></div><Button type="button" variant="outline" onClick={onClose}>閉じる</Button></div>
      <form onSubmit={save} className="mb-5 grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">作物名<Input value={cropName} onChange={(event) => setCropName(event.target.value)} disabled={status === 'empty'} /></label>
        <label className="space-y-1 text-sm">植えた日<Input type="date" value={plantedAt} onChange={(event) => setPlantedAt(event.target.value)} disabled={status === 'empty'} /></label>
        <label className="space-y-1 text-sm">状態<select className="h-9 w-full rounded-lg border bg-background px-2" value={status} onChange={(event) => setStatus(event.target.value as CropStatus)}>{CROP_STATUSES.map((item) => <option key={item} value={item}>{CROP_STATUS_LABELS[item]}</option>)}</select></label>
        <div className="flex flex-wrap gap-2 sm:col-span-3"><Button type="submit">個体情報を保存</Button><Button type="button" variant="outline" onClick={() => { setStatus('empty'); setCropName(''); setPlantedAt(''); onSave({ status: 'empty', cropName: null, plantedAt: null }) }}>空きスロットに戻す</Button></div>
      </form>
      <form onSubmit={addRecord} className="mb-5 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <h3 className="font-semibold sm:col-span-2">生育記録を追加</h3>
        <label className="space-y-1 text-sm">記録日<Input type="date" required value={recordDate} onChange={(event) => setRecordDate(event.target.value)} /></label>
        <label className="space-y-1 text-sm">状態<select className="h-9 w-full rounded-lg border bg-background px-2" value={recordStatus} onChange={(event) => setRecordStatus(event.target.value as CropStatus)}>{CROP_STATUSES.filter((item) => item !== 'empty').map((item) => <option key={item} value={item}>{CROP_STATUS_LABELS[item]}</option>)}</select></label>
        <label className="space-y-1 text-sm sm:col-span-2">メモ<Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="作業や生育の様子" /></label>
        <Button type="submit" className="sm:col-span-2">記録を追加</Button>
      </form>
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
      <h3 className="mb-2 font-semibold">生育記録 ({records.length}件)</h3>
      {records.length ? <ul className="space-y-2">{records.map((record) => <li key={record.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted p-3"><div><p className="text-sm font-medium">{formatDate(record.recordedAt)} ・ {CROP_STATUS_LABELS[record.status]}</p>{record.note && <p className="text-sm text-muted-foreground">{record.note}</p>}</div><Button type="button" variant="ghost" size="sm" onClick={() => onDeleteRecord(record.id)}>削除</Button></li>)}</ul> : <p className="text-sm text-muted-foreground">記録はありません。</p>}
    </section>
  </div>
}

export function FieldsPage() {
  const farm = useFarm()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = name.trim()
    if (!value) return setError('畑の名前を入力してください。')
    if (farm.fieldMasters.some((field) => field.name.toLocaleLowerCase() === value.toLocaleLowerCase())) return setError('同じ名前の畑がすでにあります。')
    farm.addField(value)
    setName('')
    setError('')
  }
  return <>
    <PageTitle title="畑マスタ管理" description="畑は場所のマスタです。畝・列・個体数は各プロジェクトで設定します。" />
    <Card className="mb-6 max-w-xl"><CardContent className="pt-6"><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end print:hidden"><label className="flex-1 space-y-2 text-sm font-medium">畑の名前<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="例：東の畑" maxLength={40} /></label><Button type="submit"><Plus />畑を登録</Button></form>{error && <p role="alert" className="mt-2 text-sm text-destructive print:hidden">{error}</p>}</CardContent></Card>
    <div className="grid gap-3 md:grid-cols-2">{farm.fieldMasters.map((field) => {
      const projects = farm.projects.filter((project) => project.fieldIds.includes(field.id))
      const active = projects.filter((project) => project.endDate === null)
      return <Card key={field.id}><CardContent className="flex items-center justify-between gap-3 pt-5"><div><h2 className="font-semibold">{field.name}</h2><p className="text-sm text-muted-foreground">使用プロジェクト {projects.length}件 ・ 進行中 {active.length}件</p></div><Button className="print:hidden" type="button" variant="outline" disabled={active.length > 0} title={active.length ? '進行中のプロジェクトで使用中のため削除できません' : undefined} onClick={() => { if (window.confirm(`${field.name}を削除しますか？終了プロジェクトのこの畑の個体と記録も削除されます。`)) farm.deleteField(field.id) }}><Trash2 />削除</Button></CardContent></Card>
    })}</div>
    {!farm.fieldMasters.length && <EmptyNotice title="畑が登録されていません" />}
  </>
}

export function RecordsPage() {
  const farm = useFarm()
  const searchParams = useSearchParams()
  const endedProjects = farm.projects.filter((project) => project.endDate !== null).sort((a, b) => b.startDate.localeCompare(a.startDate))
  const selectedId = searchParams.get('project')
  const project = endedProjects.find((item) => item.id === selectedId)
  const plants = project ? farm.plants.filter((plant) => plant.projectId === project.id) : []
  const counts = countStatuses(plants)
  const configByField = project ? farm.projectFieldConfigs.filter((config) => config.projectId === project.id) : []
  const records = project ? farm.records.filter((record) => record.projectId === project.id).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)) : []
  const plantMap = new Map(plants.map((plant) => [plant.id, plant]))
  const fieldName = (id: string) => farm.fieldMasters.find((field) => field.id === id)?.name ?? '削除された畑'
  return <>
    {project ? <>
      <Link href="/records" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="size-4" />プロジェクト一覧に戻る</Link>
      <PageTitle title={project.name} description={`${project.year}年度 ・ ${project.cropName} ・ ${formatDate(project.startDate)} – ${formatDate(project.endDate)}`} />
        <section className="mb-6 rounded-xl border bg-card p-4"><div className="mb-3"><h2 className="text-lg font-bold">{project.name} — 最終結果</h2><p className="text-sm text-muted-foreground">{formatDate(project.startDate)} – {formatDate(project.endDate)}</p></div><div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['総個体数', plants.length], ['収穫済', counts.harvested], ['枯死', counts.withered], ['空きスロット', counts.empty]].map(([label, value]) => <div key={label} className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold tabular-nums">{value}</p></div>)}</div><h3 className="mb-2 text-sm font-semibold">畑ごとの最終状態</h3><div className="space-y-3">{configByField.map((config) => {
          const fieldPlants = plants.filter((plant) => plant.fieldId === config.fieldId)
          return <div key={config.fieldId}><div className="mb-1 flex justify-between text-sm"><span>{fieldName(config.fieldId)}</span><span className="text-muted-foreground">{usedOf(countStatuses(fieldPlants))}/{fieldPlants.length} 使用</span></div><StatusBar counts={countStatuses(fieldPlants)} /></div>
        })}</div></section>
        <section><h2 className="mb-3 text-lg font-bold">生育記録 ({records.length}件)</h2>{records.length ? <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-170 text-left text-sm"><thead className="border-b bg-muted/60"><tr>{['日付', '個体', '状態', 'メモ', ''].map((heading, index) => <th key={`${heading}-${index}`} className={cn('px-3 py-2 font-medium', index === 4 && 'print:hidden')}>{heading}</th>)}</tr></thead><tbody>{records.map((record) => {
          const plant = plantMap.get(record.plantId)
          return <tr key={record.id} className="border-b last:border-0"><td className="whitespace-nowrap px-3 py-2">{formatDate(record.recordedAt)}</td><td className="px-3 py-2">{plant ? plantDisplayName(fieldName(plant.fieldId), plant.ridgeNumber, plant.rowNumber, plant.plantNumber) : '—'}</td><td className="px-3 py-2"><StatusPill status={record.status} /></td><td className="px-3 py-2">{record.note || '—'}</td><td className="px-3 py-2 print:hidden"><Button type="button" variant="ghost" size="sm" onClick={() => { if (window.confirm('この記録を削除しますか？')) farm.deleteRecord(record.id) }}>削除</Button></td></tr>
        })}</tbody></table></div> : <EmptyNotice title="このプロジェクトの生育記録はありません" />}</section>
    </> : <>
      <PageTitle title="生育記録" description="終了したプロジェクトの一覧です。プロジェクトを選ぶと最終結果と生育履歴を確認できます。" />
      {endedProjects.length ? <div className="grid gap-4 md:grid-cols-2">{endedProjects.map((item) => {
        const summary = projectCounts(item, farm.plants)
        return <ProjectCard key={item.id} project={item} fieldCount={item.fieldIds.length} totalPlants={summary.total} usedPlants={summary.used} href={`/records?project=${item.id}`} />
      })}</div> : <EmptyNotice title="終了したプロジェクトはありません" description="プロジェクトを終了すると、ここで結果と記録を振り返れます。" />}
    </>}
  </>
}

function EmptyNotice({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center"><p className="font-medium">{title}</p>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}{action && <div className="mt-4">{action}</div>}</div>
}
