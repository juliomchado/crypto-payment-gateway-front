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

    // 1. OPTION A (Best): Use merchant data from user object (no API call needed)
    if (user.merchant) {
      console.log('[MerchantContext] Using merchant data from user object')
      setMerchant(user.merchant)
      setIsLoading(false)
      return
    }

    // 2. OPTION B: If we have merchantId, fetch specific merchant (User allowed)
    if (user.merchantId) {
      console.log('[MerchantContext] Fetching specific merchant by ID:', user.merchantId)
      try {
        setIsLoading(true)
        setError(null)
        const data = await merchantService.getMerchant(user.merchantId)
        console.log('[MerchantContext] Merchant fetched by ID successfully')
        setMerchant(data)
      } catch (err: any) {
        console.log('[MerchantContext] Error fetching merchant by ID:', err)
        const error = err as { message?: string }
        setError(error.message || 'Failed to fetch merchant')
        setMerchant(null)
      } finally {
        setIsLoading(false)
      }
      return
    }

    // 3. OPTION C: Fallback - only use list endpoint if absolutely necessary
    // This is what causes 403 for non-admins, so we skip it for MERCHANTS
    if (user.role === 'MERCHANT') {
      console.log('[MerchantContext] Skipping list endpoint for MERCHANT role (requires ID)')
      setMerchant(null)
      setIsLoading(false)
      return
    }

    // Only continue to list fetch for ADMIN or other roles
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
