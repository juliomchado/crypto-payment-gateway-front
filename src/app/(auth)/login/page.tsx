import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

function LoginContent() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
