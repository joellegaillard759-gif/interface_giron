import { getBase } from '@/lib/getBase'
import DashboardConcours from './DashboardConcours'

export default async function BasePage({
  params,
}: {
  params: Promise<{ baseId: string }>
}) {
  const { baseId } = await params
  const base = await getBase(baseId)
  return <DashboardConcours base={base} />
}
