'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLocalProfile } from '@/lib/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'

interface Team {
  id: string
  name: string
  description: string
  total_points: number
  members_count: number
}

interface UserTeam {
  team: Team
  role: string
}

export default function TeamsPage() {
  const [localProfile, setLocalProfile] = useState<{ id: string; display_name: string; bio: string } | null>(null)
  const [userTeams, setUserTeams] = useState<UserTeam[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [joinTeamId, setJoinTeamId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  async function loadTeams() {
    try {
      const localProfile = getLocalProfile()
      setLocalProfile(localProfile)

      let userId: string | undefined = localProfile?.id
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        userId = user?.id || undefined
      }

      if (!userId) {
        setAllTeams([])
        setUserTeams([])
        return
      }

      // Load user's teams
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role, teams(*)')
        .eq('user_id', userId)

      if (memberError) throw memberError

      const userTeamsData = (memberData || []).map((m: any) => ({
        team: m.teams,
        role: m.role,
      }))

      setUserTeams(userTeamsData)

      // Load all teams
      const { data: allTeamsData, error: allTeamsError } = await supabase
        .from('teams')
        .select('*')
        .order('total_points', { ascending: false })

      if (allTeamsError) throw allTeamsError
      setAllTeams(allTeamsData || [])
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [supabase])

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!newTeamName.trim()) {
        alert('Team name is required')
        setSubmitting(false)
        return
      }

      const localProfile = getLocalProfile()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id || localProfile?.id

      if (!userId) {
        throw new Error('You must register before creating a team')
      }

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDesc,
          user_id: userId,
          display_name: localProfile?.display_name,
          bio: localProfile?.bio,
        }),
      })

      const responseText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }

      if (!response.ok) {
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to create team`
        console.error('[v0] Team creation error:', { status: response.status, error: errorData })
        throw new Error(errorMessage)
      }

      setNewTeamName('')
      setNewTeamDesc('')
      setCreateOpen(false)

      await loadTeams()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[v0] Error creating team:', errorMsg)
      alert(`Failed to create team: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoinTeam(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const localProfile = getLocalProfile()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id || localProfile?.id

      if (!userId) throw new Error('Not authenticated')

      const { error } = await supabase.from('team_members').insert({
        team_id: joinTeamId,
        user_id: userId,
        role: 'member',
      })

      if (error) throw error

      setJoinTeamId('')
      setJoinOpen(false)

      await loadTeams()
    } catch (error) {
      console.error('Error joining team:', error)
      alert('Failed to join team')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading teams...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          <p className="mt-2 text-muted-foreground">Create or join a team to compete together</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>Start your own team and invite others to join</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    placeholder="Cool Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Tell others about your team..."
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Team'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Join Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Team</DialogTitle>
                <DialogDescription>Select a team to join</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Team</label>
                  <select
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="">Choose a team...</option>
                    {allTeams
                      .filter((team) => !userTeams.some((ut) => ut.team.id === team.id))
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.members_count} members)
                        </option>
                      ))}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={submitting || !joinTeamId}>
                  {submitting ? 'Joining...' : 'Join Team'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* My Teams */}
      {userTeams.length > 0 && (
        <div>
          <h2 className="mb-4 font-semibold">My Teams</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userTeams.map(({ team, role }) => (
              <Card key={team.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription className="mt-1">{role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-sm text-muted-foreground flex-1">{team.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-semibold">{team.total_points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                    <div>
                      <p className="font-semibold">{team.members_count}</p>
                      <p className="text-xs text-muted-foreground">members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Teams */}
      {allTeams.length > 0 && (
        <div>
          <h2 className="mb-4 font-semibold">All Teams</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <CardTitle>{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-semibold">{team.total_points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                    <div>
                      <p className="font-semibold">{team.members_count}</p>
                      <p className="text-xs text-muted-foreground">members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {allTeams.length === 0 && (
        <div className="rounded-lg border border-dashed border-primary/20 bg-background/50 p-12 text-center">
          <p className="text-muted-foreground">No teams yet. Create the first one!</p>
        </div>
      )}
    </div>
  )
}
