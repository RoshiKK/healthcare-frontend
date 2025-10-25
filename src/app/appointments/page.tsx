'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { Appointment } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, Search, Loader2, Mail, Phone } from 'lucide-react'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { callApi } = useApi()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAppointments()
    }
  }, [isAuthenticated, user])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading appointments for user:', user?.email, 'Role:', user?.role)
      
      let appointmentsData
      
      if (user?.role === 'doctor') {
        // For doctors, get their appointments
        appointmentsData = await callApi('get', '/doctor/appointments')
        console.log('📋 Doctor appointments response:', appointmentsData)
      } else {
        // For patients, get appointments by email - FIXED ENDPOINT
        appointmentsData = await callApi('get', `/appointments/patient?patientEmail=${encodeURIComponent(user?.email || '')}`)
        console.log('📋 Patient appointments response:', appointmentsData)
      }
      
      // Handle different response formats
      let appointmentsList: Appointment[] = []
      
      if (Array.isArray(appointmentsData)) {
        appointmentsList = appointmentsData
      } else if (appointmentsData?.docs) {
        appointmentsList = appointmentsData.docs
      } else if (appointmentsData?.data) {
        appointmentsList = appointmentsData.data
      } else if (appointmentsData?.appointments) {
        appointmentsList = appointmentsData.appointments
      }
      
      console.log('✅ Processed appointments:', appointmentsList)
      setAppointments(appointmentsList)
    } catch (error) {
      console.error('❌ Failed to load appointments:', error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (typeof appointment.doctor !== 'string' && appointment.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Helper function to get doctor name safely
  const getDoctorName = (appointment: Appointment): string => {
    if (appointment.doctorName) {
      return appointment.doctorName;
    }
    if (typeof appointment.doctor !== 'string' && appointment.doctor?.name) {
      return appointment.doctor.name;
    }
    if (typeof appointment.doctor === 'string') {
      return 'Doctor ID: ' + appointment.doctor.substring(0, 8) + '...';
    }
    return 'Unknown Doctor';
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
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
        <h1 className="text-4xl font-bold mb-4">
          {user?.role === 'doctor' ? 'Doctor Appointments' : 'My Appointments'}
        </h1>
        <p className="text-xl text-muted-foreground">
          {user?.role === 'doctor' 
            ? 'View and manage your scheduled appointments' 
            : 'View and manage your scheduled appointments'
          }
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>
              Appointment List {appointments.length > 0 && `(${appointments.length})`}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <button
                onClick={loadAppointments}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
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
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold text-lg">{appointment.patientName}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Date:</span>
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Time:</span>
                              <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{appointment.patientEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{appointment.patientPhone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Doctor:</strong> {getDoctorName(appointment)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Symptoms:</strong> {appointment.symptoms}
                          </p>
                        </div>
                        
                        {appointment.cancellationReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                              <strong>Cancellation Reason:</strong> {appointment.cancellationReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(appointment.createdAt).toLocaleDateString()} at {new Date(appointment.createdAt).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {appointment.id.substring(0, 8)}...
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
              <div className="mt-4">
                <button
                  onClick={loadAppointments}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Check Again
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}