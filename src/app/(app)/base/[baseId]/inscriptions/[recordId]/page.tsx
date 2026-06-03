import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AirtableBase } from '@/types'
import type { AirtableRecord } from '@/components/DataTable'
import InscriptionDetailScreen from './InscriptionDetailScreen'

const TOKEN = process.env.AIRTABLE_TOKEN!

const LIST_FIELDS = ['Candidat.e', 'Instrument', 'Société', 'Catégorie', 'Type de concours']

async function fetchRecord(baseId: string, tableId: string, recordId: string): Promise<AirtableRecord | null> {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchInscriptionsList(baseId: string, tableId: string): Promise<AirtableRecord[]> {
  const fieldParams = LIST_FIELDS.map(f => `fields[]=${encodeURIComponent(f)}`).join('&')
  const all: AirtableRecord[] = []
  let offset: string | undefined
  do {
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?${fieldParams}&pageSize=100${offset ? `&offset=${offset}` : ''}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    })
    if (!res.ok) break
    const data = await res.json()
    all.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)
  return all
}

export default async function InscriptionDetailPage({
  params,
}: {
  params: Promise<{ baseId: string; recordId: string }>
}) {
  const { baseId, recordId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.email === process.env.ADMIN_EMAIL
  const client = isAdmin
    ? (await import('@/lib/supabase/admin')).createAdminClient()
    : supabase

  const { data: base } = await client
    .from('airtable_bases')
    .select('*')
    .eq('airtable_base_id', baseId)
    .single()

  if (!base) redirect('/dashboard')

  const tableId = (base as AirtableBase).table_inscription
  if (!tableId) redirect(`/base/${baseId}/inscriptions`)

  const [record, allInscriptions] = await Promise.all([
    fetchRecord(baseId, tableId, recordId),
    fetchInscriptionsList(baseId, tableId),
  ])

  if (!record) redirect(`/base/${baseId}/inscriptions`)

  return (
    <InscriptionDetailScreen
      base={base as AirtableBase}
      record={record}
      allInscriptions={allInscriptions}
    />
  )
}
