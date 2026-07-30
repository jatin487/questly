'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getLocalProfile, saveLocalProfile } from '@/lib/profile'

interface TeamOption {
  id: string
  name: string
  members_count?: number
}

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [teamId, setTeamId] = useState('')
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [teamsCount, setTeamsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const localProfile = getLocalProfile()
    if (localProfile) {
      router.push('/dashboard')
      return
    }

    async function loadTeams() {
      try {
        const response = await fetch('/api/register')
        const data = await response.json()
        setTeams(data.teams ?? [])
        setTeamsCount(data.teams_count ?? (data.teams?.length ?? 0))
      } catch {
        setTeams([])
        setTeamsCount(0)
      }
    }

    loadTeams()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, team_id: teamId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      saveLocalProfile(data.profile)
      router.push('/dashboard')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-border/70 bg-background/90 p-8 shadow-xl backdrop-blur">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">DBUU Campus Explorer</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Register in a simple way</h1>
          <p className="mt-3 text-muted-foreground">
            Add your name and email, and we will save your details for the event. You can also see how many teams have already registered.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/60 bg-background/70 p-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name</label>
              <Input
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Join a team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} {team.members_count ? `(${team.members_count} members)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading || teams.length === 0}>
              {loading ? 'Saving...' : 'Register and Join'}
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </form>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm font-semibold text-primary">Registered teams</p>
            <div className="mt-4 text-4xl font-bold text-foreground">
              {teamsCount ?? '—'}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This number updates as teams join the event.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
