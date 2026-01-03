'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletCard } from '@/components/wallets/wallet-card'
import { CreateWalletDialog } from '@/components/wallets/create-wallet-dialog'
import { useWalletViewModel } from '@/viewmodels/wallet.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { copyToClipboard } from '@/lib/utils'

export default function WalletsPage() {
  const { wallets, isLoading, fetchWallets } = useWalletViewModel()
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  const handleCopy = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy to clipboard.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">
            View your cryptocurrency wallets and balances.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Wallet
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">No wallets yet</p>
          <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            Create your first wallet
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} onCopy={handleCopy} />
          ))}
        </div>
      )}

      <CreateWalletDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
