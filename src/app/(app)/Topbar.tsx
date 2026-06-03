'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useBaseName } from '@/hooks/useBaseName'

const SECTION_LABELS: Record<string, string> = {
  societes: 'Sociétés',
  inscriptions: 'Inscriptions',
  concours: 'Concours',
  planification: 'Planification',
  horaires: 'Horaires',
  classements: 'Classements',
  documents: 'Documents',
}

interface TopbarProps {
  userEmail: string
}

export default function Topbar({ userEmail }: TopbarProps) {
  const pathname = usePathname()

  const baseMatch = pathname.match(/^\/base\/([^/]+)/)
  const currentBaseId = baseMatch?.[1] ?? null
  const currentSection = pathname.match(/^\/base\/[^/]+\/([^/]+)/)?.[1] ?? null

  const baseName = useBaseName(currentBaseId)

  const initials = userEmail.slice(0, 2).toUpperCase()

  type Crumb = { label: string; href?: string }
  let crumbs: Crumb[] = []

  if (pathname === '/dashboard') {
    crumbs = [{ label: 'Mes concours' }]
  } else if (pathname.startsWith('/admin')) {
    crumbs = [{ label: 'Administration' }]
  } else if (currentBaseId) {
    crumbs = [{ label: 'Mes concours', href: '/dashboard' }]
    if (currentSection) {
      crumbs.push({ label: baseName ?? '…', href: `/base/${currentBaseId}` })
      crumbs.push({ label: SECTION_LABELS[currentSection] ?? currentSection })
    } else {
      crumbs.push({ label: baseName ?? '…' })
    }
  }

  return (
    <header style={{
      height: '60px',
      background: 'var(--paper)',
      borderBottom: '1px solid var(--hairline)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      flexShrink: 0,
    }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i > 0 && (
              <span style={{ color: 'var(--ink-300)', fontSize: '13px' }}>/</span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                style={{ color: 'var(--ink-500)', fontSize: '13px', textDecoration: 'none' }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: 'var(--ink-900)', fontSize: '13px', fontWeight: 600 }}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: 'var(--ink-700)',
        display: 'grid',
        placeItems: 'center',
        fontSize: '11px',
        fontWeight: 600,
        color: 'white',
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}>
        {initials}
      </div>
    </header>
  )
}
