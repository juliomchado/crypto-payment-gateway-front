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

const createWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  chainType: z.enum(['EVM', 'BITCOIN', 'SOLANA']),
  type: z.enum(['HOT', 'COLD', 'SETTLEMENT']),
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
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      type: 'HOT',
      chainType: 'EVM',
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Wallet</DialogTitle>
          <DialogDescription>
            Create a new cryptocurrency wallet for your store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name *</Label>
            <Input
              id="name"
              placeholder="Main Wallet"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chainType">Chain Type *</Label>
            <Select
              value={watch('chainType')}
              onValueChange={(value) => setValue('chainType', value as 'EVM' | 'BITCOIN' | 'SOLANA')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EVM">EVM (Ethereum, BSC, Polygon)</SelectItem>
                <SelectItem value="BITCOIN">Bitcoin</SelectItem>
                <SelectItem value="SOLANA">Solana</SelectItem>
              </SelectContent>
            </Select>
            {errors.chainType && (
              <p className="text-sm text-destructive">{errors.chainType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Wallet Type *</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as 'HOT' | 'COLD' | 'SETTLEMENT')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOT">Hot Wallet</SelectItem>
                <SelectItem value="COLD">Cold Wallet</SelectItem>
                <SelectItem value="SETTLEMENT">Settlement Wallet</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Hot wallets are used for daily operations
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
