'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Invalid or missing verification token.')
        return
      }

      try {
        const response = await authService.verifyEmail({ token })
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')

        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error: unknown) {
        setStatus('error')
        const err = error as { message?: string }
        setMessage(err.message || 'Failed to verify email. The token may be invalid or expired.')
      }
    }

    verifyToken()
  }, [searchParams, router])

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying Email</CardTitle>
          <CardDescription>Please wait while we verify your email address...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">This should only take a moment</p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <CardTitle className="text-center">Email Verified!</CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Redirecting you to login page in 3 seconds...
          </p>
          <Link href="/login" className="block">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-center">Verification Failed</CardTitle>
        <CardDescription className="text-center">{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Please try registering again or contact support if the problem persists.
        </p>
        <div className="flex gap-2">
          <Link href="/register" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Register
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button className="w-full">Login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
