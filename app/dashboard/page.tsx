'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trophy, Target, Users, Plus } from 'lucide-react'

interface UserProfile {
  id: string
  display_name: string
  total_points: number
  total_missions_completed: number
}

interface Team {
  id: string
  name: string
  description: string
  total_points: number
  members_count: number
}

interface UserTeam {
  team_id: string
  team: Team
  role: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userTeams, setUserTeams] = useState<UserTeam[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)

        // Load user's teams
        const { data: memberData } = await supabase
          .from('team_members')
          .select('team_id, role, teams(*)')
          .eq('user_id', user.id)

        setUserTeams(
          (memberData || []).map((m: any) => ({
            team_id: m.team_id,
            team: m.teams,
            role: m.role,
          }))
        )

        // Load all teams
        const { data: allTeamsData } = await supabase
          .from('teams')
          .select('*')
          .order('total_points', { ascending: false })

        setAllTeams(allTeamsData || [])
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  async function handleJoinTeam(teamId: string) {
    setJoiningTeam(teamId)
    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to join team: ${error.error}`)
        return
      }

      // Reload teams
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: updatedTeams } = await supabase
          .from('team_members')
          .select('team_id, role, teams(*)')
          .eq('user_id', user.id)

        setUserTeams(
          (updatedTeams || []).map((m: any) => ({
            team_id: m.team_id,
            team: m.teams,
            role: m.role,
          }))
        )

        // Reload all teams
        const { data: allTeamsData } = await supabase
          .from('teams')
          .select('*')
          .order('total_points', { ascending: false })

        setAllTeams(allTeamsData || [])

        alert('Successfully joined the team!')
      }
    } catch (error) {
      console.error('Error joining team:', error)
      alert('An error occurred while joining the team')
    } finally {
      setJoiningTeam(null)
    }
  }

  const availableTeams = allTeams.filter(
    (team) => !userTeams.some((ut) => ut.team_id === team.id)
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.display_name}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ready to explore campus and earn points?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.total_points || 0}</div>
            <p className="text-sm text-muted-foreground">Keep going to climb the leaderboard</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-secondary" />
              Missions Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.total_missions_completed || 0}</div>
            <p className="text-sm text-muted-foreground">Explore more locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-accent" />
              My Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userTeams.length}</div>
            <p className="text-sm text-muted-foreground">Teams you are part of</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Teams Section */}
      {userTeams.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Teams</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userTeams.map((ut) => (
              <Card key={ut.team_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{ut.team.name}</CardTitle>
                      <CardDescription className="capitalize">{ut.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">{ut.team.total_points}</span> points
                  </div>
                  <div className="text-sm text-muted-foreground">{ut.team.members_count} members</div>
                  <p className="text-xs text-muted-foreground">{ut.team.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Teams Section */}
      {availableTeams.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Teams to Join</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>Join this team to compete</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">{team.total_points}</span> points
                    </div>
                    <div className="text-sm text-muted-foreground">{team.members_count} members</div>
                    <p className="text-xs text-muted-foreground">{team.description}</p>
                  </div>
                  <Button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={joiningTeam === team.id}
                    className="w-full"
                  >
                    {joiningTeam === team.id ? 'Joining...' : 'Join Team'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create New Team */}
      <div className="pt-4">
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create a New Team
            </CardTitle>
            <CardDescription>Start your own team and invite others</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/teams">
              <Button className="w-full">Create Team</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Missions</CardTitle>
            <CardDescription>Complete missions to earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/missions">
              <Button className="w-full">Browse Missions</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teams</CardTitle>
            <CardDescription>Join or create a team to compete</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/teams">
              <Button className="w-full">Manage Teams</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leaderboard</CardTitle>
            <CardDescription>See where you stand</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/leaderboard">
              <Button className="w-full">View Leaderboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Submissions</CardTitle>
            <CardDescription>Track your mission submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/submissions">
              <Button className="w-full">View Submissions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
