'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User, UserRole } from '@/models/types'

interface UpdateRoleDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userId: string, role: UserRole) => Promise<void>
  isLoading?: boolean
}

const roleDescriptions: Record<UserRole, string> = {
  USER: 'Regular user with basic access',
  MERCHANT: 'Merchant who can accept payments and manage stores',
  ADMIN: 'Platform administrator with full access',
}

export function UpdateRoleDialog({
  user,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: UpdateRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'USER')

  const handleSubmit = async () => {
    if (!user) return
    await onSubmit(user.id, selectedRole)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.firstName} {user.lastName} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="MERCHANT">Merchant</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {roleDescriptions[selectedRole]}
            </p>
          </div>

          {selectedRole === 'ADMIN' && (
            <div className="rounded-lg bg-warning/10 p-4 text-sm text-warning">
              <p className="font-medium">Warning!</p>
              <p className="mt-1 text-xs">
                Granting admin role gives this user full access to all platform features and
                data. Only assign this role to trusted individuals.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
