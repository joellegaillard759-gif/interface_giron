import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { webhookUrl, recordId } = await request.json()

  if (!webhookUrl) {
    return NextResponse.json({ error: 'webhookUrl manquant' }, { status: 400 })
  }

  // Construire l'URL avec le recordId si fourni
  const url = recordId ? `${webhookUrl}${recordId}` : webhookUrl

  const res = await fetch(url, { method: 'GET' })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erreur webhook Make' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
