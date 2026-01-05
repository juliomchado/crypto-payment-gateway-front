import { create } from 'zustand'
import {
  userService,
  type ListUsersQuery,
  type UpdateUserData,
  type UpdateUserRoleData,
} from '@/services/user.service'
import type { User } from '@/models/types'

interface UserState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
}

interface UserActions {
  fetchUsers: (query?: ListUsersQuery) => Promise<void>
  getUser: (userId: string) => Promise<void>
  updateUser: (userId: string, data: UpdateUserData) => Promise<boolean>
  updateUserRole: (userId: string, data: UpdateUserRoleData) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  clearError: () => void
}

type UserViewModel = UserState & UserActions

export const useUserViewModel = create<UserViewModel>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async (query?: ListUsersQuery): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const users = await userService.listUsers(query)
      set({ users, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch users', isLoading: false })
    }
  },

  getUser: async (userId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const selectedUser = await userService.getUser(userId)
      set({ selectedUser, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch user', isLoading: false })
    }
  },

  updateUser: async (userId: string, data: UpdateUserData): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const updatedUser = await userService.updateUser(userId, data)
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? updatedUser : user)),
        selectedUser: state.selectedUser?.id === userId ? updatedUser : state.selectedUser,
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to update user', isLoading: false })
      return false
    }
  },

  updateUserRole: async (userId: string, data: UpdateUserRoleData): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      const updatedUser = await userService.updateUserRole(userId, data)
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? updatedUser : user)),
        selectedUser: state.selectedUser?.id === userId ? updatedUser : state.selectedUser,
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to update user role', isLoading: false })
      return false
    }
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    try {
      await userService.deleteUser(userId)
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        isLoading: false,
      }))
      return true
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to delete user', isLoading: false })
      return false
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
