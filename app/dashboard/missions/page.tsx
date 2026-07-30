'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface Mission {
  id: string
  title: string
  description: string
  location_name: string
  points: number
  difficulty: string
  category: string
  image_url: string | null
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadMissions() {
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('is_active', true)
          .order('difficulty')

        if (error) throw error
        setMissions(data || [])
      } catch (error) {
        console.error('Error loading missions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMissions()
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading missions...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Available Missions</h1>
        <p className="mt-2 text-muted-foreground">
          Complete missions to earn points and progress on the leaderboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <Card
            key={mission.id}
            className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
          >
            {mission.image_url && (
              <div className="h-40 w-full overflow-hidden bg-muted">
                <img
                  src={mission.image_url}
                  alt={mission.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{mission.title}</CardTitle>
                  <CardDescription className="mt-1">{mission.location_name}</CardDescription>
                </div>
                <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/10 px-3 py-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-semibold">{mission.points}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="flex-1 text-sm text-muted-foreground line-clamp-3">
                {mission.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Badge className={difficultyColors[mission.difficulty as keyof typeof difficultyColors]}>
                  {mission.difficulty}
                </Badge>
                <Link href={`/dashboard/missions/${mission.id}`}>
                  <Button size="sm">Start Mission</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {missions.length === 0 && (
        <div className="rounded-lg border border-dashed border-primary/20 bg-background/50 p-12 text-center">
          <p className="text-muted-foreground">No missions available yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
