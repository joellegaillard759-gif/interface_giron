'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Building2, Trophy, Calendar, Clock, Star, FileText, ArrowRight } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import type { AirtableBase } from '@/types'

type TableKey = 'table_societes' | 'table_inscription' | 'table_concours' | 'table_passages' | 'table_document'

const SECTIONS: Array<{ key: string; label: string; icon: React.ElementType; tableKey: TableKey }> = [
  { key: 'societes',      label: 'Sociétés',      icon: Building2,  tableKey: 'table_societes' },
  { key: 'inscriptions',  label: 'Inscriptions',  icon: Users,      tableKey: 'table_inscription' },
  { key: 'concours',      label: 'Concours',      icon: Trophy,     tableKey: 'table_concours' },
  { key: 'planification', label: 'Planification', icon: Calendar,   tableKey: 'table_concours' },
  { key: 'horaires',      label: 'Horaires',      icon: Clock,      tableKey: 'table_passages' },
  { key: 'classements',   label: 'Classements',   icon: Star,       tableKey: 'table_inscription' },
  { key: 'documents',     label: 'Documents',     icon: FileText,   tableKey: 'table_document' },
]

const STAT_SECTIONS = [
  { key: 'inscriptions', label: 'Inscriptions', icon: Users, tableKey: 'table_inscription' as TableKey },
  { key: 'societes',  label: 'Sociétés',  icon: Building2, tableKey: 'table_societes' as TableKey },
  { key: 'concours',  label: 'Concours',  icon: Trophy, tableKey: 'table_concours' as TableKey },
]

async function fetchCount(baseId: string, tableId: string): Promise<number> {
  let count = 0
  let offset: string | undefined
  do {
    const url = `/api/airtable/${baseId}/${tableId}?pageSize=100${offset ? `&offset=${offset}` : ''}`
    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error(`[fetchCount] ${baseId}/${tableId} → ${res.status}`, body)
      break
    }
    const data = await res.json()
    if (data.error) {
      console.error(`[fetchCount] ${baseId}/${tableId} → Airtable error`, data.error)
      break
    }
    count += data.records?.length ?? 0
    offset = data.offset
  } while (offset)
  return count
}

export default function DashboardConcours({ base }: { base: AirtableBase }) {
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [triggerState, setTriggerState] = useState<Record<string, 'idle' | 'loading' | 'ok' | 'error'>>({})

  useEffect(() => {
    STAT_SECTIONS.forEach(({ key, tableKey }) => {
      const tableId = base[tableKey] as string | null
      if (!tableId) return
      fetchCount(base.airtable_base_id, tableId).then(n =>
        setCounts(c => ({ ...c, [key]: n }))
      )
    })
  }, [base])

  const triggerWebhook = async (name: string, url: string) => {
    setTriggerState(s => ({ ...s, [name]: 'loading' }))
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: url }),
      })
      setTriggerState(s => ({ ...s, [name]: res.ok ? 'ok' : 'error' }))
    } catch {
      setTriggerState(s => ({ ...s, [name]: 'error' }))
    } finally {
      setTimeout(() => setTriggerState(s => ({ ...s, [name]: 'idle' })), 3000)
    }
  }

  const baseId = base.airtable_base_id
  const webhookEntries = Object.entries(base.webhooks || {}).filter(([, v]) => v)
  const lienEntries = Object.entries(base.liens || {}).filter(([, v]) => v)

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 className="h-display-sm" style={{ color: 'var(--ink-900)' }}>
          {base.nom_concours || base.nom}
        </h1>
        <StatusBadge statut={base.statut} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {STAT_SECTIONS.map(({ key, label, icon: Icon, tableKey }) => {
          const hasTable = !!base[tableKey]
          return (
            <div key={key} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r-md)', background: 'var(--accent-50)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon size={16} strokeWidth={1.6} color="var(--accent)" />
                </div>
                <span className="small" style={{ color: 'var(--ink-500)' }}>{label}</span>
              </div>
              <div className="h-display-sm num" style={{ color: 'var(--ink-900)' }}>
                {!hasTable ? '—' : counts[key] == null ? '…' : counts[key]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sections */}
      <div className="eyebrow" style={{ marginBottom: '12px' }}>Sections</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '28px' }}>
        {SECTIONS.map(({ key, label, icon: Icon, tableKey }) => {
          const available = !!base[tableKey]
          return (
            <Link
              key={key}
              href={available ? `/base/${baseId}/${key}` : '#'}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', textDecoration: 'none',
                background: 'var(--surface)', border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)',
                opacity: available ? 1 : 0.4,
                pointerEvents: available ? 'auto' : 'none',
                transition: 'all 0.12s cubic-bezier(.2,.7,.3,1)',
              }}
              onMouseEnter={e => { if (available) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(24,23,28,0.20)' }}
              onMouseLeave={e => { if (available) (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline)' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon size={16} strokeWidth={1.6} color="var(--ink-600)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-900)' }}>{label}</div>
                {available && counts[key] != null && (
                  <div className="small" style={{ color: 'var(--ink-500)' }}>
                    {counts[key]} enregistrements
                  </div>
                )}
              </div>
              <ArrowRight size={14} strokeWidth={1.6} color="var(--ink-300)" style={{ flexShrink: 0 }} />
            </Link>
          )
        })}
      </div>

      {/* Actions */}
      {(webhookEntries.length > 0 || lienEntries.length > 0) && (
        <div>
          {lienEntries.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="eyebrow" style={{ marginBottom: '10px' }}>Formulaires</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {lienEntries.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="btn">
                    {name} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
          {webhookEntries.length > 0 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: '10px' }}>Actions Make</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {webhookEntries.map(([name, url]) => {
                  const state = triggerState[name] || 'idle'
                  return (
                    <button
                      key={name}
                      className="btn"
                      onClick={() => triggerWebhook(name, url)}
                      disabled={state === 'loading'}
                    >
                      {state === 'loading' ? (
                        <>
                          <span style={{ width: '12px', height: '12px', border: '2px solid var(--ink-300)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                          {name}
                        </>
                      ) : state === 'ok' ? (
                        <span style={{ color: 'var(--success)' }}>✓ {name}</span>
                      ) : state === 'error' ? (
                        <span style={{ color: 'var(--accent)' }}>✗ {name}</span>
                      ) : name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
