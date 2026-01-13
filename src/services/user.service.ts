import { api } from './api'
import type { User, UserRole, ApiResponse } from '@/models/types'

export interface ListUsersQuery {
  skip?: number
  take?: number
}

export interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  country?: string
  language?: string
}

export interface UpdateUserRoleData {
  role: UserRole
}

class UserService {
  async listUsers(query?: ListUsersQuery): Promise<User[]> {
    const params = new URLSearchParams()
    if (query?.skip !== undefined) params.set('skip', query.skip.toString())
    if (query?.take !== undefined) params.set('take', query.take.toString())

    const response = await api.get<ApiResponse<User[]>>(`/users?${params.toString()}`)
    return response.data
  }

  async getUser(userId: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${userId}`)
    return response.data
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${userId}`, data)
    return response.data
  }

  async updateUserRole(userId: string, data: UpdateUserRoleData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, data)
    return response.data
  }

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`)
  }
}

export const userService = new UserService()
