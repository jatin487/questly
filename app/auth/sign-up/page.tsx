'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold">Join Campus Hunt</h1>
        <p className="text-muted-foreground">
          Sign up with just your name and email - quick and simple!
        </p>
        
        <button
          onClick={() => router.push('/auth/login')}
          className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Get Started
        </button>

        <p className="text-sm text-muted-foreground">
          Already joined?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
