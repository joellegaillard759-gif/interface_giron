'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Hash, Building2, FileText, User } from 'lucide-react'
import type { AirtableBase } from '@/types'
import type { AirtableRecord } from './DataTable'
import { formatValue } from './DataTable'

interface CandidatDetailProps {
  base: AirtableBase
  record: AirtableRecord
  onRecordUpdate: (updated: AirtableRecord) => void
}

function parseName(raw: string): { prenom: string; nom: string } {
  const parts = raw.split(',').map(s => s.trim())
  if (parts.length === 2) return { nom: parts[0], prenom: parts[1] }
  const words = raw.split(' ')
  return { prenom: words[0] ?? '', nom: words.slice(1).join(' ') }
}

function isPdf(val: unknown): val is Array<{ url: string; filename: string }> {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    typeof val[0] === 'object' &&
    val[0] !== null &&
    'url' in (val[0] as object)
  )
}

// ─── Card Coordonnées ─────────────────────────────────────────────────────────

function rawStr(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return ''
}

function CardCoordonnees({
  record, base, onRecordUpdate,
}: {
  record: AirtableRecord
  base: AirtableBase
  onRecordUpdate: (r: AirtableRecord) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState(rawStr(record.fields['Email']))
  const [tel, setTel] = useState(rawStr(record.fields['Numéro de téléphone']))
  const [adresse, setAdresse] = useState(rawStr(record.fields['Adresse (rue, numéro)']))

  useEffect(() => {
    setEmail(rawStr(record.fields['Email']))
    setTel(rawStr(record.fields['Numéro de téléphone']))
    setAdresse(rawStr(record.fields['Adresse (rue, numéro)']))
    setEditing(false)
    setError(null)
  }, [record.id])

  async function save() {
    if (!base.table_inscription) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/airtable/${base.airtable_base_id}/${base.table_inscription}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            records: [{
              id: record.id,
              fields: {
                Email: email || null,
                'Numéro de téléphone': tel || null,
                'Adresse (rue, numéro)': adresse || null,
              },
            }],
          }),
        }
      )
      const data = await res.json()
      if (data.records?.[0]) {
        onRecordUpdate(data.records[0])
        setEditing(false)
      } else {
        setError(data.error?.message ?? 'Erreur Airtable')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Coordonnées</div>
        {editing ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn sm" onClick={() => setEditing(false)} disabled={saving}>
              Annuler
            </button>
            <button className="btn sm primary" onClick={save} disabled={saving}>
              {saving ? '…' : 'Enregistrer'}
            </button>
          </div>
        ) : (
          <button className="btn sm" onClick={() => setEditing(true)}>Éditer</button>
        )}
      </div>
      {error && (
        <div style={{ padding: '8px 18px', fontSize: 12, color: 'var(--accent)', background: 'var(--accent-50)' }}>
          {error}
        </div>
      )}
      <div className="card-body" style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 24, rowGap: 14, fontSize: 13.5,
      }}>
        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={14} strokeWidth={1.6} /> Email
        </div>
        {editing
          ? <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
          : <div>{email}</div>}

        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={14} strokeWidth={1.6} /> Téléphone
        </div>
        {editing
          ? <input className="input" value={tel} onChange={e => setTel(e.target.value)} />
          : <div className="num">{tel}</div>}

        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={14} strokeWidth={1.6} /> Adresse
        </div>
        {editing
          ? <input className="input" value={adresse} onChange={e => setAdresse(e.target.value)} />
          : <div style={{ whiteSpace: 'pre-line' }}>{adresse}</div>}

      </div>
    </div>
  )
}

// ─── Card Concours ────────────────────────────────────────────────────────────

function CardConcours({ record, base }: { record: AirtableRecord; base: AirtableBase }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Concours</div>
          <div className="card-sub">{base.nom_concours}</div>
        </div>
      </div>
      <div className="card-body" style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 24, rowGap: 14, fontSize: 13.5,
      }}>
        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={14} strokeWidth={1.6} /> Catégorie
        </div>
        <div>{formatValue(record.fields['Nom catégorie'])}</div>

        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={14} strokeWidth={1.6} /> Type
        </div>
        <div>{formatValue(record.fields['Type de concours'])}</div>

        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hash size={14} strokeWidth={1.6} /> Tranche d'âge
        </div>
        <div>{formatValue(record.fields["Tranche d'âge"])}</div>
      </div>
    </div>
  )
}

// ─── Onglet Aperçu ────────────────────────────────────────────────────────────

function TabApercu({ record, base, onRecordUpdate }: {
  record: AirtableRecord
  base: AirtableBase
  onRecordUpdate: (r: AirtableRecord) => void
}) {
  const contraintes = formatValue(record.fields['Heures de passages inscriptions contraintes'])
  return (
    <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
      <CardCoordonnees record={record} base={base} onRecordUpdate={onRecordUpdate} />
      <CardConcours record={record} base={base} />
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <div className="card-header">
          <div className="card-title">Contraintes horaires</div>
        </div>
        <div className="card-body" style={{ fontSize: 13.5 }}>
          {contraintes === '—'
            ? <span className="muted">Aucune contrainte renseignée</span>
            : <span style={{ whiteSpace: 'pre-line' }}>{contraintes}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Onglet Partition ─────────────────────────────────────────────────────────

function TabPartition({ record, base, onRecordUpdate }: {
  record: AirtableRecord
  base: AirtableBase
  onRecordUpdate: (r: AirtableRecord) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titre, setTitre] = useState(rawStr(record.fields['Titre de la pièce']))

  useEffect(() => {
    setTitre(rawStr(record.fields['Titre de la pièce']))
    setEditing(false)
    setError(null)
  }, [record.id])

  const partitionSoliste = record.fields['Partition candidat rendue']
  const partitionPiano = record.fields['Partition piano rendue']

  async function save() {
    if (!base.table_inscription) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/airtable/${base.airtable_base_id}/${base.table_inscription}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            records: [{
              id: record.id,
              fields: { 'Titre de la pièce': titre || null },
            }],
          }),
        }
      )
      const data = await res.json()
      if (data.records?.[0]) {
        onRecordUpdate(data.records[0])
        setEditing(false)
      } else {
        setError(data.error?.message ?? 'Erreur Airtable')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Pièce jouée</div>
          {editing ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn sm" onClick={() => setEditing(false)} disabled={saving}>
                Annuler
              </button>
              <button className="btn sm primary" onClick={save} disabled={saving}>
                {saving ? '…' : 'Enregistrer'}
              </button>
            </div>
          ) : (
            <button className="btn sm" onClick={() => setEditing(true)}>Éditer</button>
          )}
        </div>
        {error && (
          <div style={{ padding: '8px 18px', fontSize: 12, color: 'var(--accent)', background: 'var(--accent-50)' }}>
            {error}
          </div>
        )}
        <div className="card-body" style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 24, rowGap: 14, fontSize: 13.5,
        }}>
          <div className="muted">Titre</div>
          {editing
            ? <input className="input" value={titre} onChange={e => setTitre(e.target.value)} />
            : <div>{titre}</div>}

          <div className="muted">Compositeur</div>
          <div>{formatValue(record.fields['texte compositeur'])}</div>
        </div>
      </div>

      {(isPdf(partitionSoliste) || isPdf(partitionPiano)) && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Partitions</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isPdf(partitionSoliste) && partitionSoliste.map(att => (
              <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" className="btn">
                <FileText size={14} strokeWidth={1.6} /> {att.filename}
              </a>
            ))}
            {isPdf(partitionPiano) && partitionPiano.map(att => (
              <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" className="btn">
                <FileText size={14} strokeWidth={1.6} /> {att.filename}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Onglet Professeur ────────────────────────────────────────────────────────

function TabProfesseur({ record }: { record: AirtableRecord }) {
  const nom = formatValue(record.fields['Nom du professeur'])
  const email = formatValue(record.fields['Email professeur'])

  if (nom === '—' && email === '—') {
    return (
      <div style={{ padding: '24px 32px 40px' }}>
        <div className="card">
          <div className="card-body">
            <span className="muted">Aucun professeur renseigné</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px 40px' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Professeur</div>
        </div>
        <div className="card-body" style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 24, rowGap: 14, fontSize: 13.5,
        }}>
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={14} strokeWidth={1.6} /> Nom
          </div>
          <div>{nom}</div>
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={14} strokeWidth={1.6} /> Email
          </div>
          <div>{email}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CandidatDetail({ base, record, onRecordUpdate }: CandidatDetailProps) {
  const [activeTab, setActiveTab] = useState<'apercu' | 'partition' | 'professeur'>('apercu')

  const nomRaw = String(record.fields['Candidat.e'] ?? record.fields['Nom'] ?? '—')
  const { prenom, nom } = parseName(nomRaw)
  const initiales = ((nom[0] ?? '') + (prenom[0] ?? '')).toUpperCase()

  const categorie = formatValue(record.fields['Nom catégorie'])
  const typeConcours = formatValue(record.fields['Type de concours'])
  const instrument = formatValue(record.fields['instrument [txt]'])
  const societe = formatValue(record.fields['société [txt]'])
  const subtitleParts = [instrument, societe].filter(v => v !== '—')

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 10,
            background: 'var(--accent)',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>
            {initiales || '?'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Inscription</div>
            <h1 className="h-display" style={{ margin: 0 }}>
              {prenom} <em style={{ fontStyle: 'italic' }}>{nom}</em>
            </h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {categorie !== '—' && <span className="tag">{categorie}</span>}
              {typeConcours !== '—' && <span className="tag">{typeConcours}</span>}
            </div>
            {subtitleParts.length > 0 && (
              <div className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                {subtitleParts.join(' · ')}
              </div>
            )}
          </div>
        </div>

        <div className="tabs" style={{ marginTop: 24 }}>
          {(['apercu', 'partition', 'professeur'] as const).map(tab => (
            <div
              key={tab}
              className={`tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'apercu' ? 'Aperçu' : tab === 'partition' ? 'Partition' : 'Professeur'}
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'apercu' && (
        <TabApercu record={record} base={base} onRecordUpdate={onRecordUpdate} />
      )}
      {activeTab === 'partition' && (
        <TabPartition record={record} base={base} onRecordUpdate={onRecordUpdate} />
      )}
      {activeTab === 'professeur' && (
        <TabProfesseur record={record} />
      )}
    </div>
  )
}
