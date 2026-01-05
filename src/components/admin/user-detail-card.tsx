'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/utils'
import type { User, UserRole, UserStatus } from '@/models/types'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface UserDetailCardProps {
  user: User
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

export function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
        <CardDescription>Detailed information about this user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">First Name</p>
            <p className="text-sm">{user.firstName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Name</p>
            <p className="text-sm">{user.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <Badge variant={roleColors[user.role]}>{user.role}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge variant={statusColors[user.status] || 'secondary'}>{user.status}</Badge>
          </div>
          {user.country && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Country</p>
              <p className="text-sm">{user.country}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Language</p>
            <p className="text-sm">{user.language}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Verification Status</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user.emailVerifiedAt ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium">Email Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(user.emailVerifiedAt)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Not Verified</p>
                    <p className="text-xs text-muted-foreground">User has not verified their email</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user.kycCompletedAt ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium">KYC Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(user.kycCompletedAt)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">KYC Not Completed</p>
                    <p className="text-xs text-muted-foreground">
                      User has not completed KYC verification
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created At</p>
            <p className="text-sm">{formatDateTime(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p className="text-sm">{formatDateTime(user.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
