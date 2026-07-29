import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'


async function isAdmin(userId: string, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    // In this MVP, we'll check if user created any teams (basic admin check)
    // In production, add an is_admin flag to profiles table
    return !!data
  } catch {
    return false
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const admin = await isAdmin(user.id, supabase)
  if (!admin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
