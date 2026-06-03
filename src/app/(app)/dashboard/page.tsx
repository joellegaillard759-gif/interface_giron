import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ADMIN_EMAIL } from '@/lib/config'
import StatusBadge from '@/components/StatusBadge'
import type { AirtableBase } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.email === ADMIN_EMAIL
  const client = isAdmin ? createAdminClient() : supabase

  const { data: bases } = await client
    .from('airtable_bases')
    .select('*')
    .eq('actif', true)
    .order('nom')

  if (!bases || bases.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--ink-400)', fontSize: '15px' }}>Aucune base disponible pour ton compte.</p>
        <p className="small" style={{ color: 'var(--ink-400)', marginTop: '4px' }}>
          Contacte l&apos;administrateur pour obtenir un accès.
        </p>
      </div>
    )
  }

  if (bases.length === 1) {
    redirect(`/base/${bases[0].airtable_base_id}`)
  }

  return (
    <div>
      <h1 className="h1" style={{ marginBottom: '24px' }}>Mes concours</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bases.map((base: AirtableBase) => (
          <a
            key={base.id}
            href={`/base/${base.airtable_base_id}`}
            className="card hover:border-[var(--accent)]"
            style={{ display: 'block', padding: '20px', textDecoration: 'none', transition: 'all 0.12s cubic-bezier(.2,.7,.3,1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <span className="h3">{base.nom_concours || base.nom}</span>
              <StatusBadge statut={base.statut} />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
