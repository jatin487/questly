'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getLocalProfile } from '@/lib/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, Camera, CheckCircle2, MapPin, Clock, Flag, Sparkles, Users, Leaf, Shield, ImagePlus } from 'lucide-react'
import Link from 'next/link'

interface Mission {
  id: string
  title: string
  description: string
  location_name: string
  points: number
  difficulty: string
  category: string
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
      const localProfile = getLocalProfile()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id || localProfile?.id

      if (!userId) throw new Error('Not authenticated')

      let photoUrl = null

      // Upload file if provided
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('mission-submissions')
          .upload(`${userId}/${fileName}`, selectedFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('mission-submissions')
          .getPublicUrl(`${userId}/${fileName}`)

        photoUrl = data.publicUrl
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: mission.id,
          submission_text: submissionText,
          team_id: null,
          photo_url: photoUrl,
          user_id: userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

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

  const isVideoMission = mission?.title.toLowerCase().includes('reel')
  const acceptType = isVideoMission ? 'video/*' : 'image/*'
  const flagCount = mission ? Math.max(1, Math.round(mission.points / 10)) : 0

  const missionIcon = (category: string) => {
    switch (category) {
      case 'team':
        return <Users className="h-8 w-8 text-primary" />
      case 'building':
        return <MapPin className="h-8 w-8 text-primary" />
      case 'faculty':
        return <Flag className="h-8 w-8 text-primary" />
      case 'canteen':
        return <Camera className="h-8 w-8 text-primary" />
      case 'creative':
        return <Sparkles className="h-8 w-8 text-primary" />
      case 'nature':
        return <Leaf className="h-8 w-8 text-primary" />
      case 'safety':
        return <Shield className="h-8 w-8 text-primary" />
      default:
        return <MapPin className="h-8 w-8 text-primary" />
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                {missionIcon(mission.category || '')}
              </div>
              <div>
                <CardTitle className="text-3xl">{mission.title}</CardTitle>
                <CardDescription className="mt-2 text-muted-foreground">
                  {mission.location_name}
                </CardDescription>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Estimated time</p>
                <p className="mt-2 text-lg font-semibold">{mission.title.includes('Reel') ? '15-20 min' : mission.title.includes('Plant') ? '15 min' : mission.title.includes('Find the Building') ? '8 min' : mission.title.includes('Selfie') ? '5 min' : mission.title.includes('Safety') ? '5 min' : '10 min'}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Reward</p>
                <p className="mt-2 flex items-center justify-center gap-2 text-lg font-semibold">
                  <Flag className="h-4 w-4" /> {flagCount} Flag{flagCount > 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Points</p>
                <p className="mt-2 text-lg font-semibold">{mission.points}</p>
              </div>
            </div>
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

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Objective</h3>
                <p className="mt-2 text-muted-foreground">{mission.description}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Mission Flow
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>1. Start Mission</p>
                  <p>2. Read instructions</p>
                  <p>3. Capture photo/video</p>
                  <p>4. Upload proof</p>
                  <p>5. Await verification</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">Submission Requirements</p>
                    <p className="text-sm text-muted-foreground">Use camera or gallery to submit proof</p>
                  </div>
                  <Badge>{mission.requires_photo ? 'Photo Required' : 'Optional'}</Badge>
                </div>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>{mission.requires_gps ? 'GPS verification is optional for this mission.' : 'Photo proof is required for completion.'}</p>
                  {mission.title.includes('Reel') ? <p>Video upload capped at 30 seconds.</p> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <p className="text-sm font-semibold">Progress</p>
                <div className="mt-3 rounded-full bg-muted p-1">
                  <div className="h-2 rounded-full bg-primary/70" style={{ width: success ? '100%' : selectedFile ? '70%' : '30%' }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {success ? 'Mission complete' : selectedFile ? 'File ready for upload' : 'No file selected yet'}
                </p>
              </div>
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
              <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-semibold">Mission Complete</h3>
                <p className="mt-2 text-sm text-foreground">+{flagCount} Flag{flagCount > 1 ? 's' : ''} Earned</p>
                <div className="mt-4 flex justify-center gap-2 text-2xl">
                  <span className="animate-bounce">🎉</span>
                  <span className="animate-pulse">✨</span>
                  <span className="animate-bounce">🎊</span>
                </div>
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
              <div className="space-y-4">
                <label className="text-sm font-medium">Upload Proof</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      const reader = new FileReader()
                      reader.onload = (event) => setPreview(event.target?.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="cursor-pointer rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center transition-colors hover:border-primary/50"
                >
                  {preview ? (
                    <div className="space-y-3">
                      <img src={preview} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                      <p className="text-sm font-medium">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drag & drop or click to select your file</p>
                      <p className="text-xs text-muted-foreground">
                        {isVideoMission ? 'MP4, MOV up to 30MB' : 'PNG, JPG up to 10MB'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Use Camera / Gallery
                  </Button>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptType}
                  capture="environment"
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
