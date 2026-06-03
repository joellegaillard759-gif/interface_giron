const COLORS: Record<string, string> = {
  'En cours': 'bg-green-100 text-green-700',
  'Inscriptions ouvertes': 'bg-blue-100 text-blue-700',
}

export default function StatusBadge({ statut }: { statut: string | null }) {
  if (!statut || statut === 'Clôturé') return null
  const color = COLORS[statut] ?? 'bg-gray-100 text-gray-500'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {statut}
    </span>
  )
}
