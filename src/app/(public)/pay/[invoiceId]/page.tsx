'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NetworkSelector } from '@/components/payment/network-selector'
import { CurrencySelector } from '@/components/payment/currency-selector'
import { PaymentDetails } from '@/components/payment/payment-details'
import { PaymentStatus } from '@/components/payment/payment-status'
import { usePaymentViewModel } from '@/viewmodels/payment.viewmodel'
import { formatCurrency } from '@/lib/utils'
import type { StoreCurrency } from '@/models/types'

export default function PaymentPage() {
  const params = useParams()
  const invoiceId = params.invoiceId as string
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)

  const {
    invoice,
    storeCurrencies,
    selectedCurrency,
    selectedRate,
    step,
    timeRemaining,
    isLoading,
    initializePayment,
    selectCurrency,
    generateAddress,
    updateTimeRemaining,
    setExpired,
    reset,
  } = usePaymentViewModel()

  useEffect(() => {
    if (invoiceId) {
      initializePayment(invoiceId)
    }
    return () => reset()
  }, [invoiceId, initializePayment, reset])

  useEffect(() => {
    if (step === 'awaiting_payment' && timeRemaining > 0) {
      const interval = setInterval(() => {
        updateTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, timeRemaining, updateTimeRemaining])

  const handleCurrencySelect = (currency: typeof selectedCurrency) => {
    if (!currency || !invoice) return
    selectCurrency(currency)
  }

  const handleContinue = async () => {
    if (!selectedCurrency || !invoice) return
    await generateAddress({
      token: selectedCurrency.currency.symbol,
      network: selectedCurrency.currency.network,
    })
  }

  const handleBackToSelection = () => {
    setSelectedNetwork(null)
    reset()
    initializePayment(invoiceId)
  }

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network)
  }

  // Get available networks from currencies
  const availableNetworks = Array.from(
    new Set(storeCurrencies.map((sc) => sc.currency.network))
  )

  // Filter currencies by selected network
  const filteredCurrencies = selectedNetwork
    ? storeCurrencies.filter((sc) => sc.currency.network === selectedNetwork)
    : []

  if (step === 'loading' || isLoading) {
    return (
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  if (step === 'error' || !invoice) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-12 text-center">
          <p className="text-muted-foreground">Invoice not found or invalid</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
        </div>
        <h1 className="text-xl font-bold">{invoice.store?.name || 'Store'}</h1>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Order #{invoice.orderId}</p>
            <p className="text-3xl font-bold">
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'select_currency' && (
            <>
              <div className="text-center">
                <h2 className="text-lg font-semibold">Select Payment Method</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose network and currency to complete your payment
                </p>
              </div>
              <div className="space-y-4">
                <NetworkSelector
                  selectedNetwork={selectedNetwork}
                  availableNetworks={availableNetworks}
                  onSelect={handleNetworkSelect}
                />
                {selectedNetwork && (
                  <CurrencySelector
                    currencies={filteredCurrencies}
                    selectedCurrency={selectedCurrency}
                    onSelect={handleCurrencySelect}
                  />
                )}
                {selectedNetwork && selectedCurrency && (
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={handleContinue}
                      className="w-full"
                      size="lg"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 'awaiting_payment' && invoice.paymentAddress && (
            <PaymentDetails
              amount={selectedRate?.payerAmount || invoice.cryptoAmount?.toString() || invoice.amount.toString()}
              currency={invoice.cryptoCurrency || invoice.currency}
              address={invoice.paymentAddress}
              network={invoice.network || 'ethereum'}
              timeRemaining={timeRemaining}
              exchangeRate={selectedRate?.rate}
              onBack={handleBackToSelection}
            />
          )}

          {step === 'confirming' && (
            <PaymentStatus
              status="confirming"
              amount={invoice.amount}
              currency={invoice.currency}
            />
          )}

          {step === 'success' && (
            <PaymentStatus
              status="success"
              amount={invoice.amount}
              currency={invoice.currency}
              txHash="0x123456789abcdef"
            />
          )}

          {step === 'expired' && (
            <PaymentStatus
              status="expired"
              onRetry={handleBackToSelection}
            />
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold">CryptoGateway</span>
        </p>
      </div>
    </div>
  )
}
