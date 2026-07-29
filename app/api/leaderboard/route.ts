import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'individual'

    if (type === 'individual') {
      // Get individual leaderboard
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, total_points, total_missions_completed')
        .order('total_points', { ascending: false })
        .limit(100)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Add ranks
      const ranked = data.map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

      return NextResponse.json(ranked)
    } else if (type === 'team') {
      // Get team leaderboard
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, total_points, members_count')
        .order('total_points', { ascending: false })
        .limit(100)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Add ranks
      const ranked = data.map((team, index) => ({
        ...team,
        rank: index + 1,
      }))

      return NextResponse.json(ranked)
    }

    return NextResponse.json({
      error: 'Invalid leaderboard type',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
