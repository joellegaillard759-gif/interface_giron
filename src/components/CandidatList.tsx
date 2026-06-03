'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { formatValue, type AirtableRecord } from './DataTable'

function getInitials(name: string): string {
  const commaParts = name.split(',').map(s => s.trim())
  if (commaParts.length >= 2) {
    return ((commaParts[0][0] ?? '') + (commaParts[1][0] ?? '')).toUpperCase()
  }
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()
}

interface CandidatListProps {
  records: AirtableRecord[]
  selectedId: string
  baseId: string
}

export default function CandidatList({ records, selectedId, baseId }: CandidatListProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const result = q
      ? records.filter(r =>
          ['Candidat.e', 'Instrument', 'Société', 'Catégorie'].some(col =>
            String(r.fields[col] ?? '').toLowerCase().includes(q)
          )
        )
      : records
    return [...result].sort((a, b) =>
      String(a.fields['Candidat.e'] ?? '').localeCompare(String(b.fields['Candidat.e'] ?? ''), 'fr')
    )
  }, [records, search])

  return (
    <aside style={{
      width: '300px',
      flexShrink: 0,
      borderRight: '1px solid var(--hairline)',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Search */}
      <div style={{ padding: '14px 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 10px',
          background: 'var(--surface-2)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)',
        }}>
          <Search size={13} strokeWidth={1.6} style={{ color: 'var(--ink-400)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrer la liste…"
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: '13px', color: 'var(--ink-700)', width: '100%',
            }}
          />
        </div>
      </div>

      {/* Count */}
      <div style={{
        padding: '4px 14px 6px',
        fontSize: '11px', fontWeight: 600,
        color: 'var(--ink-400)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {filtered.length} inscription{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(r => {
          const nom = String(r.fields['Candidat.e'] ?? '—')
          const instrument = formatValue(r.fields['Instrument'])
          const societe = formatValue(r.fields['Société'])
          const categorie = formatValue(r.fields['Catégorie'])
          const isSelected = r.id === selectedId
          return (
            <button
              key={r.id}
              onClick={() => router.push(`/base/${baseId}/inscriptions/${r.id}`)}
              style={{
                all: 'unset',
                display: 'grid',
                gridTemplateColumns: '36px 1fr auto',
                gap: '10px',
                alignItems: 'center',
                padding: '10px 14px',
                cursor: 'pointer',
                width: '100%',
                boxSizing: 'border-box',
                background: isSelected ? 'rgba(183,58,42,0.06)' : 'transparent',
                borderLeft: `2px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                transition: 'background 0.1s ease',
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isSelected ? 'var(--accent)' : 'var(--ink-100)',
                color: isSelected ? 'white' : 'var(--ink-800)',
                display: 'grid', placeItems: 'center',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.02em', flexShrink: 0,
              }}>
                {getInitials(nom)}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nom}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[instrument, societe].filter(v => v && v !== '—').join(' · ')}
                </div>
              </div>

              {categorie && categorie !== '—' && (
                <span className="tag sm" style={{ fontSize: '10.5px', flexShrink: 0 }}>
                  {categorie}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
