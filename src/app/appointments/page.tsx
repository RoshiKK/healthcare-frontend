'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { Appointment } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, Search, Loader2 } from 'lucide-react'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { callApi } = useApi()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments()
    }
  }, [isAuthenticated])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      let appointmentsData
      
      if (user?.role === 'doctor') {
        // For doctors, get their appointments
        appointmentsData = await callApi('get', '/doctor/appointments')
      } else {
        // For patients, get appointments by email
        appointmentsData = await callApi('get', `/appointments?patientEmail=${user?.email}`)
      }
      
      // Handle different response formats
      if (Array.isArray(appointmentsData)) {
        setAppointments(appointmentsData)
      } else if (appointmentsData?.docs) {
        setAppointments(appointmentsData.docs)
      } else if (appointmentsData?.data) {
        setAppointments(appointmentsData.data)
      } else {
        setAppointments([])
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (typeof appointment.doctor !== 'string' && appointment.doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Helper function to get doctor name safely
  const getDoctorName = (appointment: Appointment): string => {
    if (appointment.doctorName) {
      return appointment.doctorName;
    }
    if (typeof appointment.doctor !== 'string' && appointment.doctor.name) {
      return appointment.doctor.name;
    }
    return 'Unknown Doctor';
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p>You need to be signed in to view your appointments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">My Appointments</h1>
        <p className="text-xl text-muted-foreground">
          View and manage your scheduled appointments
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>
              Appointment List {appointments.length > 0 && `(${appointments.length})`}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">{appointment.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Doctor: {getDoctorName(appointment)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'missed' || appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {appointment.patientEmail}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {appointment.patientPhone}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? 'No appointments found matching your search.' 
                : 'No appointments scheduled yet.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}