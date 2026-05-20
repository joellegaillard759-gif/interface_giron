import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!

// Vérifie que l'utilisateur a accès à cette base
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
  request: NextRequest,
  { params }: { params: Promise<{ baseId: string; tableId: string }> }
) {
  const { baseId, tableId } = await params

  if (!(await checkAccess(baseId))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ baseId: string; tableId: string }> }
) {
  const { baseId, tableId } = await params

  if (!(await checkAccess(baseId))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await request.json()
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
