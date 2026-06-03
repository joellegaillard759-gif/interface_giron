'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'

export interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
}

interface DataTableProps {
  records: AirtableRecord[]
  loading: boolean
  onRowClick: (record: AirtableRecord) => void
  selectedId?: string | null
}

export default function DataTable({ records, loading, onRowClick, selectedId }: DataTableProps) {
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const columns = useMemo(() =>
    records.length > 0 ? Object.keys(records[0].fields) : []
  , [records])

  const filtered = useMemo(() => {
    let result = records
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        Object.values(r.fields).some(v => String(v ?? '').toLowerCase().includes(q))
      )
    }
    if (sortCol) {
      result = [...result].sort((a, b) => {
        const av = String(a.fields[sortCol] ?? '')
        const bv = String(b.fields[sortCol] ?? '')
        return sortAsc ? av.localeCompare(bv, 'fr') : bv.localeCompare(av, 'fr')
      })
    }
    return result
  }, [records, search, sortCol, sortAsc])

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(a => !a)
    else { setSortCol(col); setSortAsc(true) }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px' }}>
        Chargement…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ position: 'relative', maxWidth: '320px' }}>
        <Search
          size={14} strokeWidth={1.6}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)', pointerEvents: 'none' }}
        />
        <input
          className="input"
          style={{ paddingLeft: '32px' }}
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: '500px' }}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {col}
                        {sortCol === col
                          ? sortAsc
                            ? <ChevronUp size={11} strokeWidth={2} />
                            : <ChevronDown size={11} strokeWidth={2} />
                          : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => onRowClick(record)}
                    style={{
                      cursor: 'pointer',
                      background: selectedId === record.id ? 'var(--accent-50)' : undefined,
                    }}
                  >
                    {columns.map(col => (
                      <td
                        key={col}
                        style={{ whiteSpace: 'nowrap', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {formatValue(record.fields[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="tiny" style={{ color: 'var(--ink-400)' }}>
        {filtered.length !== records.length
          ? `${filtered.length} / ${records.length} enregistrements`
          : `${records.length} enregistrement${records.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  )
}

export function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non'
  if (typeof val === 'string' || typeof val === 'number') return String(val)
  if (Array.isArray(val)) {
    return val.map(v =>
      typeof v === 'object' && v !== null
        ? (v as Record<string, unknown>).name ?? JSON.stringify(v)
        : String(v)
    ).join(', ')
  }
  return JSON.stringify(val)
}
