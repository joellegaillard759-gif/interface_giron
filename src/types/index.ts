export type AirtableBase = {
  id: string
  airtable_base_id: string
  nom: string
  nom_concours: string
  statut: string | null
  actif: boolean
  table_personnes: string | null
  table_document: string | null
  table_concours: string | null
  table_inscription: string | null
  table_manifestation: string | null
  table_societes: string | null
  table_passages: string | null
  webhooks: Record<string, string>
  liens: Record<string, string>
  access_emails: string[]
  synced_at: string
}

export type UserBase = {
  user_id: string
  base_id: string
}
