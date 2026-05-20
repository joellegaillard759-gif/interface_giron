'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/sync', { method: 'POST' })
    const data = await res.json()

    if (res.ok) {
      setResult(`✓ ${data.created} créées, ${data.updated} mises à jour, ${data.usersCreated} invitations envoyées`)
      router.refresh()
    } else {
      setResult(`Erreur : ${data.error}`)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Synchronisation…' : 'Synchroniser'}
      </button>
      {result && <p className="text-xs text-gray-500">{result}</p>}
    </div>
  )
}
