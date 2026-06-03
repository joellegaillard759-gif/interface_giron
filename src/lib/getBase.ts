import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAIL } from '@/lib/config'
import { redirect } from 'next/navigation'
import type { AirtableBase } from '@/types'

export async function getBase(baseId: string): Promise<AirtableBase> {
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

  return base as AirtableBase
}
