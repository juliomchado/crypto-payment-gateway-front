'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreHorizontal, Store, Edit, Trash2, Settings, Key } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import { useActiveStore } from '@/contexts/active-store.context'
import type { Store as StoreType } from '@/models/types'

interface StoreCardProps {
  store: StoreType
  onEdit?: (store: StoreType) => void
  onDelete?: (store: StoreType) => void
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  const router = useRouter()
  const { setActiveStoreId } = useActiveStore()

  const handleApiKeysClick = () => {
    setActiveStoreId(store.id)
    router.push(`/dashboard/api-keys?store=${store.id}`)
  }

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <Link href={`/dashboard/stores/${store.id}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{store.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {formatDate(store.createdAt)}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/stores/${store.id}`} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/stores/${store.id}/currencies`} className="cursor-pointer">
                    <Store className="mr-2 h-4 w-4" />
                    Currencies
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleApiKeysClick} className="cursor-pointer">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(store); }} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onDelete?.(store); }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Invoices:</span>{' '}
              <span className="font-medium">{store.invoiceCount}</span>
            </div>
          </div>
          <Badge variant={store.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {store.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
