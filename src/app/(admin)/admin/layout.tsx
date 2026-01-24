import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

async function verifyAdminAccess() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  // Call backend to get current user with role validation
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        'Cookie': `token=${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      redirect('/login')
    }

    const userData = await response.json()
    const user = userData.data || userData

    // Strict server-side admin check
    if (user.role !== 'ADMIN') {
      redirect('/dashboard')
    }

    return user
  } catch (error) {
    redirect('/login')
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin validation - runs before any client code
  await verifyAdminAccess()

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
