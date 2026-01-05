'use client'

import { useEffect, useState } from 'react'
import { UserTable } from '@/components/admin/user-table'
import { UpdateRoleDialog } from '@/components/admin/update-role-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useUserViewModel } from '@/viewmodels/user.viewmodel'
import { useToast } from '@/hooks/use-toast'
import type { User, UserRole } from '@/models/types'

export default function AdminUsersPage() {
  const { toast } = useToast()
  const { users, isLoading, fetchUsers, updateUserRole, deleteUser } = useUserViewModel()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setIsRoleDialogOpen(true)
  }

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    setIsSubmitting(true)
    const success = await updateUserRole(userId, { role })
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'Role updated',
        description: 'User role has been successfully updated.',
      })
      setIsRoleDialogOpen(false)
    } else {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update user role.',
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    setIsSubmitting(true)
    const success = await deleteUser(deletingUser.id)
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'User deleted',
        description: `${deletingUser.firstName} ${deletingUser.lastName} has been deleted.`,
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete user.',
      })
    }
    setDeletingUser(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onChangeRole={handleChangeRole}
        onDelete={setDeletingUser}
      />

      <UpdateRoleDialog
        user={selectedUser}
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        onSubmit={handleUpdateRole}
        isLoading={isSubmitting}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.firstName}{' '}
              {deletingUser?.lastName}? This action cannot be undone and will permanently
              remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
