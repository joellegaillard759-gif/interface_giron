import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import SyncButton from './SyncButton'
import type { AirtableBase } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const adminSupabase = createAdminClient()
  const [{ data: bases }, { data: userBases }, { data: { users } }] = await Promise.all([
    adminSupabase.from('airtable_bases').select('*').order('nom'),
    adminSupabase.from('user_bases').select('base_id, user_id'),
    adminSupabase.auth.admin.listUsers(),
  ])

  const userById = Object.fromEntries((users ?? []).map(u => [u.id, u.email ?? u.id]))

  const emailsByBaseId: Record<string, string[]> = {}
  for (const ub of userBases ?? []) {
    if (!emailsByBaseId[ub.base_id]) emailsByBaseId[ub.base_id] = []
    emailsByBaseId[ub.base_id].push(userById[ub.user_id] ?? ub.user_id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Administration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Synchronise la base paramètres Airtable pour mettre à jour les bases et les accès.
          </p>
        </div>
        <SyncButton />
      </div>

      {bases && bases.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Concours</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Accès</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Synchro</th>
              </tr>
            </thead>
            <tbody>
              {bases.map((base: AirtableBase) => (
                <tr key={base.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{base.nom_concours || base.nom}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {(emailsByBaseId[base.id] ?? []).length > 0
                      ? emailsByBaseId[base.id].map(e => <div key={e}>{e}</div>)
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      base.statut === 'Clôturé'
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {base.statut ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(base.synced_at).toLocaleDateString('fr-CH', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p>Aucune base synchronisée. Clique sur Synchroniser pour commencer.</p>
        </div>
      )}
    </div>
  )
}
