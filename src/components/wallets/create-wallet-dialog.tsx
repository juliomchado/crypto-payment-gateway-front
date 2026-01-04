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
import { MOCK_MERCHANT } from '@/models/mock-data'
import { NETWORK_STANDARD_NAMES, type NetworkStandard } from '@/services/wallet.service'

const createWalletSchema = z.object({
  chainType: z.enum(['ERC_20', 'SPL', 'BITCOIN']),
})

type CreateWalletFormData = z.infer<typeof createWalletSchema>

interface CreateWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWalletDialog({ open, onOpenChange }: CreateWalletDialogProps) {
  const { toast } = useToast()
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
      chainType: 'ERC_20',
    },
  })

  const onSubmit = async (data: CreateWalletFormData) => {
    setIsSubmitting(true)
    try {
      await createWallet({
        chainType: data.chainType,
        merchantId: MOCK_MERCHANT.id,
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
      <DialogContent className="mx-4 sm:max-w-[450px]">
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
              onValueChange={(value) => setValue('chainType', value as NetworkStandard)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ERC_20">{NETWORK_STANDARD_NAMES.ERC_20}</SelectItem>
                <SelectItem value="SPL">{NETWORK_STANDARD_NAMES.SPL}</SelectItem>
                <SelectItem value="BITCOIN">{NETWORK_STANDARD_NAMES.BITCOIN}</SelectItem>
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
