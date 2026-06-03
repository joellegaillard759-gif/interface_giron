'use client'

import { useState } from 'react'
import type { AirtableBase } from '@/types'
import type { AirtableRecord } from '@/components/DataTable'
import CandidatList from '@/components/CandidatList'
import CandidatDetail from '@/components/CandidatDetail'

interface Props {
  base: AirtableBase
  record: AirtableRecord
  allInscriptions: AirtableRecord[]
}

export default function InscriptionDetailScreen({ base, record, allInscriptions }: Props) {
  const [current, setCurrent] = useState<AirtableRecord>(record)

  return (
    <div style={{
      margin: '-28px -32px',
      height: 'calc(100% + 56px)',
      display: 'flex',
      overflow: 'hidden',
    }}>
      <CandidatList
        records={allInscriptions}
        selectedId={current.id}
        baseId={base.airtable_base_id}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CandidatDetail
          base={base}
          record={current}
          onRecordUpdate={setCurrent}
        />
      </div>
    </div>
  )
}
