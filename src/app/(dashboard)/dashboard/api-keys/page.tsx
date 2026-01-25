'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiKeyTable } from '@/components/api-keys/api-key-table'
import { CreateKeyDialog } from '@/components/api-keys/create-key-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useApiKeyViewModel } from '@/viewmodels/api-key.viewmodel'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { copyToClipboard } from '@/lib/utils'
import type { ApiKey, ApiKeyType } from '@/models/types'
import { useActiveStore } from '@/contexts/active-store.context'

export default function ApiKeysPage() {
  const searchParams = useSearchParams()
  const storeIdParam = searchParams.get('store')
  const { activeStoreId, isAllStores } = useActiveStore()
  const { toast } = useToast()
  const { apiKeys, isLoading, newlyCreatedKey, fetchApiKeys, fetchAllApiKeys, createApiKey, revokeApiKey, rotateApiKey, clearNewlyCreatedKey } =
    useApiKeyViewModel()
  const { stores, fetchStores } = useStoreViewModel()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [revokingKey, setRevokingKey] = useState<ApiKey | null>(null)
  const [rotatingKey, setRotatingKey] = useState<ApiKey | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (activeStoreId && !isAllStores) {
      fetchApiKeys(activeStoreId)
    }
    // Always ensure stores are loaded to validate activeStoreId
    fetchStores()
  }, [activeStoreId, isAllStores, fetchApiKeys, fetchStores])

  const handleCreateKey = async (data: {
    storeId: string
    name: string
    type: ApiKeyType
  }) => {
    setIsSubmitting(true)
    const result = await createApiKey(data)
    setIsSubmitting(false)

    if (result.success && result.data) {
      toast({
        title: 'API Key created',
        description: 'Your new API key has been generated.',
      })
      return { secretKey: result.data.key }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error creating key',
        description: result.error || 'Failed to create API key',
      })
      return null
    }
  }

  const handleRevokeKey = async () => {
    if (!revokingKey) return

    setIsSubmitting(true)
    const success = await revokeApiKey(revokingKey.storeId, revokingKey.id)
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'API Key revoked',
        description: `${revokingKey.name} has been revoked.`,
      })
    }
    setRevokingKey(null)
  }

  const handleRotateKey = async () => {
    if (!rotatingKey) return

    setIsSubmitting(true)
    const result = await rotateApiKey(rotatingKey.storeId, rotatingKey.id)
    setIsSubmitting(false)
    setRotatingKey(null)

    if (result) {
      toast({
        title: 'API Key rotated',
        description: 'Your new API key has been generated. Copy it now!',
      })
      // The CreateKeyDialog will automatically show the new key via newlyCreatedKey
      setIsCreateDialogOpen(true)
    }
  }

  const handleCopy = async (key: string) => {
    try {
      await copyToClipboard(key)
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy to clipboard.',
      })
    }
  }

  // Filter keys: prioritize URL param, then activeStoreId (unless "All Stores"), then show all
  const filterStoreId = storeIdParam || (!isAllStores ? activeStoreId : null)
  const filteredKeys = filterStoreId
    ? apiKeys.filter((key) => key.storeId === filterStoreId)
    : apiKeys

  // Show message when "All Stores" is selected
  if (isAllStores) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for accessing the payment gateway API.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
          <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
            Select a Store
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            API keys are store-specific. Please select a store from the dropdown to view and manage its API keys.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for accessing the payment gateway API.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <ApiKeyTable
        apiKeys={filteredKeys}
        isLoading={isLoading}
        onRevoke={setRevokingKey}
        onRotate={setRotatingKey}
        onCopy={handleCopy}
      />

      <CreateKeyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateKey}
        stores={stores}
        isLoading={isSubmitting}
      />

      <AlertDialog open={!!revokingKey} onOpenChange={() => setRevokingKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke &quot;{revokingKey?.name}&quot;? This
              action cannot be undone and any applications using this key will stop
              working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeKey}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!rotatingKey} onOpenChange={() => setRotatingKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rotate &quot;{rotatingKey?.name}&quot;? This will
              generate a new key and revoke the old one. Applications using the old key
              will stop working until updated with the new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRotateKey}
              disabled={isSubmitting}
            >
              Rotate Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
