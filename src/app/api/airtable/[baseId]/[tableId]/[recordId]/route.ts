import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!

async function checkAccess(baseId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  if (user.email === process.env.ADMIN_EMAIL) return true

  const { data } = await supabase
    .from('airtable_bases')
    .select('id')
    .eq('airtable_base_id', baseId)
    .single()

  if (!data) return false

  const { data: assoc } = await supabase
    .from('user_bases')
    .select('base_id')
    .eq('user_id', user.id)
    .eq('base_id', data.id)
    .single()

  return !!assoc
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ baseId: string; tableId: string; recordId: string }> }
) {
  const { baseId, tableId, recordId } = await params

  if (!(await checkAccess(baseId))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
