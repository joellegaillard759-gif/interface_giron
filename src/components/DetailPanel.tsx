'use client'

import { X } from 'lucide-react'
import type { AirtableRecord } from './DataTable'

interface DetailPanelProps {
  record: AirtableRecord | null
  onClose: () => void
}

export default function DetailPanel({ record, onClose }: DetailPanelProps) {
  if (!record) return null

  return (
    <div style={{
      borderLeft: '1px solid var(--hairline)',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--hairline)',
        flexShrink: 0,
      }}>
        <span className="h3">Détail</span>
        <button className="iconbtn ghost" onClick={onClose}>
          <X size={16} strokeWidth={1.6} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {Object.entries(record.fields).map(([key, val]) => (
            <div key={key} className="field">
              <div className="field-label">{key}</div>
              <FieldValue value={val} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FieldValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--ink-400)', fontSize: '13px' }}>—</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span className={`tag ${value ? 'success' : ''}`} style={{ fontSize: '12px' }}>
        {value ? 'Oui' : 'Non'}
      </span>
    )
  }
  if (typeof value === 'number') {
    return <span className="num" style={{ fontSize: '13px', color: 'var(--ink-800)' }}>{value}</span>
  }
  if (typeof value === 'string') {
    if (value.startsWith('http')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '13px', color: 'var(--info)', textDecoration: 'none', wordBreak: 'break-all' }}>
          {value}
        </a>
      )
    }
    return <span style={{ fontSize: '13px', color: 'var(--ink-800)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: 'var(--ink-400)', fontSize: '13px' }}>—</span>
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {value.map((v, i) => {
          const label: string = typeof v === 'object' && v !== null
            ? String((v as Record<string, unknown>).name ?? JSON.stringify(v))
            : String(v)
          return <span key={i} className="tag sm">{label}</span>
        })}
      </div>
    )
  }
  return <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>{JSON.stringify(value)}</span>
}
