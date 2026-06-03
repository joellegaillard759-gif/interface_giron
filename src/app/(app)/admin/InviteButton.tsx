'use client'

import { useState } from 'react'

export default function InviteButton({ baseId, emails }: { baseId: string; emails: string[] }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleInvite() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/invite/${baseId}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResult(data.invited > 0 ? `✓ ${data.invited} invitation(s) envoyée(s)` : data.message ?? '✓ Accès déjà configurés')
      } else {
        setResult(`Erreur : ${data.error}`)
      }
    } catch (e) {
      setResult(`Erreur réseau`)
    }
    setLoading(false)
  }

  if (emails.length === 0) {
    return <span className="text-xs text-gray-300">—</span>
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-gray-500 space-y-0.5">
        {emails.map(e => <div key={e}>{e}</div>)}
      </div>
      <button
        onClick={handleInvite}
        disabled={loading}
        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 text-left"
      >
        {loading ? 'Envoi…' : 'Inviter'}
      </button>
      {result && <p className="text-xs text-gray-400">{result}</p>}
    </div>
  )
}
