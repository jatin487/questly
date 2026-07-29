'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  name: string
  points: number
  missions_completed: number
  rank: number
}

export default function LeaderboardPage() {
  const [individualLeaderboard, setIndividualLeaderboard] = useState<LeaderboardEntry[]>([])
  const [teamLeaderboard, setTeamLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('individual')
  const supabase = createClient()

  useEffect(() => {
    async function loadLeaderboards() {
      try {
        // Load individual leaderboard
        const { data: individualData, error: individualError } = await supabase
          .from('profiles')
          .select('id, display_name, total_points, total_missions_completed')
          .order('total_points', { ascending: false })
          .limit(100)

        if (individualError) throw individualError

        const individual = (individualData || []).map((entry, index) => ({
          id: entry.id,
          name: entry.display_name || 'Unknown',
          points: entry.total_points,
          missions_completed: entry.total_missions_completed,
          rank: index + 1,
        }))

        setIndividualLeaderboard(individual)

        // Load team leaderboard
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('id, name, total_points, members_count')
          .order('total_points', { ascending: false })
          .limit(100)

        if (teamError) throw teamError

        const teams = (teamData || []).map((entry, index) => ({
          id: entry.id,
          name: entry.name,
          points: entry.total_points,
          missions_completed: entry.members_count,
          rank: index + 1,
        }))

        setTeamLeaderboard(teams)
      } catch (error) {
        console.error('Error loading leaderboards:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboards()

    // Subscribe to real-time updates
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadLeaderboards()
        }
      )
      .subscribe()

    const teamsSubscription = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          loadLeaderboards()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesSubscription)
      supabase.removeChannel(teamsSubscription)
    }
  }, [supabase])

  const LeaderboardTable = ({ data }: { data: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {data.map((entry) => {
        let medalIcon = null
        if (entry.rank === 1) medalIcon = <Trophy className="h-5 w-5 text-yellow-500" />
        else if (entry.rank === 2) medalIcon = <Medal className="h-5 w-5 text-slate-400" />
        else if (entry.rank === 3) medalIcon = <Medal className="h-5 w-5 text-orange-600" />

        return (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-primary/10 bg-background/50 p-4 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold">
                {medalIcon ? medalIcon : <span>{entry.rank}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.missions_completed} mission{entry.missions_completed !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-lg">{entry.points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (loading) {
    return <div className="p-8">Loading leaderboards...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leaderboards</h1>
        <p className="mt-2 text-muted-foreground">See how you compare with others</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>Real-time leaderboard updates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="team">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-6">
              {individualLeaderboard.length > 0 ? (
                <LeaderboardTable data={individualLeaderboard} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leaderboard data yet. Start completing missions!
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              {teamLeaderboard.length > 0 ? (
                <LeaderboardTable data={teamLeaderboard} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No teams yet. Create or join a team to get started!
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
