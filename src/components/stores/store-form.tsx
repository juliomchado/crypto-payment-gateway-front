'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Store } from '@/models/types'

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const storeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  isActive: z.boolean(),
  urlCallback: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  urlReturn: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  urlSuccess: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type StoreFormData = z.infer<typeof storeSchema>

interface StoreFormProps {
  store?: Store | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: StoreFormData) => Promise<void>
  isLoading?: boolean
}

export function StoreForm({
  store,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: StoreFormProps) {
  const isEdit = !!store

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name || '',
      slug: store?.slug || '',
      isActive: store ? store.status === 'ACTIVE' : true,
      urlCallback: store?.urlCallback || '',
      urlReturn: store?.urlReturn || '',
      urlSuccess: store?.urlSuccess || '',
    },
  })

  const isActive = watch('isActive')
  const name = watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !isEdit) {
      setValue('slug', generateSlug(name))
    }
  }, [name, isEdit, setValue])

  const handleFormSubmit = async (data: StoreFormData) => {
    await onSubmit(data)
    // Don't reset here - parent will close dialog on success
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Store' : 'Create Store'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your store information below.'
              : 'Add a new store to start accepting payments.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                placeholder="My E-commerce"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="my-e-commerce"
                {...register('slug')}
                disabled={isLoading || isEdit}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {isEdit ? 'Slug cannot be changed after creation' : 'Auto-generated from name, but you can customize it'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urlCallback">Callback URL</Label>
              <Input
                id="urlCallback"
                type="url"
                placeholder="https://yoursite.com/webhook"
                {...register('urlCallback')}
                disabled={isLoading}
              />
              {errors.urlCallback && (
                <p className="text-sm text-destructive">{errors.urlCallback.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Webhook URL to receive payment notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urlReturn">Return URL</Label>
              <Input
                id="urlReturn"
                type="url"
                placeholder="https://yoursite.com/checkout"
                {...register('urlReturn')}
                disabled={isLoading}
              />
              {errors.urlReturn && (
                <p className="text-sm text-destructive">{errors.urlReturn.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL to return customer after payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urlSuccess">Success URL</Label>
              <Input
                id="urlSuccess"
                type="url"
                placeholder="https://yoursite.com/success"
                {...register('urlSuccess')}
                disabled={isLoading}
              />
              {errors.urlSuccess && (
                <p className="text-sm text-destructive">{errors.urlSuccess.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL to redirect on successful payment
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this store to accept payments
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Store'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
