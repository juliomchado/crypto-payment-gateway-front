import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-lg font-bold">CryptoGateway</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Accept Crypto Payments
            <br />
            <span className="text-primary">with Ease</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
            The modern payment gateway for cryptocurrency. Start accepting Bitcoin, Ethereum, and more with just a few clicks.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                Sign in to dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 sm:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold sm:text-xl">Fast Integration</h3>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Get started in minutes with our simple API and comprehensive documentation.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold sm:text-xl">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Enterprise-grade security with multi-signature wallets and cold storage.
                </p>
              </div>
              <div className="flex flex-col items-center text-center sm:col-span-2 md:col-span-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold sm:text-xl">Global Reach</h3>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Accept payments from anywhere in the world with multiple cryptocurrencies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-6">
        <div className="mx-auto w-full max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          Powered by <span className="font-semibold text-foreground">CryptoGateway</span>
        </div>
      </footer>
    </div>
  )
}
