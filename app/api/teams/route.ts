import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('[v0] Teams API: No user authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      console.log('[v0] Teams API: Missing team name')
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    console.log('[v0] Teams API: Creating team for user', user.id, { name, description })

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || '',
          created_by: user.id,
        },
      ])
      .select()

    if (teamError) {
      console.error('[v0] Teams API: Team insert error:', { 
        code: teamError.code, 
        message: teamError.message,
        details: teamError.details 
      })
      return NextResponse.json({ error: `Team creation failed: ${teamError.message}` }, { status: 400 })
    }

    if (!team || !team[0]) {
      console.error('[v0] Teams API: No team data returned')
      return NextResponse.json({ error: 'Team creation returned no data' }, { status: 400 })
    }

    console.log('[v0] Teams API: Team created:', team[0].id)

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: team[0].id,
          user_id: user.id,
          role: 'admin',
        },
      ])

    if (memberError) {
      console.error('[v0] Teams API: Member insert error:', { 
        code: memberError.code, 
        message: memberError.message,
        details: memberError.details 
      })
      return NextResponse.json(
        { error: `Failed to add creator as member: ${memberError.message}` },
        { status: 400 }
      )
    }

    console.log('[v0] Teams API: Team creation successful')
    return NextResponse.json(team)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Teams API: Caught exception:', errorMessage)
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*, team_members(count)')
      .order('total_points', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
