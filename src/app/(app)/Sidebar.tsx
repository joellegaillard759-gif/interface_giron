'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, ShieldCheck, Music,
  Building2, Users, Trophy, Calendar, Clock, Star, FileText,
  ChevronLeft,
} from 'lucide-react'
import LogoutButton from './LogoutButton'
import { useBaseName } from '@/hooks/useBaseName'

const GLOBAL_NAV = [
  { href: '/dashboard', label: 'Mes concours', icon: LayoutDashboard },
]

const SECTION_NAV = [
  { key: 'societes',      label: 'Sociétés',      icon: Building2 },
  { key: 'candidats',     label: 'Candidats',     icon: Users },
  { key: 'concours',      label: 'Concours',      icon: Trophy },
  { key: 'planification', label: 'Planification', icon: Calendar },
  { key: 'horaires',      label: 'Horaires',      icon: Clock },
  { key: 'classements',   label: 'Classements',   icon: Star },
  { key: 'documents',     label: 'Documents',     icon: FileText },
]

interface SidebarProps {
  isAdmin: boolean
  userEmail: string
}

export default function Sidebar({ isAdmin, userEmail }: SidebarProps) {
  const pathname = usePathname()

  const baseMatch = pathname.match(/^\/base\/([^/]+)/)
  const currentBaseId = baseMatch?.[1] ?? null
  const currentSection = pathname.match(/^\/base\/[^/]+\/([^/]+)/)?.[1] ?? null
  const inBase = !!currentBaseId

  const baseName = useBaseName(currentBaseId)

  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <aside style={{
      width: '240px',
      background: 'var(--nav-bg)',
      borderRight: '1px solid var(--nav-hairline)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Music size={16} color="white" strokeWidth={1.8} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '18px', color: 'white',
            letterSpacing: '-0.01em', lineHeight: 1.1,
          }}>
            Giron
          </div>
          <div style={{
            fontSize: '10.5px', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--nav-ink-dim)', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {inBase && baseName ? baseName : 'Concours des solistes'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 10px', overflow: 'auto' }}>
        {inBase ? (
          <>
            {/* Back link */}
            <NavItem
              href="/dashboard"
              label="Mes concours"
              icon={<ChevronLeft size={16} strokeWidth={1.6} />}
              active={false}
            />
            <div style={{ height: '1px', background: 'var(--nav-hairline)', margin: '8px 0' }} />

            <div style={{
              fontSize: '10.5px', textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--nav-ink-dim)',
              fontWeight: 600, padding: '6px 4px 4px',
            }}>
              Sections
            </div>

            {SECTION_NAV.map(({ key, label, icon: Icon }) => (
              <NavItem
                key={key}
                href={`/base/${currentBaseId}/${key}`}
                label={label}
                icon={<Icon size={16} strokeWidth={1.6} />}
                active={currentSection === key || (!currentSection && key === 'candidats' && pathname === `/base/${currentBaseId}`)}
              />
            ))}
          </>
        ) : (
          <>
            <div style={{
              fontSize: '10.5px', textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--nav-ink-dim)',
              fontWeight: 600, padding: '10px 4px 6px',
            }}>
              Navigation
            </div>

            {GLOBAL_NAV.map(({ href, label, icon: Icon }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                icon={<Icon size={16} strokeWidth={1.6} />}
                active={pathname === href || pathname.startsWith('/base/')}
              />
            ))}

            {isAdmin && (
              <NavItem
                href="/admin"
                label="Administration"
                icon={<ShieldCheck size={16} strokeWidth={1.6} />}
                active={pathname === '/admin' || pathname.startsWith('/admin/')}
              />
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--nav-hairline)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--ink-700)',
          display: 'grid', placeItems: 'center',
          fontSize: '11px', fontWeight: 600, color: 'white',
          flexShrink: 0, letterSpacing: '0.02em',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '12px', color: 'var(--nav-ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {userEmail}
          </div>
        </div>
        <LogoutButton compact />
      </div>
    </aside>
  )
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 10px', borderRadius: 'var(--r-sm)',
        fontSize: '13.5px',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--nav-active-ink)' : 'var(--nav-ink)',
        background: active ? 'var(--nav-active-bg)' : 'transparent',
        textDecoration: 'none', position: 'relative',
        transition: 'all 0.12s cubic-bezier(.2,.7,.3,1)',
        marginBottom: '1px',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--nav-active-bg)'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--nav-active-ink)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--nav-ink)'
        }
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '8px', bottom: '8px',
          width: '2px', background: 'var(--accent)', borderRadius: '1px',
        }} />
      )}
      <span style={{ opacity: active ? 1 : 0.85, flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  )
}
