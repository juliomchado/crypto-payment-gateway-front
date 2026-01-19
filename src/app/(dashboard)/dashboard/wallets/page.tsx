'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletCard } from '@/components/wallets/wallet-card'
import { CreateWalletDialog } from '@/components/wallets/create-wallet-dialog'
import { useWalletViewModel } from '@/viewmodels/wallet.viewmodel'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { copyToClipboard } from '@/lib/utils'

export default function WalletsPage() {
  const { wallets, isLoading, fetchWallets } = useWalletViewModel()
  const { user } = useAuthViewModel()
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    if (user.merchantId) {
      fetchWallets(user.merchantId)
    } else {
      fetchWallets()
    }
  }, [user?.id, user?.merchantId, fetchWallets])

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

  // Allow only ADMINs to create wallets manually
  // Merchants have wallets created automatically during setup
  const canCreateWallet = user?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">
            {canCreateWallet
              ? 'Manage cryptocurrency wallets and balances.'
              : 'View your master wallets. Child addresses are created automatically for each invoice.'}
          </p>
        </div>
        {canCreateWallet && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Wallet
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
        </div>
      ) : !wallets || wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">
            {canCreateWallet
              ? 'No wallets yet'
              : 'No master wallets found. Master wallets are created automatically when your merchant account is set up.'}
          </p>
          {canCreateWallet && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              Create your first wallet
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {canCreateWallet && (
        <CreateWalletDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}
    </div>
  )
}
