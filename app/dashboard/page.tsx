'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trophy, Target, Users } from 'lucide-react'

interface UserProfile {
  id: string
  display_name: string
  total_points: number
  total_missions_completed: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {profile?.display_name ? `Welcome back, ${profile.display_name}!` : 'Welcome to your dashboard!'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {profile?.display_name
            ? 'Ready to explore campus and earn points?'
            : 'Explore missions, see the leaderboard, and manage your team from here.'}
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
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-sm text-muted-foreground">Join or create a team</p>
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
