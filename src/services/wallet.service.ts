import { CONFIG } from '@/lib/config'
import { api } from './api'
import { MOCK_WALLETS, MOCK_MERCHANT } from '@/models/mock-data'
import { generateId } from '@/lib/utils'
import type { Wallet, DerivedAddress, ApiResponse } from '@/models/types'

export interface CreateWalletData {
  merchantId: string
  network: string
}

class WalletService {
  private mockWallets = [...MOCK_WALLETS]

  async getWallets(merchantId?: string): Promise<Wallet[]> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      if (merchantId) {
        return this.mockWallets.filter((w) => w.merchantId === merchantId)
      }
      return this.mockWallets.filter((w) => w.merchantId === MOCK_MERCHANT.id)
    }
    const endpoint = merchantId ? `/wallets/merchant/${merchantId}` : '/wallets'
    const response = await api.get<ApiResponse<Wallet[]>>(endpoint)
    return response.data
  }

  async getWallet(id: string): Promise<Wallet> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const wallet = this.mockWallets.find((w) => w.id === id)
      if (!wallet) {
        throw { message: 'Wallet not found', statusCode: 404 }
      }
      return wallet
    }
    const response = await api.get<ApiResponse<Wallet>>(`/wallets/${id}`)
    return response.data
  }

  async createWallet(data: CreateWalletData): Promise<Wallet> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()

      const mockAddresses: Record<string, string> = {
        ethereum: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        bsc: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        solana: Array.from({ length: 44 }, () =>
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
            Math.floor(Math.random() * 58)
          ]
        ).join(''),
      }

      const newWallet: Wallet = {
        id: generateId(),
        merchantId: data.merchantId,
        network: data.network,
        address: mockAddresses[data.network] || mockAddresses.ethereum,
        balance: 0,
        derivedAddressCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockWallets.push(newWallet)
      return newWallet
    }
    const response = await api.post<ApiResponse<Wallet>>('/wallets', data)
    return response.data
  }

  async deriveAddress(walletId: string): Promise<DerivedAddress> {
    if (CONFIG.USE_MOCK) {
      await this.simulateDelay()
      const walletIndex = this.mockWallets.findIndex((w) => w.id === walletId)
      if (walletIndex === -1) {
        throw { message: 'Wallet not found', statusCode: 404 }
      }

      const wallet = this.mockWallets[walletIndex]
      const newAddress: DerivedAddress = {
        id: generateId(),
        walletId,
        address: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
        index: wallet.derivedAddressCount,
        isUsed: false,
        createdAt: new Date().toISOString(),
      }

      this.mockWallets[walletIndex] = {
        ...wallet,
        derivedAddressCount: wallet.derivedAddressCount + 1,
        updatedAt: new Date().toISOString(),
      }

      return newAddress
    }
    const response = await api.post<ApiResponse<DerivedAddress>>(`/wallets/${walletId}/derive`)
    return response.data
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const walletService = new WalletService()
