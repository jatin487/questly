import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Create mission-submissions bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 })
    }

    const bucketExists = buckets?.some((b) => b.name === 'mission-submissions')

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        'mission-submissions',
        {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
        }
      )

      if (createError && !createError.message.includes('already exists')) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        )
      }
    }

    // Create RLS policies for storage
    const { error: policyError } = await supabase
      .from('buckets')
      .select('*')
      .eq('name', 'mission-submissions')

    return NextResponse.json({
      success: true,
      message: 'Storage bucket setup complete',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
