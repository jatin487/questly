import { createClient as createServerClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    )

    // Delete all existing missions
    const { error: deleteError } = await supabase
      .from('missions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) throw deleteError

    return Response.json({ message: 'All missions cleared. Run /api/seed-missions to populate new ones.' })
  } catch (error: any) {
    console.error('Error clearing missions:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
