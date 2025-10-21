'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from '@/types'
import { Calendar, Clock, MapPin, Star, Award, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DoctorCardProps {
  doctor: User
  index: number
}

export function DoctorCard({ doctor, index }: DoctorCardProps) {
  const doctorId = doctor.id || doctor._id
  const rating = (Math.random() * 1 + 4).toFixed(1)
  const reviewCount = Math.floor(Math.random() * 100) + 10
  const experience = Math.floor(Math.random() * 15) + 5

  if (!doctorId) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
        
        <CardContent className="p-6 flex-1 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {doctor.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {doctor.specialization}
                </span>
              </div>
            </div>
            
            {doctor.isActive === false && (
              <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap">
                Not Available
              </span>
            )}
          </div>

          {/* Experience & Rating */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white/50 rounded-lg border border-blue-100">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{experience}+</div>
              <div className="text-xs text-gray-600">Years</div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-bold text-gray-900">{rating}</span>
              </div>
              <div className="text-xs text-gray-600">{reviewCount} reviews</div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Mon - Fri</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">9:00 AM - 5:00 PM</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Available Online</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4 mt-auto">
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
              disabled={doctor.isActive === false}
              size="lg"
            >
              <Link href={`/book/${doctorId}`} className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                {doctor.isActive !== false ? 'Book Appointment' : 'Not Available'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}