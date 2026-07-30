'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HomePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [teamsCount, setTeamsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadTeamCount() {
      try {
        const response = await fetch('/api/register')
        const data = await response.json()
        setTeamsCount(data.teams_count ?? 0)
      } catch {
        setTeamsCount(0)
      }
    }

    loadTeamCount()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setMessage(`Thanks ${data.profile?.display_name || name}! Your details are saved.`)
      setTeamsCount(data.teams_count ?? teamsCount ?? 0)
      setName('')
      setEmail('')
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Register'}
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
