import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ManagerDashboard from '@/components/dashboard/ManagerDashboard'
import { getManagerData } from '@/lib/api'

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'manager') {
    redirect('/api/auth/signin')
  }

  const managerData = await getManagerData(session.user.id)

  return <ManagerDashboard initialData={managerData} />
}
