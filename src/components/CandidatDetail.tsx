'use client'

import type { AirtableBase } from '@/types'
import type { AirtableRecord } from './DataTable'

interface CandidatDetailProps {
  base: AirtableBase
  record: AirtableRecord
  onRecordUpdate: (updated: AirtableRecord) => void
}

export default function CandidatDetail({ record }: CandidatDetailProps) {
  const nom = String(record.fields['Candidat.e'] ?? '—')
  return (
    <div style={{
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-400)',
      fontSize: '13px',
    }}>
      {nom} — header + onglets (étape 4)
    </div>
  )
}
