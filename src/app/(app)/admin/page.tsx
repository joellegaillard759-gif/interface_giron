import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ADMIN_EMAIL } from '@/lib/config'
import StatusBadge from '@/components/StatusBadge'
import SyncButton from './SyncButton'
import InviteButton from './InviteButton'
import type { AirtableBase } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const adminSupabase = createAdminClient()
  const { data: bases } = await adminSupabase
    .from('airtable_bases')
    .select('*')
    .order('nom')

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
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <a href={`/base/${base.airtable_base_id}`} className="hover:text-blue-600 hover:underline">
                      {base.nom_concours || base.nom}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <InviteButton baseId={base.id} emails={base.access_emails ?? []} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={base.statut} />
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
