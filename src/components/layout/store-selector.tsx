'use client'

import { useEffect } from 'react'
import { Store } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActiveStore, ALL_STORES_VALUE } from '@/contexts/active-store.context'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'
import { useToast } from '@/hooks/use-toast'

export function StoreSelector() {
  const { activeStoreId, setActiveStoreId } = useActiveStore()
  const { stores, fetchStores } = useStoreViewModel()
  const { user } = useAuthViewModel()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.role === 'MERCHANT') {
      fetchStores()
    }
  }, [user, fetchStores])

  // Auto-select "All Stores" if none selected
  useEffect(() => {
    if (!activeStoreId && stores && stores.length > 0) {
      setActiveStoreId(ALL_STORES_VALUE)
    }
  }, [activeStoreId, stores, setActiveStoreId])

  // Don't show for admin users or if no stores
  if (user?.role !== 'MERCHANT' || !stores || stores.length === 0) {
    return null
  }

  const handleStoreChange = (value: string) => {
    setActiveStoreId(value)

    if (value === ALL_STORES_VALUE) {
      toast({
        title: 'Viewing all stores',
        description: 'Dashboard now shows data from all your stores',
      })
    } else {
      const selectedStore = stores.find(s => s.id === value)
      if (selectedStore) {
        toast({
          title: `Switched to ${selectedStore.name}`,
          description: 'Dashboard now shows data for this store only',
        })
      }
    }
  }

  return (
    <Select value={activeStoreId || undefined} onValueChange={handleStoreChange}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          <SelectValue placeholder="Select store" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_STORES_VALUE}>All Stores</SelectItem>
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
