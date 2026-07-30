import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { count, error } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ teams_count: 0, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ teams_count: count ?? 0 })
  } catch (error) {
    return NextResponse.json(
      { teams_count: 0, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = (body?.name ?? '').toString().trim()
    const email = (body?.email ?? '').toString().trim().toLowerCase()

    if (!name || !email) {
      return NextResponse.json({ error: 'Please enter both your name and email.' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const profileId = crypto.randomUUID()

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: profileId,
          username: `participant-${profileId.slice(0, 8)}`,
          display_name: name,
          bio: email,
          total_points: 0,
          total_missions_completed: 0,
        },
      ])
      .select('id, display_name, bio')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { count: teamsCount, error: teamsError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })

    if (teamsError) {
      return NextResponse.json({
        success: true,
        profile: data,
        teams_count: 0,
        message: 'Registration saved successfully.',
      })
    }

    return NextResponse.json({
      success: true,
      profile: data,
      teams_count: teamsCount ?? 0,
      message: 'Registration saved successfully.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    )
  }
}
