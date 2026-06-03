'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
      <div className="card" style={{ maxWidth: '380px', width: '100%', padding: '32px' }}>
        <h1 className="h-display" style={{ marginBottom: '4px' }}>Plateforme Giron</h1>
        <p className="eyebrow" style={{ marginBottom: '24px', color: 'var(--ink-500)' }}>
          Connexion
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
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
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}
