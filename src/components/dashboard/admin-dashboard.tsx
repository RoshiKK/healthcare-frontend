'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApi } from '@/hooks/use-api'
import { User, Appointment } from '@/types'
import { formatDate } from '@/lib/utils'
import {
  Users,
  Calendar,
  Stethoscope,
  TrendingUp,
  Clock,
  Search,
  Plus,
  Filter
} from 'lucide-react'
import { DoctorManagement } from '@/components/admin/doctor-management'

interface AdminStats {
  totalDoctors: number
  activeDoctors: number
  totalAppointments: number
  recentAppointments: Appointment[]
  topSpecializations: { _id: string; count: number }[]
}

export function AdminDashboard() {
  const { callApi, isLoading } = useApi()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [doctors, setDoctors] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'doctors'>('stats')

  useEffect(() => {
    loadStats()
    loadDoctors()
  }, [])

  const loadStats = async () => {
    try {
      const statsData = await callApi('get', '/admin/stats')
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadDoctors = async () => {
    try {
      const doctorsData = await callApi('get', '/admin/doctors')
      setDoctors(doctorsData.docs || doctorsData || [])
    } catch (error) {
      console.error('Failed to load doctors:', error)
    }
  }

  const toggleDoctorStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      await callApi('patch', `/admin/doctors/${doctorId}/status`, {
        isActive: !currentStatus
      })
      loadDoctors() // Reload doctors list
      loadStats() // Reload stats
    } catch (error) {
      console.error('Failed to update doctor status:', error)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !specializationFilter || 
                                doctor.specialization === specializationFilter
    return matchesSearch && matchesSpecialization
  })

  const specializations = Array.from(
    new Set(doctors.map(doc => doc.specialization).filter(Boolean)) as Set<string>
  )

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'stats' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('stats')}
        >
          Dashboard Overview
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'doctors' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('doctors')}
        >
          Manage Doctors
        </button>
      </div>

      {activeTab === 'stats' ? (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDoctors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeDoctors || 0} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeDoctors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalDoctors ? Math.round((stats.activeDoctors / stats.totalDoctors) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Specialty</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.topSpecializations?.[0]?._id || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.topSpecializations?.[0]?.count || 0} doctors
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Appointments and Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentAppointments?.length ? (
                  <div className="space-y-4">
                    {stats.recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(appointment.date)} at {appointment.startTime}
                          </p>
                          <p className="text-sm">{appointment.symptoms}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'missed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent appointments</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topSpecializations?.length ? (
                  <div className="space-y-3">
                    {stats.topSpecializations.map((spec) => (
                      <div key={spec._id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{spec._id}</span>
                        <span className="text-sm text-muted-foreground bg-blue-100 px-2 py-1 rounded-full">
                          {spec.count} doctors
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specialization data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Doctors Overview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <CardTitle>Doctors Overview</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <select
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Specializations</option>
                    {Array.from(specializations).map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDoctors.length > 0 ? (
                <div className="border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredDoctors.map((doctor) => (
                      <div key={doctor.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doctor.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.email}</p>
                        <p className="text-sm">{doctor.specialization}</p>
                        <Button
                          variant={doctor.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleDoctorStatus(doctor.id, doctor.isActive!)}
                        >
                          {doctor.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No doctors found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Doctors Management Tab */
        <Card>
          <CardHeader>
            <CardTitle>Doctors Management</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorManagement doctors={doctors} onDoctorsUpdate={loadDoctors} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}