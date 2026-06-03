import { redirect } from 'next/navigation'
import { getBase } from '@/lib/getBase'
import BaseView from '../BaseView'

const VALID_SECTIONS = ['societes', 'candidats', 'concours', 'planification', 'horaires', 'classements', 'documents']

export default async function SectionPage({
  params,
}: {
  params: Promise<{ baseId: string; section: string }>
}) {
  const { baseId, section } = await params
  if (!VALID_SECTIONS.includes(section)) redirect(`/base/${baseId}`)
  const base = await getBase(baseId)
  return <BaseView base={base} section={section} />
}
