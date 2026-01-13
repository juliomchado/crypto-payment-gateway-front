'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useWalletViewModel } from '@/viewmodels/wallet.viewmodel'
import { useMerchant } from '@/contexts/merchant.context'
import { CHAIN_TYPE_NAMES } from '@/services/wallet.service'
import type { ChainType } from '@/models/types'

const createWalletSchema = z.object({
  chainType: z.enum(['EVM', 'SOLANA', 'BITCOIN']),
})

type CreateWalletFormData = z.infer<typeof createWalletSchema>

interface CreateWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWalletDialog({ open, onOpenChange }: CreateWalletDialogProps) {
  const { toast } = useToast()
  const { merchant } = useMerchant()
  const { createWallet } = useWalletViewModel()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      chainType: 'EVM',
    },
  })

  const onSubmit = async (data: CreateWalletFormData) => {
    if (!merchant) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Merchant information not available.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createWallet({
        chainType: data.chainType,
        merchantId: merchant.id,
      })
      toast({
        title: 'Wallet created',
        description: 'Your wallet has been created successfully.',
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create wallet. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Wallet</DialogTitle>
          <DialogDescription>
            Create a new cryptocurrency wallet for your store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chainType">Network Type *</Label>
            <Select
              value={watch('chainType')}
              onValueChange={(value) => setValue('chainType', value as ChainType)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EVM">{CHAIN_TYPE_NAMES.EVM}</SelectItem>
                <SelectItem value="SOLANA">{CHAIN_TYPE_NAMES.SOLANA}</SelectItem>
                <SelectItem value="BITCOIN">{CHAIN_TYPE_NAMES.BITCOIN}</SelectItem>
              </SelectContent>
            </Select>
            {errors.chainType && (
              <p className="text-sm text-destructive">{errors.chainType.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select the blockchain network for this wallet
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Wallet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
