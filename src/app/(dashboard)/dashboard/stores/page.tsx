'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StoreCard } from '@/components/stores/store-card'
import { StoreForm } from '@/components/stores/store-form'
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
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { MOCK_MERCHANT } from '@/models/mock-data'
import type { Store } from '@/models/types'

// Default Exchange Rate Source ID for API compatibility
const DEFAULT_EXCHANGE_RATE_SOURCE_ID = '019b57ef-39ca-743a-a79c-c6f669ce291f'

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function StoresPage() {
  const { stores, isLoading, fetchStores, createStore, updateStore, deleteStore } =
    useStoreViewModel()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [deletingStore, setDeletingStore] = useState<Store | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleCreate = async (data: {
    name: string
    isActive: boolean
    urlCallback?: string
    urlReturn?: string
    urlSuccess?: string
  }) => {
    setIsSubmitting(true)
    const store = await createStore({
      name: data.name,
      slug: generateSlug(data.name),
      merchantId: MOCK_MERCHANT.id,
      exchangeRateSourceId: DEFAULT_EXCHANGE_RATE_SOURCE_ID,
      isActive: data.isActive,
      urlCallback: data.urlCallback,
      urlReturn: data.urlReturn,
      urlSuccess: data.urlSuccess,
    })
    setIsSubmitting(false)

    if (store) {
      toast({
        title: 'Store created',
        description: `${store.name} has been created successfully.`,
      })
      setIsFormOpen(false)
    }
  }

  const handleEdit = async (data: {
    name: string
    isActive: boolean
    urlCallback?: string
    urlReturn?: string
    urlSuccess?: string
  }) => {
    if (!editingStore) return

    setIsSubmitting(true)
    const success = await updateStore(editingStore.id, {
      name: data.name,
      isActive: data.isActive,
      urlCallback: data.urlCallback,
      urlReturn: data.urlReturn,
      urlSuccess: data.urlSuccess,
    })
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'Store updated',
        description: 'Your store has been updated successfully.',
      })
      setEditingStore(null)
      setIsFormOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingStore) return

    setIsSubmitting(true)
    const success = await deleteStore(deletingStore.id)
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'Store deleted',
        description: `${deletingStore.name} has been deleted.`,
      })
    }
    setDeletingStore(null)
  }

  const openEditForm = (store: Store) => {
    setEditingStore(store)
    setIsFormOpen(true)
  }

  const openCreateForm = () => {
    setEditingStore(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-muted-foreground">
            Manage your stores and their payment settings.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Store
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">No stores yet</p>
          <Button className="mt-4" onClick={openCreateForm}>
            Create your first store
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onEdit={openEditForm}
              onDelete={setDeletingStore}
            />
          ))}
        </div>
      )}

      <StoreForm
        store={editingStore}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={editingStore ? handleEdit : handleCreate}
        isLoading={isSubmitting}
      />

      <AlertDialog open={!!deletingStore} onOpenChange={() => setDeletingStore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingStore?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
