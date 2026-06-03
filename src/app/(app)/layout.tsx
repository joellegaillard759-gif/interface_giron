import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <div className="app-shell">
      <Sidebar isAdmin={isAdmin} userEmail={user.email ?? ''} />
      <div className="app-canvas">
        <Topbar userEmail={user.email ?? ''} />
        <main className="app-scroll">
          {children}
        </main>
      </div>
    </div>
  )
}
