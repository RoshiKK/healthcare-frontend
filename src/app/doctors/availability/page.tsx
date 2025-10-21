'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { TimeSlot } from '@/types'
import { generateTimeSlots } from '@/lib/utils'

export default function AvailabilityPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const router = useRouter()
  const { callApi, isLoading } = useApi()
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [existingAvailability, setExistingAvailability] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'doctor')) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user, router])

  useEffect(() => {
    if (selectedDate) {
      loadAvailability()
      // Generate default slots if no existing availability
      if (!existingAvailability) {
        const defaultSlots = generateTimeSlots('09:00', '17:00', 30)
        setSlots(defaultSlots.map(slot => ({ ...slot, available: true })))
      }
    }
  }, [selectedDate])

  const loadAvailability = async () => {
    try {
      const availability = await callApi('get', `/availability?doctorId=${user?.id}&date=${selectedDate}`)
      setExistingAvailability(availability)
      if (availability.slots && availability.slots.length > 0) {
        setSlots(availability.slots)
      }
    } catch (error) {
      console.error('Failed to load availability:', error)
    }
  }

  const toggleSlot = (index: number) => {
    const newSlots = [...slots]
    newSlots[index].available = !newSlots[index].available
    setSlots(newSlots)
  }

  const saveAvailability = async () => {
    try {
      await callApi('post', '/availability', {
        date: selectedDate,
        slots
      })
      alert('Availability saved successfully!')
    } catch (error) {
      console.error('Failed to save availability:', error)
      alert('Failed to save availability')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Set Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border rounded-md"
              />
            </div>

            {selectedDate && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Time Slots (Click to toggle availability)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={slot.available ? "default" : "outline"}
                        onClick={() => toggleSlot(index)}
                      >
                        {slot.startTime} - {slot.endTime}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={saveAvailability} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Availability'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}