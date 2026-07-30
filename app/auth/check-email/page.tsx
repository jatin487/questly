'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>We&apos;ve sent you a magic link to sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to continue. The link will expire in 24 hours.
          </p>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">Didn&apos;t receive an email?</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Try signing in again to resend</li>
            </ul>
          </div>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
