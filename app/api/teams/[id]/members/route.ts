import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { user_id, display_name, email } = body

    let userId = user?.id || user_id
    const targetUserId = user_id || userId

    if (!targetUserId) {
      if (!display_name || !email) {
        return NextResponse.json(
          { error: 'Name and email are required for guest join' },
          { status: 400 }
        )
      }

      const normalizedEmail = email.toString().trim().toLowerCase()
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (existingProfileError) {
        return NextResponse.json({ error: existingProfileError.message }, { status: 400 })
      }

      if (existingProfile) {
        userId = existingProfile.id
      } else {
        const profileId = crypto.randomUUID()
        const { error: createProfileError } = await supabase.from('profiles').insert([
          {
            id: profileId,
            username: display_name.toLowerCase().replace(/\s+/g, '-'),
            display_name: display_name.toString().trim(),
            bio: normalizedEmail,
            email: normalizedEmail,
            total_points: 0,
            total_missions_completed: 0,
          },
        ])

        if (createProfileError) {
          return NextResponse.json(
            { error: `Failed to create profile for guest join: ${createProfileError.message}` },
            { status: 400 }
          )
        }

        userId = profileId
      }
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', params.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const requestingUserId = user?.id
    if (requestingUserId && user_id && requestingUserId !== user_id) {
      const { data: adminCheck, error: adminError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', params.id)
        .eq('user_id', requestingUserId)
        .single()

      if (adminError || adminCheck?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only admins can add members' },
          { status: 403 }
        )
      }
    }

    const { data: existingMember, error: existingError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', params.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 })
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 409 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    if (!profile) {
      const username = `participant-${userId.slice(0, 8)}`
      const displayName = user?.user_metadata?.full_name || 'Participant'
      const { error: createProfileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          username,
          display_name: displayName,
          bio: '',
        },
      ])

      if (createProfileError) {
        return NextResponse.json(
          { error: `Failed to create profile before joining team: ${createProfileError.message}` },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: params.id,
          user_id,
          role: 'member',
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: members, error: countError } = await supabase
      .from('team_members')
      .select('count', { count: 'exact' })
      .eq('team_id', params.id)

    if (!countError) {
      await supabase
        .from('teams')
        .update({ members_count: members.length })
        .eq('id', params.id)
    }

    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_members')
      .select('*, profiles(display_name, total_points)')
      .eq('team_id', params.id)
      .order('joined_at', { ascending: false })

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
