import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function POST() {
  try {
    const supabase = getSupabaseClient()

    // Create a test user with confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'testteam@example.com',
      password: 'TestPass123!',
      email_confirm: true,
      user_metadata: {
        display_name: 'Test Team Creator',
      },
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    // Auto-create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: 'testteam',
        display_name: 'Test Team Creator',
      })
    }

    return Response.json({
      success: true,
      user: data.user,
      credentials: {
        email: 'testteam@example.com',
        password: 'TestPass123!',
      },
    })
  } catch (error) {
    console.error('Error creating test user:', error)
    return Response.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    )
  }
}
