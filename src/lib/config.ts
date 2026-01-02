export const CONFIG = {
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
} as const
