import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
          const email = user.email || ''
          
          await supabase.from('profiles').insert([
            {
              id: user.id,
              display_name: displayName,
              email: email,
              username: displayName.toLowerCase().replace(/\s+/g, '_'),
            },
          ]).catch((err) => {
            console.log('[v0] Profile creation error (may already exist):', err.message)
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
