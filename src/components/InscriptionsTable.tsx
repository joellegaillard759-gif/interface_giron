'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { formatValue, type AirtableRecord } from './DataTable'

const COLS: Array<{ key: string; label: string }> = [
  { key: 'Candidat.e',       label: 'Candidat·e' },
  { key: 'Instrument [txt]', label: 'Instrument' },
  { key: 'Société [txt]',    label: 'Société' },
]

const GROUPS = [
  { key: 'none',              label: 'Tous' },
  { key: 'Nom catégorie',     label: 'Catégorie' },
  { key: 'Société [txt]',     label: 'Société' },
  { key: 'Type de concours',  label: 'Type' },
]

interface InscriptionsTableProps {
  records: AirtableRecord[]
  loading: boolean
  onRowClick?: (record: AirtableRecord) => void
  selectedId?: string | null
  baseId?: string
}

export default function InscriptionsTable({ records, loading, onRowClick, selectedId, baseId }: InscriptionsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [groupBy, setGroupBy] = useState('none')

  const filtered = useMemo(() => {
    let result = records
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        COLS.some(c => String(r.fields[c.key] ?? '').toLowerCase().includes(q))
      )
    }
    return [...result].sort((a, b) =>
      String(a.fields['Candidat.e'] ?? '').localeCompare(String(b.fields['Candidat.e'] ?? ''), 'fr')
    )
  }, [records, search])

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: null as string | null, rows: filtered }]
    const map = new Map<string, AirtableRecord[]>()
    filtered.forEach(r => {
      const k = formatValue(r.fields[groupBy]) || '—'
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(r)
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([key, rows]) => ({ key, rows }))
  }, [filtered, groupBy])

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px' }}>
        Chargement…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Barre de recherche + regroupement */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14} strokeWidth={1.6}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)', pointerEvents: 'none' }}
          />
          <input
            className="input"
            style={{ paddingLeft: '32px', width: '240px' }}
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="tabs">
          {GROUPS.map(g => (
            <button
              key={g.key}
              className={`tab${groupBy === g.key ? ' active' : ''}`}
              onClick={() => setGroupBy(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px' }}>
          Aucun enregistrement.
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px' }}>
          Aucun résultat.
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: '400px', width: '100%' }}>
              <thead>
                <tr>
                  {COLS.map(c => <th key={c.key}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ key, rows }) => (
                  <>
                    {key !== null && (
                      <tr key={`group-${key}`} style={{ pointerEvents: 'none' }}>
                        <td
                          colSpan={COLS.length}
                          style={{
                            background: 'var(--surface-2)',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--ink-500)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            padding: '7px 16px',
                          }}
                        >
                          {key}
                          <span style={{ fontWeight: 400, color: 'var(--ink-300)', marginLeft: '8px' }}>
                            {rows.length}
                          </span>
                        </td>
                      </tr>
                    )}
                    {rows.map(record => (
                      <tr
                        key={record.id}
                        onClick={() => {
                          if (baseId) {
                            router.push(`/base/${baseId}/inscriptions/${record.id}`)
                          } else {
                            onRowClick?.(record)
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          background: selectedId === record.id ? 'var(--accent-50)' : undefined,
                        }}
                      >
                        {COLS.map(c => (
                          <td
                            key={c.key}
                            style={{ whiteSpace: 'nowrap', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {formatValue(record.fields[c.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="tiny" style={{ color: 'var(--ink-400)' }}>
        {filtered.length !== records.length
          ? `${filtered.length} / ${records.length} inscriptions`
          : `${records.length} inscription${records.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  )
}
