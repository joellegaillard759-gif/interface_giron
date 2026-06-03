import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PARAMS_BASE_ID = process.env.AIRTABLE_PARAMS_BASE_ID!
const PARAMS_TABLE = process.env.AIRTABLE_PARAMS_TABLE ?? 'Paramètres'
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

export async function POST() {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Lire la base paramètres Airtable
  const url = `https://api.airtable.com/v0/${PARAMS_BASE_ID}/${encodeURIComponent(PARAMS_TABLE)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erreur lecture base paramètres' }, { status: 500 })
  }

  const { records } = await res.json()
  const adminSupabase = createAdminClient()
  let created = 0, updated = 0

  for (const record of records) {
    const f = record.fields

    const baseId: string = f['Nom de l\'app'] ?? ''
    if (!baseId) continue

    const webhooks = {
      creation_document: f['Webhook création document'] ?? null,
      creation_critique: f['Webhook création feuille de critique'] ?? null,
      decomptes_societe: f['Webhook tous les décomptes société'] ?? null,
      decompte_manquant: f['Webhook décompte manquant société'] ?? null,
      prefill_document: f['Webhook pré-remplissage document'] ?? null,
      creation_personnes: f['Webhook création des personnes'] ?? null,
      liste_participants: f['Webhook génération liste participants'] ?? null,
      liste_participants_morceaux: f['Webhook génération liste participants avec morceaux'] ?? null,
      toutes_critiques: f['Webhook génération toutes les critiques'] ?? null,
      tous_classements: f['Webhook génération tous les classements'] ?? null,
      regroupement_partitions: f['Webhook regroupement partitions'] ?? null,
      qualification_cvspe: f['Webhook qualification cvspe'] ?? null,
      excel: f['Webhook excel'] ?? null,
      preparation_admin: f['Webhook préparation document admin'] ?? null,
      tous_horaires: f['Webhook génération tous les horaires'] ?? null,
      diplomes: f['Webhook diplômes'] ?? null,
    }

    const liens = {
      inscription: f['Lien inscription fillout'] ?? null,
      mise_a_jour: f['Lien mise à jour inscription'] ?? null,
      depot_partition: f['Lien dépôt partition'] ?? null,
      depot_video: f['Lien dépôt vidéo'] ?? null,
      modification_manifestation: f['Lien modification manifestation'] ?? null,
    }

    const accessEmails: string[] = []
    for (let i = 1; i <= 5; i++) {
      const email = f[`accès interface ${i}`]
      if (email) accessEmails.push(email.trim())
    }

    const baseData = {
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
      access_emails: accessEmails,
      synced_at: new Date().toISOString(),
    }

    const { data: existing } = await adminSupabase
      .from('airtable_bases')
      .select('id')
      .eq('airtable_base_id', baseId)
      .single()

    if (existing) {
      await adminSupabase.from('airtable_bases').update(baseData).eq('id', existing.id)
      updated++
    } else {
      const { data: inserted, error: insertError } = await adminSupabase
        .from('airtable_bases')
        .insert(baseData)
        .select('id')
        .single()
      if (insertError || !inserted) throw new Error(`Insert échoué : ${insertError?.message}`)
      created++
    }
  }

  return NextResponse.json({ ok: true, created, updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[sync]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
