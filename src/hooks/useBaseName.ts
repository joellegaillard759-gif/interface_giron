'use client'

import { useState, useEffect } from 'react'

export function useBaseName(baseId: string | null): string | null {
  const [baseName, setBaseName] = useState<string | null>(null)

  useEffect(() => {
    if (!baseId) { setBaseName(null); return }
    fetch(`/api/base-meta/${baseId}`)
      .then(r => r.json())
      .then(d => setBaseName(d.nom_concours || d.nom || null))
      .catch(() => {})
  }, [baseId])

  return baseName
}
