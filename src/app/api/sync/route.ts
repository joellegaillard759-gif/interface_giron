import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

const PARAMS_BASE_ID = process.env.AIRTABLE_PARAMS_BASE_ID!
const PARAMS_TABLE = process.env.AIRTABLE_PARAMS_TABLE ?? 'Paramètres'
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!

export async function POST() {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response
    const { adminSupabase } = guard

    const url = `https://api.airtable.com/v0/${PARAMS_BASE_ID}/${encodeURIComponent(PARAMS_TABLE)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur lecture base paramètres' }, { status: 500 })
    }

    const { records } = await res.json()

    // Pré-charge les IDs existants pour distinguer créations et mises à jour
    const { data: existingRows } = await adminSupabase
      .from('airtable_bases')
      .select('airtable_base_id')
    const existingIds = new Set((existingRows ?? []).map(r => r.airtable_base_id as string))

    let created = 0, updated = 0
    const allBaseData = []

    for (const record of records) {
      const f = record.fields as Record<string, string>
      const baseId = f['Nom de l\'app'] ?? ''
      if (!baseId) continue

      // Extrait dynamiquement tous les champs Webhook/Lien — capte automatiquement les nouveaux
      const webhooks: Record<string, string> = {}
      const liens: Record<string, string> = {}
      for (const [key, val] of Object.entries(f)) {
        if (typeof val !== 'string' || !val) continue
        if (key.startsWith('Webhook ')) webhooks[key.slice('Webhook '.length)] = val
        else if (key.startsWith('Lien ')) liens[key.slice('Lien '.length)] = val
      }

      const access_emails: string[] = []
      for (let i = 1; i <= 5; i++) {
        const email = f[`accès interface ${i}`]
        if (email) access_emails.push(email.trim())
      }

      allBaseData.push({
        airtable_base_id: baseId,
        nom: f['Name'] ?? baseId,
        nom_concours: f['Nom complet'] ?? f['Nom du concours'] ?? null,
        statut: f['Statut'] ?? null,
        table_personnes: f['Table personnes'] ?? null,
        table_document: f['Table document'] ?? null,
        table_concours: f['Table concours'] ?? null,
        table_inscription: f['Table inscription'] ?? null,
        table_manifestation: f['Table manifestation'] ?? null,
        table_societes: f['Table sociétés'] ?? null,
        table_passages: f['Table passages'] ?? null,
        webhooks,
        liens,
        access_emails,
        synced_at: new Date().toISOString(),
      })

      if (existingIds.has(baseId)) { updated++ } else { created++ }
    }

    if (allBaseData.length > 0) {
      const { error } = await adminSupabase
        .from('airtable_bases')
        .upsert(allBaseData, { onConflict: 'airtable_base_id' })
      if (error) throw new Error(error.message)
    }

    return NextResponse.json({ ok: true, created, updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[sync]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
