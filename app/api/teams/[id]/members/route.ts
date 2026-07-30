import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id } = body

    // Check if user is team admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (adminError || adminCheck?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can add members' },
        { status: 403 }
      )
    }

    // Add new member
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

    // Update team members count
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
