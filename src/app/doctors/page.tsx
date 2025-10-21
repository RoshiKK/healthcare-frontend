'use client'

import { DoctorsList } from '@/components/doctors/doctors-list'

export default function DoctorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Doctors</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Meet our team of experienced healthcare professionals dedicated to your well-being.
        </p>
      </div>
      
      <DoctorsList />
    </div>
  )
}