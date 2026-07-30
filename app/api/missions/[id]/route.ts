import { createClient as createServerClient } from '@supabase/supabase-js'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    )

    const { id: missionId } = await params
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error loading mission:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
