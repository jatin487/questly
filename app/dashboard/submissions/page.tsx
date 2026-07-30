'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface Submission {
  id: string
  mission_id: string
  mission_title: string
  status: string
  points_earned: number | null
  submitted_at: string
  reviewed_at: string | null
  rejected_reason: string | null
  photo_url: string | null
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
  },
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('mission_submissions')
          .select(
            `
            id,
            mission_id,
            status,
            points_earned,
            submitted_at,
            reviewed_at,
            rejected_reason,
            photo_url,
            missions(title)
          `
          )
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })

        if (error) throw error

        const formattedData = (data || []).map((sub: any) => ({
          id: sub.id,
          mission_id: sub.mission_id,
          mission_title: sub.missions?.title || 'Unknown Mission',
          status: sub.status,
          points_earned: sub.points_earned,
          submitted_at: sub.submitted_at,
          reviewed_at: sub.reviewed_at,
          rejected_reason: sub.rejected_reason,
          photo_url: sub.photo_url,
        }))

        setSubmissions(formattedData)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mission_submissions' },
        () => {
          loadSubmissions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading submissions...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Submissions</h1>
        <p className="mt-2 text-muted-foreground">Track the status of your mission submissions</p>
      </div>

      <div className="space-y-3">
        {submissions.map((submission) => {
          const StatusIcon = statusConfig[submission.status as keyof typeof statusConfig]?.icon || Clock
          const config = statusConfig[submission.status as keyof typeof statusConfig]

          return (
            <Card key={submission.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Left side - Mission info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      {submission.photo_url && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={submission.photo_url}
                            alt="Submission"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{submission.mission_title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                        {submission.rejected_reason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {submission.rejected_reason}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Status and points */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {submission.points_earned && (
                        <div>
                          <p className="text-lg font-bold text-primary">{submission.points_earned}</p>
                          <p className="text-xs text-muted-foreground">points earned</p>
                        </div>
                      )}
                    </div>
                    <Badge className={config.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {submissions.length === 0 && (
        <div className="rounded-lg border border-dashed border-primary/20 bg-background/50 p-12 text-center">
          <p className="text-muted-foreground">No submissions yet. Complete a mission to get started!</p>
        </div>
      )}
    </div>
  )
}
