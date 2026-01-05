import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_USER } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { User, UserRole, UserStatus, ApiResponse } from '@/models/types'

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
  private mockUsers: User[] = []

  constructor() {
    // Initialize with some mock users
    if (CONFIG.USE_MOCK) {
      this.mockUsers = [
        MOCK_USER,
        {
          id: generateId(),
          email: 'merchant@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          country: 'US',
          language: 'en',
          role: 'MERCHANT',
          status: 'EMAIL_VERIFIED',
          emailVerifiedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          id: generateId(),
          email: 'user@example.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          country: 'CA',
          language: 'en',
          role: 'USER',
          status: 'UNVERIFIED',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ]
    }
  }

  async listUsers(query?: ListUsersQuery): Promise<User[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const skip = query?.skip || 0
      const take = query?.take || 20
      return this.mockUsers.slice(skip, skip + take)
    }

    const params = new URLSearchParams()
    if (query?.skip !== undefined) params.set('skip', query.skip.toString())
    if (query?.take !== undefined) params.set('take', query.take.toString())

    const response = await api.get<ApiResponse<User[]>>(`/users?${params.toString()}`)
    return response.data
  }

  async getUser(userId: string): Promise<User> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const user = this.mockUsers.find((u) => u.id === userId)
      if (!user) {
        throw { message: 'User not found', statusCode: 404 }
      }
      return user
    }

    const response = await api.get<ApiResponse<User>>(`/users/${userId}`)
    return response.data
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockUsers.findIndex((u) => u.id === userId)
      if (index === -1) {
        throw { message: 'User not found', statusCode: 404 }
      }

      this.mockUsers[index] = {
        ...this.mockUsers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return this.mockUsers[index]
    }

    const response = await api.patch<ApiResponse<User>>(`/users/${userId}`, data)
    return response.data
  }

  async updateUserRole(userId: string, data: UpdateUserRoleData): Promise<User> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockUsers.findIndex((u) => u.id === userId)
      if (index === -1) {
        throw { message: 'User not found', statusCode: 404 }
      }

      this.mockUsers[index] = {
        ...this.mockUsers[index],
        role: data.role,
        updatedAt: new Date().toISOString(),
      }
      return this.mockUsers[index]
    }

    const response = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, data)
    return response.data
  }

  async deleteUser(userId: string): Promise<void> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const index = this.mockUsers.findIndex((u) => u.id === userId)
      if (index === -1) {
        throw { message: 'User not found', statusCode: 404 }
      }
      this.mockUsers.splice(index, 1)
      return
    }

    await api.delete(`/users/${userId}`)
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const userService = new UserService()
