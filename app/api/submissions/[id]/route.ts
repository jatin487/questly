import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, rejected_reason, points_earned } = body

    // Get submission to update user points
    const { data: submission, error: getError } = await supabase
      .from('mission_submissions')
      .select('*, missions(points)')
      .eq('id', params.id)
      .single()

    if (getError) {
      return NextResponse.json({ error: getError.message }, { status: 400 })
    }

    const pointsToAdd =
      status === 'approved' ? points_earned || submission.missions.points : 0

    // Update submission status
    const { data: updated, error: updateError } = await supabase
      .from('mission_submissions')
      .update({
        status,
        rejected_reason: status === 'rejected' ? rejected_reason : null,
        points_earned: pointsToAdd,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', params.id)
      .select()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Update user points if approved
    if (status === 'approved' && pointsToAdd > 0) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_points, total_missions_completed')
        .eq('id', submission.user_id)
        .single()

      if (!profileError && profile) {
        await supabase
          .from('profiles')
          .update({
            total_points: profile.total_points + pointsToAdd,
            total_missions_completed: profile.total_missions_completed + 1,
          })
          .eq('id', submission.user_id)
      }

      // Update team points if team_id exists
      if (submission.team_id) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('total_points')
          .eq('id', submission.team_id)
          .single()

        if (!teamError && teamData) {
          await supabase
            .from('teams')
            .update({
              total_points: teamData.total_points + pointsToAdd,
            })
            .eq('id', submission.team_id)
        }
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
