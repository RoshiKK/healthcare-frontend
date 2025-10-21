import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Appointment } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react'

interface AppointmentCardProps {
  appointment: Appointment
  onStatusUpdate?: (appointmentId: string, status: string) => void
}

export function AppointmentCard({ appointment, onStatusUpdate }: AppointmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{appointment.patientName}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            appointment.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : appointment.status === 'missed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {appointment.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(appointment.date)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.patientEmail}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.patientPhone}</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Symptoms:</p>
          <p className="text-sm">{appointment.symptoms}</p>
        </div>
        
        {onStatusUpdate && appointment.status === 'pending' && (
          <div className="flex space-x-2 pt-4">
            <Button
              size="sm"
              onClick={() => onStatusUpdate(appointment.id, 'completed')}
            >
              Mark Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate(appointment.id, 'missed')}
            >
              Mark Missed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}