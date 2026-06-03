import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: Promise<{ baseId: string }> }) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response
    const { adminSupabase } = guard

    const { baseId } = await params

    const { data: base, error: baseError } = await adminSupabase
      .from('airtable_bases')
      .select('id, access_emails')
      .eq('id', baseId)
      .single()

    if (baseError || !base) {
      return NextResponse.json({ error: 'Base introuvable' }, { status: 404 })
    }

    const emails: string[] = base.access_emails ?? []
    if (emails.length === 0) {
      return NextResponse.json({ ok: true, invited: 0, message: 'Aucun email configuré pour cette base' })
    }

    const { data: { users: allUsers } } = await adminSupabase.auth.admin.listUsers()
    let invited = 0

    for (const email of emails) {
      let targetUser = allUsers.find((u) => u.email === email)

      if (!targetUser) {
        const { data } = await adminSupabase.auth.admin.inviteUserByEmail(email)
        targetUser = data?.user ?? undefined
        if (targetUser) invited++
      }

      if (targetUser) {
        await adminSupabase
          .from('user_bases')
          .upsert({ user_id: targetUser.id, base_id: base.id })
      }
    }

    return NextResponse.json({ ok: true, invited })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
