import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = user.email === process.env.ADMIN_EMAIL

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Plateforme Giron</span>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Admin
              </a>
            )}
            <span className="text-sm text-gray-400">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
