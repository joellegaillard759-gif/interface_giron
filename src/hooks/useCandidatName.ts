'use client'

import { useState, useEffect } from 'react'

export function useCandidatName(
  baseId: string | null,
  recordId: string | null
): string | null {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    if (!baseId || !recordId) { setName(null); return }
    let cancelled = false

    fetch(`/api/base-meta/${baseId}`)
      .then(r => r.json())
      .then(async (base: { table_inscription?: string }) => {
        if (cancelled || !base.table_inscription) return
        const res = await fetch(`/api/airtable/${baseId}/${base.table_inscription}/${recordId}`)
        const rec = await res.json()
        if (cancelled) return
        const raw = String(rec.fields?.['Candidat.e'] ?? rec.fields?.['Nom'] ?? '')
        if (!raw || raw === 'undefined') return
        const parts = raw.split(',').map((s: string) => s.trim())
        setName(parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [baseId, recordId])

  return name
}
