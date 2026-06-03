'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div className="card" style={{ maxWidth: '380px', width: '100%', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
          <h2 className="h3" style={{ marginBottom: '8px' }}>Lien envoyé</h2>
          <p className="small" style={{ color: 'var(--ink-500)' }}>
            Vérifie ta boîte mail ({email}) et clique sur le lien pour te connecter.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
      <div className="card" style={{ maxWidth: '380px', width: '100%', padding: '32px' }}>
        <h1 className="h-display" style={{ marginBottom: '4px' }}>Plateforme Giron</h1>
        <p className="eyebrow" style={{ marginBottom: '24px', color: 'var(--ink-500)' }}>
          Entre ton email pour recevoir un lien de connexion
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.ch"
            required
            className="input"
            style={{ width: '100%' }}
          />
          {error && <p className="small" style={{ color: 'var(--accent)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Envoi…' : 'Recevoir le lien'}
          </button>
        </form>
      </div>
    </main>
  )
}
