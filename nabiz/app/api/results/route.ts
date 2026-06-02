import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .single()

    const { data: votes, error } = await supabase
      .from('votes')
      .select('province, emotion')
      .eq('event_id', event?.id)

    if (error) throw error

    const byProvince: Record<string, Record<string, number>> = {}
    const byEmotion: Record<string, number> = {}

    votes?.forEach(v => {
      if (!byProvince[v.province]) byProvince[v.province] = {}
      byProvince[v.province][v.emotion] = (byProvince[v.province][v.emotion] || 0) + 1
      byEmotion[v.emotion] = (byEmotion[v.emotion] || 0) + 1
    })

    return NextResponse.json({
      event,
      byProvince,
      byEmotion,
      total: votes?.length || 0
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
