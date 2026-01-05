'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  FileText,
  Wallet,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Webhook,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthViewModel } from '@/viewmodels/auth.viewmodel'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Stores',
    href: '/dashboard/stores',
    icon: <Store className="h-5 w-5" />,
  },
  {
    label: 'Invoices',
    href: '/dashboard/invoices',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Wallets',
    href: '/dashboard/wallets',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    label: 'Webhooks',
    href: '/dashboard/webhooks',
    icon: <Webhook className="h-5 w-5" />,
  },
  {
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: <Key className="h-5 w-5" />,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
  },
]

const adminNavItems: NavItem[] = [
  {
    label: 'Admin Panel',
    href: '/admin/users',
    icon: <Shield className="h-5 w-5" />,
  },
]

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthViewModel()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-semibold">CryptoGateway</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          // Lógica de active melhorada:
          // - Se for /dashboard, só ativa na rota exata
          // - Para outras rotas, ativa se pathname começa com o href
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground">ADMIN</p>
              </div>
            )}
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-destructive text-destructive-foreground'
                      : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="border-t p-2">
        <div
          className={cn(
            'relative flex items-center gap-3 rounded-lg border bg-card p-3 transition-all',
            'hover:shadow-sm',
            isCollapsed && 'justify-center'
          )}
        >
          {/* Merchant Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
            <span className="text-sm font-semibold text-primary">M</span>
          </div>

          {/* Merchant Info - Only shown when expanded */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">Mock Merchant</p>
              <p className="truncate text-xs text-muted-foreground">Development Mode</p>
            </div>
          )}

          {/* Logout Button - Positioned in corner when expanded, overlay when collapsed */}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center justify-center rounded-md transition-all',
              isCollapsed
                ? 'absolute inset-0 bg-background/0 hover:bg-destructive/10'
                : 'h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
            )}
            title="Log out"
          >
            <LogOut className={cn('h-4 w-4', isCollapsed && 'opacity-0 hover:opacity-100')} />
          </button>
        </div>
      </div>
    </aside>
  )
}
