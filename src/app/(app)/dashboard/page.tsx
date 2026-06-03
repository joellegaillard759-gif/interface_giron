import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { AirtableBase } from '@/types'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

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
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">Aucune base disponible pour ton compte.</p>
        <p className="text-sm mt-1">Contacte l&apos;administrateur pour obtenir un accès.</p>
      </div>
    )
  }

  // Si une seule base, redirection directe
  if (bases.length === 1) {
    redirect(`/base/${bases[0].airtable_base_id}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mes concours</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bases.map((base: AirtableBase) => (
          <a
            key={base.id}
            href={`/base/${base.airtable_base_id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">{base.nom_concours || base.nom}</span>
              <StatusBadge statut={base.statut} />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ statut }: { statut: string | null }) {
  const colors: Record<string, string> = {
    'Clôturé': 'bg-gray-100 text-gray-500',
    'En cours': 'bg-green-100 text-green-700',
    'Inscriptions ouvertes': 'bg-blue-100 text-blue-700',
  }
  const color = statut ? colors[statut] ?? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-500'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {statut ?? '—'}
    </span>
  )
}
