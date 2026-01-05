'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthViewModel()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user && user.role !== 'ADMIN') {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Only render if user is admin
  if (user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
