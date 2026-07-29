import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Development-only endpoint to confirm emails for testing
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Use admin API to confirm email
    const { data, error } = await supabase.auth.admin.getUserByEmail(email)

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      return NextResponse.json(
        { error: confirmError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmed',
      userId: data.user.id,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
