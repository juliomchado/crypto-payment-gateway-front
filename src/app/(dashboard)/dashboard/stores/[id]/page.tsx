'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function StoreDetailsPage() {
  const params = useParams()
  const storeId = params.id as string

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store Details</h1>
          <p className="text-muted-foreground">Manage your store settings</p>
        </div>
        <Link href={`/dashboard/stores/${storeId}/currencies`}>
          <Button>Configure Currencies</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store ID: {storeId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Store details page - Coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
