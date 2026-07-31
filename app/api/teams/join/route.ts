import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('[v0] Join Team API: No user authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { team_id } = body

    if (!team_id) {
      console.log('[v0] Join Team API: Missing team_id')
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    console.log('[v0] Join Team API: User', user.id, 'joining team', team_id)

    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', team_id)
      .single()

    if (teamError || !team) {
      console.error('[v0] Join Team API: Team not found')
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('team_id', team_id)
      .single()

    if (existingMember) {
      console.log('[v0] Join Team API: User already a member')
      return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 })
    }

    // Add user to team as member
    const { error: joinError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id,
          user_id: user.id,
          role: 'member',
        },
      ])

    if (joinError) {
      console.error('[v0] Join Team API: Error joining team:', joinError.message)
      return NextResponse.json({ error: `Failed to join team: ${joinError.message}` }, { status: 400 })
    }

    console.log('[v0] Join Team API: User successfully joined team:', team_id)
    return NextResponse.json({ 
      success: true,
      message: `Successfully joined ${team.name}`,
      team_id,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Join Team API: Caught exception:', errorMessage)
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
