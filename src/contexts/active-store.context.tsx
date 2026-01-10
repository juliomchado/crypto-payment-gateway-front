'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export const ALL_STORES_VALUE = '__ALL_STORES__'

interface ActiveStoreContextType {
  activeStoreId: string | null
  setActiveStoreId: (storeId: string | null) => void
  isAllStores: boolean
}

const ActiveStoreContext = createContext<ActiveStoreContextType | undefined>(undefined)

const STORAGE_KEY = 'active-store-id'

export function ActiveStoreProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage on client, use ALL_STORES_VALUE on server
  // This prevents hydration mismatch
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return ALL_STORES_VALUE
    }
    return localStorage.getItem(STORAGE_KEY) || ALL_STORES_VALUE
  })

  // Save to localStorage when changed
  const setActiveStoreId = (storeId: string | null) => {
    const value = storeId || ALL_STORES_VALUE
    setActiveStoreIdState(value)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value)
    }
  }

  const isAllStores = activeStoreId === ALL_STORES_VALUE

  return (
    <ActiveStoreContext.Provider value={{ activeStoreId, setActiveStoreId, isAllStores }}>
      {children}
    </ActiveStoreContext.Provider>
  )
}

export function useActiveStore() {
  const context = useContext(ActiveStoreContext)
  if (context === undefined) {
    throw new Error('useActiveStore must be used within an ActiveStoreProvider')
  }
  return context
}
