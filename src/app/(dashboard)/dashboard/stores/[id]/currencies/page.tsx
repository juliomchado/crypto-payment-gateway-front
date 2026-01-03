'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StoreCurrenciesPage() {
  const params = useParams()
  const storeId = params.id as string

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Currency Configuration</h1>
        <p className="text-muted-foreground">Configure accepted cryptocurrencies for this store</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store ID: {storeId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Currency configuration page - Coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
