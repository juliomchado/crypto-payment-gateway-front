'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useMerchantViewModel } from '@/viewmodels/merchant.viewmodel'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'
import { useToast } from '@/hooks/use-toast'
import { useMerchant } from '@/contexts/merchant.context'

const setupSchema = z.object({
  merchantName: z.string().min(2, 'Merchant name must be at least 2 characters').max(100, 'Merchant name must be at most 100 characters'),
  businessType: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
})

type SetupFormData = z.infer<typeof setupSchema>

export default function SetupPage() {
  const router = useRouter()
  const { createMerchant, error: merchantError } = useMerchantViewModel()
  const { checkAuth } = useAuthViewModel()
  const { merchant, refetch } = useMerchant()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if merchant already exists
  useEffect(() => {
    if (merchant) {
      toast({
        title: 'Merchant account found',
        description: 'Redirecting to your dashboard...',
      })
      router.push('/dashboard')
    }
  }, [merchant, router, toast])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  })

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true)
    try {
      const merchantResult = await createMerchant(data)
      if (merchantResult) {
        toast({
          title: 'Welcome!',
          description: 'Your merchant account has been created successfully.',
        })

        // Force refresh auth to update user role to MERCHANT in global state
        await checkAuth(true)
        await refetch()

        router.push('/dashboard')
      } else {
        // Check if the error is a 409 (merchant already exists)
        const is409Error = merchantError?.includes('409') ||
          merchantError?.toLowerCase().includes('already exists') ||
          merchantError?.toLowerCase().includes('conflict')

        if (is409Error) {
          console.log('[Setup] Merchant already exists (409), redirecting to dashboard')
          toast({
            title: 'Merchant account found',
            description: 'Redirecting to your dashboard...',
          })

          // Force refresh to get the existing merchant
          await checkAuth(true)
          await refetch()

          router.push('/dashboard')
        } else {
          toast({
            variant: 'destructive',
            title: 'Setup failed',
            description: merchantError || 'Failed to create merchant account. Please try again.',
          })
        }
      }
    } catch (err: any) {
      // Also check for 409 in catch block
      const is409Error = err?.statusCode === 409 ||
        err?.status === 409 ||
        err?.message?.includes('409') ||
        err?.message?.toLowerCase().includes('conflict')

      if (is409Error) {
        console.log('[Setup] Merchant already exists (409 in catch), redirecting to dashboard')
        toast({
          title: 'Merchant account found',
          description: 'Redirecting to your dashboard...',
        })

        await checkAuth(true)
        await refetch()
        router.push('/dashboard')
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to MangoPay</CardTitle>
          <CardDescription>
            Set up your merchant account to start accepting crypto payments
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchantName">Business Name *</Label>
              <Input
                id="merchantName"
                placeholder="My Business"
                {...register('merchantName')}
                disabled={isSubmitting}
              />
              {errors.merchantName && (
                <p className="text-sm text-destructive">{errors.merchantName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                placeholder="E-commerce, SaaS, etc."
                {...register('businessType')}
                disabled={isSubmitting}
              />
              {errors.businessType && (
                <p className="text-sm text-destructive">{errors.businessType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                placeholder="Company registration number"
                {...register('registrationNumber')}
                disabled={isSubmitting}
              />
              {errors.registrationNumber && (
                <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                placeholder="Tax identification number"
                {...register('taxId')}
                disabled={isSubmitting}
              />
              {errors.taxId && (
                <p className="text-sm text-destructive">{errors.taxId.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Merchant Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
