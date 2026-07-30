import { createClient as createServerClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    )

    // Get all users from auth.users with pagination
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 })
    }

    console.log(`[v0] Syncing profiles for ${users.length} users`)

    let created = 0
    let skipped = 0

    // For each user, ensure they have a profile
    for (const user of users) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          username: user.email || `user_${user.id.slice(0, 8)}`,
          display_name: user.user_metadata?.display_name || user.email || 'User',
        })

        if (!error) {
          created++
          console.log(`[v0] Created profile for ${user.email}`)
        } else {
          console.error(`[v0] Failed to create profile for ${user.email}:`, error.message)
        }
      } else {
        skipped++
      }
    }

    return NextResponse.json({
      message: 'Profile sync complete',
      total_users: users.length,
      profiles_created: created,
      profiles_skipped: skipped,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Profile sync error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
