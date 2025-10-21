'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/use-api'
import { Appointment } from '@/types'
import { Calendar, Clock, RotateCcw, X, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface AppointmentActionsProps {
  appointment: Appointment
  onUpdate: () => void
  userRole: 'admin' | 'doctor' | 'patient'
}

export function AppointmentActions({ appointment, onUpdate, userRole }: AppointmentActionsProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const { callApi, isLoading } = useApi()

  const canCancel = ['pending', 'confirmed'].includes(appointment.status) && 
                   (userRole === 'admin' || userRole === 'patient')
  const canReschedule = ['pending', 'confirmed'].includes(appointment.status) && 
                       (userRole === 'admin' || userRole === 'patient')
  const canUpdateStatus = userRole === 'doctor' && appointment.status === 'confirmed'

  const handleCancel = async () => {
    try {
      await callApi('patch', `/appointments/${appointment.id}/cancel`, {
        cancellationReason
      })
      setIsCancelDialogOpen(false)
      setCancellationReason('')
      onUpdate()
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  const handleReschedule = async () => {
    try {
      await callApi('patch', `/appointments/${appointment.id}/reschedule`, {
        newDate,
        newStartTime,
        newEndTime: calculateEndTime(newStartTime)
      })
      setIsRescheduleDialogOpen(false)
      setNewDate('')
      setNewStartTime('')
      onUpdate()
    } catch (error) {
      console.error('Failed to reschedule appointment:', error)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await callApi('patch', `/appointments/${appointment.id}/status`, {
        status: newStatus
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to update appointment status:', error)
    }
  }

  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endTime = new Date(0, 0, 0, hours, minutes + 30)
    return endTime.toTimeString().slice(0, 5)
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Cancel Appointment Dialog */}
      {canCancel && (
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{appointment.patientName}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(appointment.date)} at {formatTime(appointment.startTime)}
                </p>
                <p className="text-sm text-gray-600">Dr. {typeof appointment.doctor !== 'string' ? appointment.doctor.name : 'Unknown'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationReason">Reason for cancellation (optional)</Label>
                <Textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Keep Appointment
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reschedule Appointment Dialog */}
      {canReschedule && (
        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reschedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Choose a new date and time for your appointment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">New Date</Label>
                <input
                  type="date"
                  id="newDate"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newStartTime">New Time</Label>
                <select
                  id="newStartTime"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a time</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={isLoading || !newDate || !newStartTime}
              >
                {isLoading ? 'Rescheduling...' : 'Reschedule Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Doctor Status Updates */}
      {canUpdateStatus && (
        <>
          <Button
            size="sm"
            onClick={() => handleStatusUpdate('completed')}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate('missed')}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Mark Missed
          </Button>
        </>
      )}

      {/* Status Badge */}
      <span className={`px-2 py-1 rounded-full text-xs ${
        appointment.status === 'completed'
          ? 'bg-green-100 text-green-800'
          : appointment.status === 'cancelled'
          ? 'bg-red-100 text-red-800'
          : appointment.status === 'missed'
          ? 'bg-orange-100 text-orange-800'
          : appointment.status === 'confirmed'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {appointment.status}
      </span>
    </div>
  )
}