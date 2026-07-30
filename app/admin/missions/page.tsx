'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Mission {
  id: string
  title: string
  description: string
  location_name: string
  points: number
  difficulty: string
  is_active: boolean
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMissions()
  }, [supabase])

  async function loadMissions() {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMissions(data || [])
    } catch (error) {
      console.error('Error loading missions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this mission?')) return

    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadMissions()
    } catch (error) {
      console.error('Error deleting mission:', error)
      alert('Failed to delete mission')
    }
  }

  async function handleToggleActive(id: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('missions')
        .update({ is_active: !currentState })
        .eq('id', id)

      if (error) throw error
      loadMissions()
    } catch (error) {
      console.error('Error updating mission:', error)
      alert('Failed to update mission')
    }
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Missions</h1>
          <p className="text-muted-foreground">View and edit all campus explorer missions</p>
        </div>
        <Link href="/admin/missions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Mission
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading missions...</div>
      ) : missions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No missions created yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {missions.map((mission) => (
            <Card key={mission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`${
                          difficultyColors[
                            mission.difficulty as keyof typeof difficultyColors
                          ]
                        }`}
                      >
                        {mission.difficulty}
                      </Badge>
                      <Badge variant={mission.is_active ? 'default' : 'secondary'}>
                        {mission.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      📍 {mission.location_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{mission.points} pts</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm">{mission.description}</p>
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/admin/missions/${mission.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleToggleActive(mission.id, mission.is_active)
                    }
                  >
                    {mission.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(mission.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
