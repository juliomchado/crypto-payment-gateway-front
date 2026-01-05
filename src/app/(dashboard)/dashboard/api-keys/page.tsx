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

export default function ApiKeysPage() {
  const searchParams = useSearchParams()
  const storeIdParam = searchParams.get('store')
  const { toast } = useToast()
  const { apiKeys, isLoading, fetchAllApiKeys, createApiKey, revokeApiKey } =
    useApiKeyViewModel()
  const { stores, fetchStores } = useStoreViewModel()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [revokingKey, setRevokingKey] = useState<ApiKey | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAllApiKeys()
    fetchStores()
  }, [fetchAllApiKeys, fetchStores])

  const handleCreateKey = async (data: {
    storeId: string
    name: string
    type: ApiKeyType
  }) => {
    setIsSubmitting(true)
    const result = await createApiKey(data)
    setIsSubmitting(false)

    if (result) {
      toast({
        title: 'API Key created',
        description: 'Your new API key has been generated.',
      })
      return { secretKey: result.key }
    }
    return null
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

  const filteredKeys = storeIdParam
    ? apiKeys.filter((key) => key.storeId === storeIdParam)
    : apiKeys

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
    </div>
  )
}
