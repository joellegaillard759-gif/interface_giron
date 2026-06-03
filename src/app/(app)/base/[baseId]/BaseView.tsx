'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AirtableRecord | null>(null)

  const sectionConfig = SECTIONS.find(s => s.key === section)
  const tableId = sectionConfig ? (base[sectionConfig.tableKey] as string | null) : null
  const sectionLabel = sectionConfig?.label ?? section

  const fetchRecords = useCallback(async () => {
    if (!tableId) return
    setLoading(true)
    setError(null)
    setRecords([])
    try {
      let all: AirtableRecord[] = []
      let offset: string | undefined
      do {
        const url = `/api/airtable/${base.airtable_base_id}/${tableId}?pageSize=100${offset ? `&offset=${offset}` : ''}`
        const res = await fetch(url)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const msg = body?.error?.message ?? body?.error ?? `Erreur ${res.status}`
          setError(msg)
          break
        }
        const data = await res.json()
        if (data.error) {
          setError(data.error?.message ?? JSON.stringify(data.error))
          break
        }
        all = all.concat(data.records ?? [])
        offset = data.offset
      } while (offset)
      setRecords(all)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [base.airtable_base_id, tableId])

  useEffect(() => {
    setSelected(null)
    fetchRecords()
  }, [fetchRecords])

  return (
    <div style={{
      margin: '-28px -32px',
      height: 'calc(100% + 56px)',
      display: 'grid',
      gridTemplateColumns: selected ? '1fr 380px' : '1fr',
      transition: 'grid-template-columns 0.2s cubic-bezier(.2,.7,.3,1)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 className="h1">{sectionLabel}</h1>
          {!loading && records.length > 0 && (
            <span className="tag">{records.length}</span>
          )}
          <StatusBadge statut={base.statut} />
        </div>

        {!tableId ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-400)', fontSize: '13px' }}>
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
      </div>

      {selected && <DetailPanel record={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
