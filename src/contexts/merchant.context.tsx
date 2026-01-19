'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { merchantService } from '@/services/merchant.service'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'
import type { Merchant } from '@/models/types'

interface MerchantContextValue {
  merchant: Merchant | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const MerchantContext = createContext<MerchantContextValue>({
  merchant: null,
  isLoading: true,
  error: null,
  refetch: async () => { },
})

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthViewModel()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMerchant = async () => {
    // If user is not authenticated, clear merchant state
    if (!isAuthenticated || !user) {
      setMerchant(null)
      setIsLoading(false)
      return
    }

    if (user.merchant) {
      setMerchant(user.merchant)
      setIsLoading(false)
      return
    }

    if (user.merchantId) {
      try {
        setIsLoading(true)
        setError(null)
        const data = await merchantService.getMerchant(user.merchantId)
        setMerchant(data)
      } catch (err: any) {
        const error = err as { message?: string }
        setError(error.message || 'Failed to fetch merchant')
        setMerchant(null)
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (user.role === 'USER') {
      setMerchant(null)
      setIsLoading(false)
      return
    }

    if (user.role === 'MERCHANT') {
      setMerchant(null)
      setIsLoading(false)
      return
    }

    setMerchant(null)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!isAuthLoading) {
      fetchMerchant()
    }
  }, [isAuthLoading, isAuthenticated, user?.role])

  useEffect(() => {
    // Redirect to setup if user needs a merchant profile but doesn't have one
    // Both USER and MERCHANT roles without merchant should go to setup
    const isUserRole = user?.role === 'USER'
    const isMerchantRoleWithoutMerchant = user?.role === 'MERCHANT' && !merchant
    const needsSetup = isUserRole || isMerchantRoleWithoutMerchant

    if (!isLoading && !isAuthLoading && needsSetup && pathname !== '/setup' && pathname.startsWith('/dashboard')) {
      console.log('[MerchantContext] Redirecting to setup - merchant needed')
      router.push('/setup')
    }
  }, [isLoading, isAuthLoading, merchant, pathname, router, user?.role])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <MerchantContext.Provider value={{ merchant, isLoading, error, refetch: fetchMerchant }}>
      {children}
    </MerchantContext.Provider>
  )
}

export const useMerchant = () => useContext(MerchantContext)
