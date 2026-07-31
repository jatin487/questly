'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!name.trim() || !email.trim()) {
        setError('Please enter both name and email')
        setLoading(false)
        return
      }

      // Send magic link - works for both existing and new users
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: name,
          },
        },
      })

      if (otpError) {
        console.error('[v0] Magic link error:', otpError)
        setError('Failed to send magic link. Please try again.')
        return
      }

      // Store name and email for profile creation after auth
      if (typeof window !== 'undefined') {
        localStorage.setItem('signup_name', name)
        localStorage.setItem('signup_email', email.toLowerCase())
      }

      router.push('/auth/check-email')
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome to Campus Hunt</CardTitle>
          <CardDescription>Enter your name and email to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Getting started...' : 'Continue'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            We&apos;ll send you a magic link to sign in
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
