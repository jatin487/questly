'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

interface Mission {
  id: string
  title: string
  description: string
  location_name: string
  points: number
  difficulty: string
  image_url: string | null
  requires_photo: boolean
  requires_gps: boolean
  requires_qr_code: boolean
}

export default function MissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params.id as string

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadMission() {
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()

        if (error) throw error
        setMission(data)
      } catch (error) {
        console.error('Error loading mission:', error)
        router.push('/dashboard/missions')
      } finally {
        setLoading(false)
      }
    }

    loadMission()
  }, [missionId, supabase, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmission(e: React.FormEvent) {
    e.preventDefault()
    if (!mission) return

    setSubmitting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      let photoUrl = null

      // Upload file if provided
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('mission-submissions')
          .upload(`${user.id}/${fileName}`, selectedFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('mission-submissions')
          .getPublicUrl(`${user.id}/${fileName}`)

        photoUrl = data.publicUrl
      }

      // Create submission
      const { error: submitError } = await supabase.from('mission_submissions').insert({
        mission_id: mission.id,
        user_id: user.id,
        submission_text: submissionText,
        photo_url: photoUrl,
        status: 'pending',
      })

      if (submitError) throw submitError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/submissions')
      }, 2000)
    } catch (error) {
      console.error('Error submitting mission:', error)
      alert('Failed to submit mission. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading mission...</div>
  }

  if (!mission) {
    return <div className="p-8">Mission not found</div>
  }

  return (
    <div className="space-y-8 p-8">
      {/* Back Button */}
      <Link href="/dashboard/missions">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Missions
        </Button>
      </Link>

      {/* Mission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{mission.title}</CardTitle>
              <CardDescription className="mt-2">{mission.location_name}</CardDescription>
            </div>
            <Badge className="text-base">{mission.points} points</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mission.image_url && (
            <div className="h-64 w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={mission.image_url}
                alt={mission.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="mt-2 text-muted-foreground">{mission.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Difficulty</p>
              <p className="mt-1 text-muted-foreground capitalize">{mission.difficulty}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Requires Photo</p>
              <p className="mt-1 text-muted-foreground">{mission.requires_photo ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Requires GPS</p>
              <p className="mt-1 text-muted-foreground">{mission.requires_gps ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Mission</CardTitle>
          <CardDescription>Upload your proof and complete this mission</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmission} className="space-y-6">
            {success && (
              <div className="rounded-lg bg-green-100 p-4 text-sm text-green-800">
                Mission submitted successfully! Redirecting...
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about your submission..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="min-h-24"
              />
            </div>

            {mission.requires_photo && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Photo Upload</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center hover:border-primary/50 transition-colors"
                >
                  {preview ? (
                    <div className="space-y-3">
                      <img src={preview} alt="Preview" className="mx-auto max-h-40 rounded" />
                      <p className="text-sm font-medium">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload your photo</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting || (mission.requires_photo && !selectedFile)}>
              {submitting ? 'Submitting...' : 'Submit Mission'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
