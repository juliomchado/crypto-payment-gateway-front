'use client'

import Link from 'next/link'
import { Eye, MoreHorizontal, Trash2, UserCog } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'
import type { User, UserRole, UserStatus } from '@/models/types'

interface UserTableProps {
  users: User[]
  isLoading?: boolean
  onChangeRole?: (user: User) => void
  onDelete?: (user: User) => void
}

const roleColors: Record<UserRole, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
  USER: 'secondary',
  MERCHANT: 'default',
  ADMIN: 'destructive',
}

const statusColors: Record<UserStatus, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
  UNVERIFIED: 'secondary',
  EMAIL_VERIFIED: 'default',
  KYC_LEVEL_1: 'warning',
  KYC_LEVEL_2: 'success',
  KYC_LEVEL_3: 'success',
}

export function UserTable({ users, isLoading, onChangeRole, onDelete }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleColors[user.role]}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[user.status] || 'secondary'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/admin/users/${user.id}`}>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onChangeRole?.(user)}>
                      <UserCog className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete?.(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
