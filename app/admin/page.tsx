'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Plus, CheckCircle2, XCircle } from 'lucide-react'

interface PendingSubmission {
  id: string
  mission_id: string
  mission_title: string
  user_name: string
  submitted_at: string
  photo_url: string | null
}

export default function AdminPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPendingSubmissions() {
      try {
        const { data, error } = await supabase
          .from('mission_submissions')
          .select(
            `
            id,
            mission_id,
            submitted_at,
            photo_url,
            missions(title),
            profiles(display_name)
          `
          )
          .eq('status', 'pending')
          .order('submitted_at', { ascending: true })

        if (error) throw error

        const formatted = (data || []).map((sub: any) => ({
          id: sub.id,
          mission_id: sub.mission_id,
          mission_title: sub.missions?.title || 'Unknown',
          user_name: sub.profiles?.display_name || 'Unknown',
          submitted_at: sub.submitted_at,
          photo_url: sub.photo_url,
        }))

        setPendingSubmissions(formatted)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPendingSubmissions()
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage missions and review submissions</p>
          </div>
          <Link href="/admin/missions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Mission
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="submissions">
          <TabsList>
            <TabsTrigger value="submissions">Pending Submissions ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="missions">Manage Missions</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Submissions</CardTitle>
                <CardDescription>Approve or reject user submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex flex-col gap-4 rounded-lg border border-primary/10 bg-background/50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      {submission.photo_url && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={submission.photo_url}
                            alt="Submission"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{submission.mission_title}</p>
                        <p className="text-sm text-muted-foreground">{submission.user_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/submissions/${submission.id}/approve`}>
                          <Button size="sm" className="gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                        </Link>
                        <Link href={`/admin/submissions/${submission.id}/reject`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {pendingSubmissions.length === 0 && (
                  <div className="rounded-lg border border-dashed border-primary/20 bg-background/50 p-8 text-center">
                    <p className="text-muted-foreground">No pending submissions to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Missions</CardTitle>
                <CardDescription>Create and manage campus exploration missions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Mission management coming soon</p>
                  <Link href="/admin/missions/new">
                    <Button>Create Your First Mission</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
