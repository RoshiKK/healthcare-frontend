'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DoctorDashboard } from '@/components/dashboard/doctor-dashboard'
import { useAuth } from '@/hooks/use-auth'

export default function DoctorPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'doctor')) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null
  }

  return <DoctorDashboard />
}