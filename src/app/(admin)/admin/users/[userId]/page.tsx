'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, UserCog, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserDetailCard } from '@/components/admin/user-detail-card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useUserViewModel } from '@/viewmodels/user.viewmodel'
import { useToast } from '@/hooks/use-toast'
import type { UserRole } from '@/models/types'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = params.userId as string
  const { selectedUser, isLoading, error, getUser, updateUserRole, deleteUser } = useUserViewModel()
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (userId) {
      getUser(userId)
    }
  }, [userId, getUser])

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
        description: error || 'Failed to update user role.',
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    const success = await deleteUser(selectedUser.id)
    setIsSubmitting(false)

    if (success) {
      toast({
        title: 'User deleted',
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been deleted.`,
      })
      router.push('/admin/users')
    } else {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error || 'Failed to delete user.',
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleBack = () => {
    router.push('/admin/users')
  }

  if (isLoading || !selectedUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {selectedUser.firstName} {selectedUser.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsRoleDialogOpen(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            Change Role
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
        </div>
      </div>

      <UserDetailCard user={selectedUser} />

      <UpdateRoleDialog
        user={selectedUser}
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        onSubmit={handleUpdateRole}
        isLoading={isSubmitting}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser.firstName} {selectedUser.lastName}?
              This action cannot be undone and will permanently remove all associated data.
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
