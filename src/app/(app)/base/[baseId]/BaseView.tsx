'use client'

import { useState, useEffect } from 'react'
import StatusBadge from '@/components/StatusBadge'
import type { AirtableBase } from '@/types'

interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
}

export default function BaseView({ base }: { base: AirtableBase }) {
  const [records, setRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ key: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!base.table_inscription) return
    setLoading(true)
    fetch(`/api/airtable/${base.airtable_base_id}/${base.table_inscription}`)
      .then(r => r.json())
      .then(data => setRecords(data.records || []))
      .finally(() => setLoading(false))
  }, [base.airtable_base_id, base.table_inscription])

  const triggerWebhook = async (name: string, url: string) => {
    setTriggering(name)
    setFeedback(null)
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: url }),
      })
      setFeedback({ key: name, ok: res.ok })
    } catch {
      setFeedback({ key: name, ok: false })
    } finally {
      setTriggering(null)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const columns = records.length > 0 ? Object.keys(records[0].fields) : []
  const webhookEntries = Object.entries(base.webhooks || {}).filter(([, v]) => v)
  const lienEntries = Object.entries(base.liens || {}).filter(([, v]) => v)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Mes concours
        </a>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-semibold text-gray-900">{base.nom_concours || base.nom}</h1>
        <StatusBadge statut={base.statut} />
      </div>

      {(webhookEntries.length > 0 || lienEntries.length > 0) && (
        <div className="flex flex-wrap gap-6 mb-8">
          {lienEntries.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Formulaires</p>
              <div className="flex flex-wrap gap-2">
                {lienEntries.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {name} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
          {webhookEntries.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Actions</p>
              <div className="flex flex-wrap gap-2">
                {webhookEntries.map(([name, url]) => (
                  <button
                    key={name}
                    onClick={() => triggerWebhook(name, url)}
                    disabled={!!triggering}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-colors"
                  >
                    {triggering === name ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        {name}
                      </span>
                    ) : feedback?.key === name ? (
                      <span className={feedback.ok ? 'text-green-600' : 'text-red-500'}>
                        {feedback.ok ? '✓ ' : '✗ '}{name}
                      </span>
                    ) : name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Inscriptions{records.length > 0 ? ` (${records.length})` : ''}
        </p>
        {!base.table_inscription ? (
          <div className="text-gray-400 text-sm py-8 text-center">
            Aucune table d&apos;inscriptions configurée pour cette base.
          </div>
        ) : loading ? (
          <div className="text-gray-400 text-sm py-8 text-center">Chargement…</div>
        ) : records.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center">Aucune inscription.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {columns.map(col => (
                    <th key={col} className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-xs truncate">
                        {formatValue(record.fields[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non'
  if (typeof val === 'string' || typeof val === 'number') return String(val)
  if (Array.isArray(val)) {
    return val.map(v =>
      typeof v === 'object' && v !== null ? (v as Record<string, unknown>).name ?? JSON.stringify(v) : String(v)
    ).join(', ')
  }
  return JSON.stringify(val)
}
