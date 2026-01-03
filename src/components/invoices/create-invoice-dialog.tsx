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
import { useInvoiceViewModel } from '@/viewmodels/invoice.viewmodel'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'

const createInvoiceSchema = z.object({
  storeId: z.string().min(1, 'Store is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.string().min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  currency: z.string().min(1, 'Currency is required'),
  customerEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
})

type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const { toast } = useToast()
  const { createInvoice } = useInvoiceViewModel()
  const { stores } = useStoreViewModel()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; paymentUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      currency: 'USD',
    },
  })

  const selectedStoreId = watch('storeId')

  const handleCopyLink = async () => {
    if (!createdInvoice) return

    const fullUrl = `${window.location.origin}/pay/${createdInvoice.id}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copied!',
        description: 'Payment link copied to clipboard.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy link.',
      })
    }
  }

  const handleClose = () => {
    setCreatedInvoice(null)
    setCopied(false)
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: CreateInvoiceFormData) => {
    setIsSubmitting(true)
    try {
      const invoice = await createInvoice({
        storeId: data.storeId,
        orderId: data.orderId,
        amount: Number(data.amount),
        currency: data.currency,
        customerEmail: data.customerEmail || undefined,
      })

      if (invoice) {
        setCreatedInvoice({
          id: invoice.id,
          paymentUrl: `/pay/${invoice.id}`,
        })
        toast({
          title: 'Invoice created',
          description: 'Your invoice has been created successfully.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {createdInvoice ? 'Invoice Created!' : 'Create Invoice'}
          </DialogTitle>
          <DialogDescription>
            {createdInvoice
              ? 'Your invoice has been created. Copy the payment link below.'
              : 'Create a new invoice for a customer payment.'}
          </DialogDescription>
        </DialogHeader>

        {createdInvoice ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-success bg-success/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
                  ✓
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Invoice created successfully</h3>
                  <p className="text-sm text-muted-foreground">
                    Share this link with your customer to receive payment
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/pay/${createdInvoice.id}`}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant={copied ? 'default' : 'outline'}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Invoice ID: {createdInvoice.id}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => window.open(`/pay/${createdInvoice.id}`, '_blank')}
              >
                Open Payment Page
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeId">Store *</Label>
            <Select
              value={selectedStoreId}
              onValueChange={(value) => setValue('storeId', value)}
              disabled={isSubmitting}
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
            <Label htmlFor="orderId">Order ID *</Label>
            <Input
              id="orderId"
              placeholder="ORDER-12345"
              {...register('orderId')}
              disabled={isSubmitting}
            />
            {errors.orderId && (
              <p className="text-sm text-destructive">{errors.orderId.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Unique identifier for this order
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="99.99"
                {...register('amount')}
                disabled={isSubmitting}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              {...register('customerEmail')}
              disabled={isSubmitting}
            />
            {errors.customerEmail && (
              <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional - Send payment link to customer
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invoice
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
