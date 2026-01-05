import { create } from 'zustand'
import { walletService, type CreateWalletData } from '@/services/wallet.service'
import type { Wallet, DerivedAddress } from '@/models/types'

interface WalletState {
  wallets: Wallet[]
  selectedWallet: Wallet | null
  isLoading: boolean
  error: string | null
}

interface WalletActions {
  fetchWallets: (merchantId?: string) => Promise<void>
  fetchWallet: (id: string) => Promise<void>
  createWallet: (data: CreateWalletData) => Promise<Wallet | null>
  deriveAddress: (walletId: string) => Promise<DerivedAddress | null>
  selectWallet: (wallet: Wallet | null) => void
  clearError: () => void
}

type WalletViewModel = WalletState & WalletActions

export const useWalletViewModel = create<WalletViewModel>((set, get) => ({
  wallets: [],
  selectedWallet: null,
  isLoading: false,
  error: null,

  fetchWallets: async (merchantId?: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const wallets = await walletService.getWallets(merchantId)
      set({ wallets, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch wallets', isLoading: false })
    }
  },

  fetchWallet: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const wallet = await walletService.getWallet(id)
      set({ selectedWallet: wallet, isLoading: false })
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to fetch wallet', isLoading: false })
    }
  },

  createWallet: async (data: CreateWalletData): Promise<Wallet | null> => {
    set({ isLoading: true, error: null })
    try {
      const wallet = await walletService.createWallet(data)
      set((state) => ({
        wallets: [...state.wallets, wallet],
        isLoading: false,
      }))
      return wallet
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to create wallet', isLoading: false })
      return null
    }
  },

  deriveAddress: async (walletId: string): Promise<DerivedAddress | null> => {
    set({ isLoading: true, error: null })
    try {
      const address = await walletService.deriveAddress(walletId)
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === walletId
            ? { ...w, nextAddressIndex: (w.nextAddressIndex || 0) + 1 }
            : w
        ),
        selectedWallet:
          state.selectedWallet?.id === walletId
            ? {
                ...state.selectedWallet,
                nextAddressIndex: (state.selectedWallet.nextAddressIndex || 0) + 1,
              }
            : state.selectedWallet,
        isLoading: false,
      }))
      return address
    } catch (err) {
      const error = err as { message?: string }
      set({ error: error.message || 'Failed to derive address', isLoading: false })
      return null
    }
  },

  selectWallet: (wallet: Wallet | null): void => {
    set({ selectedWallet: wallet })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
