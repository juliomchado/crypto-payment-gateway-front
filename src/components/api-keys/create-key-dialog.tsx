'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Store } from '@/models/types'

const apiKeySchema = z.object({
  storeId: z.string().min(1, 'Please select a store'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
})

type ApiKeyFormData = z.infer<typeof apiKeySchema>

interface CreateKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ApiKeyFormData) => Promise<{ secretKey: string } | null>
  stores: Store[]
  isLoading?: boolean
}

const availablePermissions = [
  { value: 'invoices:create', label: 'Create Invoices' },
  { value: 'invoices:read', label: 'Read Invoices' },
  { value: 'stores:read', label: 'Read Stores' },
  { value: 'currencies:read', label: 'Read Currencies' },
]

export function CreateKeyDialog({
  open,
  onOpenChange,
  onSubmit,
  stores,
  isLoading,
}: CreateKeyDialogProps) {
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      permissions: ['invoices:create', 'invoices:read'],
    },
  })

  const selectedPermissions = watch('permissions') || []
  const selectedStoreId = watch('storeId')

  const handleFormSubmit = async (data: ApiKeyFormData) => {
    const result = await onSubmit(data)
    if (result) {
      setCreatedKey(result.secretKey)
    }
  }

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    reset()
    setCreatedKey(null)
    setCopied(false)
    onOpenChange(false)
  }

  const togglePermission = (permission: string) => {
    const current = selectedPermissions || []
    if (current.includes(permission)) {
      setValue(
        'permissions',
        current.filter((p) => p !== permission)
      )
    } else {
      setValue('permissions', [...current, permission])
    }
  }

  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Make sure to copy your API key now. You won&apos;t be able to see it again!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex gap-2">
                <Input value={createdKey} readOnly className="font-mono text-xs" />
                <Button onClick={handleCopy} variant={copied ? 'default' : 'outline'}>
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-warning/10 p-4 text-sm text-warning">
              <p className="font-medium">Important!</p>
              <p className="mt-1 text-xs">
                Store this key securely. It will not be shown again.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for accessing the API.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Store</Label>
              <Select
                value={selectedStoreId || ''}
                onValueChange={(value) => setValue('storeId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.storeId && (
                <p className="text-sm text-destructive">{errors.storeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="Production API Key"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.value}
                      checked={selectedPermissions.includes(permission.value)}
                      onCheckedChange={() => togglePermission(permission.value)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={permission.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-sm text-destructive">{errors.permissions.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
