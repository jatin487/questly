'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Submission {
  id: string
  mission_id: string
  user_id: string
  photo_url: string | null
  submission_text: string | null
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  missions?: { title: string; points: number }
  profiles?: { display_name: string }
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadSubmissions()
  }, [filter, supabase])

  async function loadSubmissions() {
    try {
      setLoading(true)
      let query = supabase
        .from('mission_submissions')
        .select('*, missions(title, points), profiles(display_name)')

      if (filter === 'pending') {
        query = query.eq('status', 'pending')
      }

      const { data, error } = await query.order('submitted_at', {
        ascending: false,
      })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(submissionId: string, points: number) {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          points_earned: points,
        }),
      })

      if (!response.ok) throw new Error('Failed to approve')
      setReviewingId(null)
      loadSubmissions()
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission')
    }
  }

  async function handleReject(submissionId: string) {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejected_reason: rejectionReason,
        }),
      })

      if (!response.ok) throw new Error('Failed to reject')
      setReviewingId(null)
      setRejectionReason('')
      loadSubmissions()
    } catch (error) {
      console.error('Error rejecting submission:', error)
      alert('Failed to reject submission')
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submission Review</h1>
          <p className="text-muted-foreground">Review and approve student submissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({submissions.filter((s) => s.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No submissions to review
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {submission.missions?.title}
                      </CardTitle>
                      <Badge
                        variant={
                          submission.status === 'pending'
                            ? 'outline'
                            : submission.status === 'approved'
                              ? 'default'
                              : 'destructive'
                        }
                      >
                        {submission.status === 'pending' && (
                          <>
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </>
                        )}
                        {submission.status === 'approved' && (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" /> Approved
                          </>
                        )}
                        {submission.status === 'rejected' && (
                          <>
                            <XCircle className="mr-1 h-3 w-3" /> Rejected
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submitted by {submission.profiles?.display_name} on{' '}
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {submission.missions?.points} pts
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {submission.submission_text && (
                  <div>
                    <p className="font-semibold text-sm">Submission Text:</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {submission.submission_text}
                    </p>
                  </div>
                )}

                {submission.photo_url && (
                  <div>
                    <p className="font-semibold text-sm mb-2">Photo Evidence:</p>
                    <img
                      src={submission.photo_url}
                      alt="Submission"
                      className="max-h-48 rounded-lg object-cover"
                    />
                  </div>
                )}

                {submission.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          onClick={() => setReviewingId(submission.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Submission</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Award {submission.missions?.points} points to{' '}
                          {submission.profiles?.display_name}?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() =>
                              handleApprove(
                                submission.id,
                                submission.missions?.points || 0
                              )
                            }
                          >
                            Confirm
                          </Button>
                          <Button variant="outline">Cancel</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Submission</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          placeholder="Reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(submission.id)}
                          >
                            Reject
                          </Button>
                          <Button variant="outline">Cancel</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
