import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ baseId: string }> }
) {
  const { baseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({}, { status: 401 })

  const { data } = await supabase
    .from('airtable_bases')
    .select('nom, nom_concours, statut')
    .eq('airtable_base_id', baseId)
    .single()

  return NextResponse.json(data ?? {})
}
