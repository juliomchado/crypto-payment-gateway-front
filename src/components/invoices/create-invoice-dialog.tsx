'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useInvoiceViewModel } from '@/viewmodels/invoice.viewmodel'
import { useStoreViewModel } from '@/viewmodels/store.viewmodel'
import { useActiveStore, ALL_STORES_VALUE } from '@/contexts/active-store.context'

const createInvoiceSchema = z.object({
  storeId: z.string().min(1, 'Store is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.string().min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  currency: z.string().min(1, 'Currency is required'),
  title: z.string().optional()
    .refine((val) => !val || (val.length >= 3 && val.length <= 150), 'Title must be between 3-150 characters'),
  description: z.string().optional()
    .refine((val) => !val || (val.length >= 3 && val.length <= 500), 'Description must be between 3-500 characters'),
  customerEmail: z.string().optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, 'Must be a valid email'),
  lifespan: z.string().min(1, 'Expiration time is required')
    .refine((val) => {
      const num = Number(val)
      return num >= 300 && num <= 43200
    }, 'Lifespan must be between 300 (5 min) and 43200 (12 hours) seconds'),
  isPaymentMultiple: z.boolean().optional(),
  accuracyPaymentPercent: z.string().optional(),
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
  const { activeStoreId, isAllStores } = useActiveStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; paymentUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

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
      storeId: '',
      currency: 'USD',
      lifespan: '3600', // 1 hour default
      isPaymentMultiple: false,
      accuracyPaymentPercent: '0',
    },
  })

  const selectedStoreId = watch('storeId')

  // Auto-populate store when activeStoreId changes or dialog opens (but not if "All Stores")
  useEffect(() => {
    if (activeStoreId && !isAllStores && open) {
      setValue('storeId', activeStoreId)
    }
  }, [activeStoreId, isAllStores, open, setValue])

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
    setCurrentStep(1)
    reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: CreateInvoiceFormData) => {
    setIsSubmitting(true)
    const selectedStore = stores?.find(s => s.id === data.storeId)
    if (!selectedStore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a valid store.',
      })
      setIsSubmitting(false)
      return
    }

    try {
      const invoice = await createInvoice({
        store: data.storeId,
        orderId: data.orderId,
        amount: data.amount.toString(),
        currency: data.currency,
        customerEmail: data.customerEmail,
        title: data.title || `Invoice for ${data.amount} ${data.currency}`,
        description: data.description || `Order ${data.orderId}`,
        fromReferralCode: null,
        urlCallback: selectedStore.urlCallback || undefined,
        urlSuccess: selectedStore.urlSuccess || undefined,
        urlReturn: selectedStore.urlReturn || undefined,
        lifespan: Number(data.lifespan),
        isPaymentMultiple: data.isPaymentMultiple,
        accuracyPaymentPercent: data.accuracyPaymentPercent !== undefined ? Number(data.accuracyPaymentPercent) : undefined,
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
    } catch (error: any) {
      console.error('[CreateInvoice] Error creating invoice:', error)
      console.error('[CreateInvoice] Payload sent:', {
        store: data.storeId,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        title: data.title,
        description: data.description,
        lifespan: data.lifespan,
        isPaymentMultiple: data.isPaymentMultiple,
        accuracyPaymentPercent: data.accuracyPaymentPercent,
      })
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to create invoice. Please try again.',
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
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 pb-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                1
              </div>
              <div className="h-0.5 w-12 bg-border" />
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                2
              </div>
            </div>

            {currentStep === 1 ? (
              // STEP 1: Basic Fields
              <>
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store *</Label>
                  <Select
                    value={selectedStoreId || ''}
                    onValueChange={(value) => setValue('storeId', value)}
                    disabled={isSubmitting || (!!activeStoreId && !isAllStores)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {(stores || []).map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.storeId && (
                    <p className="text-sm text-destructive">{errors.storeId.message}</p>
                  )}
                  {activeStoreId && !isAllStores ? (
                    <p className="text-xs text-muted-foreground">
                      Using currently selected store. Switch stores in the header to change.
                    </p>
                  ) : isAllStores ? (
                    <p className="text-xs text-muted-foreground">
                      Select a specific store to create an invoice.
                    </p>
                  ) : null}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lifespan">Expiration *</Label>
                    <Select
                      value={watch('lifespan')}
                      onValueChange={(value) => setValue('lifespan', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">5 min</SelectItem>
                        <SelectItem value="900">15 min</SelectItem>
                        <SelectItem value="1800">30 min</SelectItem>
                        <SelectItem value="3600">1 hour</SelectItem>
                        <SelectItem value="7200">2 hours</SelectItem>
                        <SelectItem value="14400">4 hours</SelectItem>
                        <SelectItem value="28800">8 hours</SelectItem>
                        <SelectItem value="43200">12 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.lifespan && (
                      <p className="text-sm text-destructive">{errors.lifespan.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting || !selectedStoreId}
                    className="w-full sm:w-auto"
                  >
                    Next: Optional Fields →
                  </Button>
                </div>
              </>
            ) : (
              // STEP 2: Optional & Advanced Fields
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Product or service name"
                      {...register('title')}
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Displayed on payment page (3-150 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Detailed description"
                      {...register('description')}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Additional details shown to customer (3-500 characters)
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border p-3">
                    <Checkbox
                      id="isPaymentMultiple"
                      checked={watch('isPaymentMultiple')}
                      onCheckedChange={(checked) => setValue('isPaymentMultiple', checked as boolean)}
                      disabled={isSubmitting}
                    />
                    <div className="flex-1 space-y-0.5">
                      <Label htmlFor="isPaymentMultiple" className="cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Allow Multiple Payments
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Customer can pay this invoice in multiple transactions
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accuracyPaymentPercent">Payment Accuracy Margin (%)</Label>
                    <Select
                      value={watch('accuracyPaymentPercent')}
                      onValueChange={(value) => setValue('accuracyPaymentPercent', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% - Exact amount</SelectItem>
                        <SelectItem value="1">±1%</SelectItem>
                        <SelectItem value="2">±2%</SelectItem>
                        <SelectItem value="3">±3%</SelectItem>
                        <SelectItem value="4">±4%</SelectItem>
                        <SelectItem value="5">±5%</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.accuracyPaymentPercent && (
                      <p className="text-sm text-destructive">{errors.accuracyPaymentPercent.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Allow payment variance for crypto price fluctuations
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    ← Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Invoice
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
