'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export const ALL_STORES_VALUE = '__ALL_STORES__'

interface ActiveStoreContextType {
  activeStoreId: string | null
  setActiveStoreId: (storeId: string | null) => void
  isAllStores: boolean
}

const ActiveStoreContext = createContext<ActiveStoreContextType | undefined>(undefined)

const STORAGE_KEY = 'active-store-id'

export function ActiveStoreProvider({ children }: { children: ReactNode }) {
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setActiveStoreIdState(stored)
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage when changed
  const setActiveStoreId = (storeId: string | null) => {
    setActiveStoreIdState(storeId)
    if (storeId) {
      localStorage.setItem(STORAGE_KEY, storeId)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null
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
