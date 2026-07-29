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
    const { mission_id, submission_text, team_id } = body

    // Insert submission
    const { data, error } = await supabase
      .from('mission_submissions')
      .insert([
        {
          mission_id,
          user_id: user.id,
          team_id,
          submission_text,
          status: 'pending',
        },
      ])
      .select()

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('mission_submissions')
      .select('*, missions(title), profiles(display_name)')

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('submitted_at', {
      ascending: false,
    })

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
