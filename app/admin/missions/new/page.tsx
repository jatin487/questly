'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewMissionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [points, setPoints] = useState('10')
  const [difficulty, setDifficulty] = useState('medium')
  const [requiresPhoto, setRequiresPhoto] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('missions').insert({
        title,
        description,
        location_name: locationName,
        points: parseInt(points),
        difficulty,
        requires_photo: requiresPhoto,
        is_active: true,
      })

      if (insertError) throw insertError

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create mission')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create New Mission</CardTitle>
            <CardDescription>Add a new campus exploration mission</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Mission Title</label>
                <Input
                  placeholder="Find the Hidden Clock Tower"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what students need to do for this mission..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location Name</label>
                <Input
                  placeholder="Clock Tower, Main Campus"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points</label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={requiresPhoto}
                    onChange={(e) => setRequiresPhoto(e.target.checked)}
                    className="rounded border border-input"
                  />
                  <span className="text-sm font-medium">Requires Photo Proof</span>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating Mission...' : 'Create Mission'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
