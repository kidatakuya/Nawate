'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormDialog, PageHeader } from '../shared'
import { FieldForm } from './field-form'
import { FieldList } from './field-list'

export function FieldsPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="畑管理"
        description="畑を登録すると、畝・列・個体の位置スロットが自動で生成されます。"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" />
            畑を登録
          </Button>
        }
      />
      <FieldList />
      <FormDialog open={open} onOpenChange={setOpen} title="畑を登録" description="畑の構成を入力してください。">
        <FieldForm onDone={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}
