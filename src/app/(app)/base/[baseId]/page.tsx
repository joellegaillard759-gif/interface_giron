import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ADMIN_EMAIL } from '@/lib/config'
import BaseView from './BaseView'

export default async function BasePage({
  params,
}: {
  params: Promise<{ baseId: string }>
}) {
  const { baseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.email === ADMIN_EMAIL
  const client = isAdmin ? createAdminClient() : supabase

  const { data: base } = await client
    .from('airtable_bases')
    .select('*')
    .eq('airtable_base_id', baseId)
    .single()

  if (!base) redirect('/dashboard')

  if (!isAdmin) {
    const { data: access } = await supabase
      .from('user_bases')
      .select('base_id')
      .eq('user_id', user.id)
      .eq('base_id', base.id)
      .single()
    if (!access) redirect('/dashboard')
  }

  return <BaseView base={base} />
}
