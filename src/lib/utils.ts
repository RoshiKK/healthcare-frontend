import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const period = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${period}`
}

export function generateTimeSlots(start: string, end: string, interval: number): { startTime: string; endTime: string }[] {
  const slots = []
  let current = new Date(`1970-01-01T${start}:00`)
  const endTime = new Date(`1970-01-01T${end}:00`)
  
  while (current < endTime) {
    const startTime = current.toTimeString().substring(0, 5)
    current = new Date(current.getTime() + interval * 60000)
    const endTimeStr = current.toTimeString().substring(0, 5)
    
    slots.push({ startTime, endTime: endTimeStr })
  }
  
  return slots
}