import { Toaster } from '@/components/ui/toaster'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground">C</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold">CryptoGateway</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accept crypto payments with ease
          </p>
        </div>
        {children}
      </div>
      <Toaster />
    </div>
  )
}
