'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Building2, Users, Trophy, Calendar, Clock, Star, FileText } from 'lucide-react'
import DataTable from '@/components/DataTable'
import DetailPanel from '@/components/DetailPanel'
import StatusBadge from '@/components/StatusBadge'
import type { AirtableBase } from '@/types'
import type { AirtableRecord } from '@/components/DataTable'

type TableKey = 'table_societes' | 'table_inscription' | 'table_concours' | 'table_passages' | 'table_document'

const SECTIONS: Array<{ key: string; label: string; icon: React.ElementType; tableKey: TableKey }> = [
  { key: 'societes',      label: 'Sociétés',      icon: Building2, tableKey: 'table_societes' },
  { key: 'candidats',     label: 'Candidats',     icon: Users,     tableKey: 'table_inscription' },
  { key: 'concours',      label: 'Concours',      icon: Trophy,    tableKey: 'table_concours' },
  { key: 'planification', label: 'Planification', icon: Calendar,  tableKey: 'table_concours' },
  { key: 'horaires',      label: 'Horaires',      icon: Clock,     tableKey: 'table_passages' },
  { key: 'classements',   label: 'Classements',   icon: Star,      tableKey: 'table_inscription' },
  { key: 'documents',     label: 'Documents',     icon: FileText,  tableKey: 'table_document' },
]

interface BaseViewProps {
  base: AirtableBase
  section: string
}

export default function BaseView({ base, section }: BaseViewProps) {
  const [records, setRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<AirtableRecord | null>(null)

  const sectionConfig = SECTIONS.find(s => s.key === section)
  const tableId = sectionConfig ? (base[sectionConfig.tableKey] as string | null) : null
  const sectionLabel = sectionConfig?.label ?? section

  const fetchRecords = useCallback(async () => {
    if (!tableId) return
    setLoading(true)
    setRecords([])
    try {
      let all: AirtableRecord[] = []
      let offset: string | undefined
      do {
        const url = `/api/airtable/${base.airtable_base_id}/${tableId}?pageSize=100${offset ? `&offset=${offset}` : ''}`
        const res = await fetch(url)
        if (!res.ok) break
        const data = await res.json()
        all = all.concat(data.records ?? [])
        offset = data.offset
      } while (offset)
      setRecords(all)
    } finally {
      setLoading(false)
    }
  }, [base.airtable_base_id, tableId])

  useEffect(() => {
    setSelected(null)
    fetchRecords()
  }, [fetchRecords])

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Link href="/dashboard" style={{ color: 'var(--ink-500)', fontSize: '13px', textDecoration: 'none' }}>
            Mes concours
          </Link>
          <span style={{ color: 'var(--ink-300)', fontSize: '13px' }}>/</span>
          <Link href={`/base/${base.airtable_base_id}`} style={{ color: 'var(--ink-500)', fontSize: '13px', textDecoration: 'none' }}>
            {base.nom_concours || base.nom}
          </Link>
          <span style={{ color: 'var(--ink-300)', fontSize: '13px' }}>/</span>
          <span style={{ color: 'var(--ink-900)', fontSize: '13px', fontWeight: 600 }}>{sectionLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 className="h1">{sectionLabel}</h1>
          {!loading && records.length > 0 && (
            <span className="tag">{records.length}</span>
          )}
          <StatusBadge statut={base.statut} />
        </div>
      </div>

      {!tableId ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px' }}>
          Table non configurée pour cette section.
        </div>
      ) : (
        <DataTable
          records={records}
          loading={loading}
          onRowClick={setSelected}
          selectedId={selected?.id}
        />
      )}

      <DetailPanel record={selected} onClose={() => setSelected(null)} />
    </>
  )
}
