'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        title="Déconnexion"
        style={{
          display: 'grid', placeItems: 'center',
          width: '28px', height: '28px',
          background: 'transparent', border: 'none',
          borderRadius: 'var(--r-sm)',
          color: 'var(--nav-ink-dim)',
          cursor: 'pointer',
          transition: 'all 0.12s cubic-bezier(.2,.7,.3,1)',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--nav-ink-dim)' }}
      >
        <LogOut size={14} strokeWidth={1.6} />
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
    >
      Déconnexion
    </button>
  )
}
