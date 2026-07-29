import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          name,
          description,
          created_by: user.id,
        },
      ])
      .select()

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 400 })
    }

    // Add creator as admin member
    if (team && team[0]) {
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
        return NextResponse.json(
          { error: memberError.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(team)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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
