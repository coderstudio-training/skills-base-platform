// app/dashboard/admin/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import { logger } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  logger.log("Server-side session:", session)

  if (!session) {
    logger.log("No session, redirecting to login")
    redirect('/admin-login?error=Unauthenticated')
  }

  if (session.user.role !== 'admin') {
    logger.log("User is not admin, redirecting to unauthorized")
    redirect('/unauthorized')
  }

  logger.log("Rendering AdminDashboard")
  return <AdminDashboard />
}
