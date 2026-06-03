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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="h1">Administration</h1>
          <p className="lead" style={{ marginTop: '4px' }}>
            Synchronise la base paramètres Airtable pour mettre à jour les bases et les accès.
          </p>
        </div>
        <SyncButton />
      </div>

      {bases && bases.length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Concours</th>
                <th>Accès</th>
                <th>Statut</th>
                <th>Synchro</th>
              </tr>
            </thead>
            <tbody>
              {bases.map((base: AirtableBase) => (
                <tr key={base.id}>
                  <td style={{ fontWeight: 500, color: 'var(--ink-900)' }}>
                    <a
                      href={`/base/${base.airtable_base_id}`}
                      style={{ color: 'var(--info)', textDecoration: 'none' }}
                    >
                      {base.nom_concours || base.nom}
                    </a>
                  </td>
                  <td>
                    <InviteButton baseId={base.id} emails={base.access_emails ?? []} />
                  </td>
                  <td>
                    <StatusBadge statut={base.statut} />
                  </td>
                  <td className="small" style={{ color: 'var(--ink-400)' }}>
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
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ color: 'var(--ink-400)' }}>Aucune base synchronisée. Clique sur Synchroniser pour commencer.</p>
        </div>
      )}
    </div>
  )
}
