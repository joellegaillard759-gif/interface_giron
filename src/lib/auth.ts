import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { ADMIN_EMAIL } from './config'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Non autorisé' }, { status: 403 }),
    }
  }
  return { ok: true as const, adminSupabase: createAdminClient() }
}
