'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { DoctorCard } from '@/components/doctors/doctor-card'
import { useApi } from '@/hooks/use-api'
import { User } from '@/types'
import { Search, Filter, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SPECIALIZATIONS } from '@/lib/constants'

export function DoctorsList() {
  const [doctors, setDoctors] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { callApi } = useApi()

  useEffect(() => {
    loadDoctors()
  }, [searchTerm, specialization])

  const loadDoctors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (specialization && specialization !== 'all') params.append('specialization', specialization)
      
      const queryString = params.toString()
      const url = queryString ? `/doctors?${queryString}` : '/doctors'
      
      console.log('Loading doctors from:', url)
      
      // FIXED: Handle the response properly
      const response = await callApi('get', url)
      
      console.log('API Response:', response)
      
      // Handle different response formats
      let doctorsData: User[] = []
      
      if (Array.isArray(response)) {
        doctorsData = response
      } else if (response && typeof response === 'object') {
        // Handle ApiResponse format
        if (response.data && Array.isArray(response.data)) {
          doctorsData = response.data
        } else if (response.docs && Array.isArray(response.docs)) {
          doctorsData = response.docs
        } else if (Array.isArray(response)) {
          doctorsData = response
        }
      }
      
      // Ensure each doctor has proper id field
      const transformedDoctors = doctorsData.map(doctor => ({
        ...doctor,
        id: doctor.id || doctor._id || Math.random().toString(36).substr(2, 9),
        _id: doctor._id || doctor.id
      }))
      
      setDoctors(transformedDoctors)
    } catch (error: any) {
      console.error('Failed to load doctors:', error)
      setError(error.message || 'Failed to load doctors')
      setDoctors([])
      
      // Try public endpoint as fallback
      try {
        console.log('Trying public endpoint as fallback...')
        const publicResponse = await callApi('get', '/public/doctors')
        let publicDoctors: User[] = []
        
        if (Array.isArray(publicResponse)) {
          publicDoctors = publicResponse
        } else if (publicResponse?.data && Array.isArray(publicResponse.data)) {
          publicDoctors = publicResponse.data
        }
        
        if (publicDoctors.length > 0) {
          const transformedDoctors = publicDoctors.map(doctor => ({
            ...doctor,
            id: doctor.id || doctor._id || Math.random().toString(36).substr(2, 9),
            _id: doctor._id || doctor.id
          }))
          setDoctors(transformedDoctors)
          setError(null)
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg border"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors by name, specialty, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Specializations</option>
          {SPECIALIZATIONS.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('')
            setSpecialization('all')
          }}
          className="whitespace-nowrap"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-800">{error}</p>
          <Button 
            onClick={loadDoctors} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Retry
          </Button>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
          <span>Loading doctors...</span>
        </motion.div>
      )}

      {/* Doctors Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {doctors.map((doctor, index) => (
              <motion.div key={doctor.id} variants={item}>
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && !error && doctors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No doctors found
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            {searchTerm || specialization !== 'all' 
              ? "Try adjusting your search criteria or filters to find more results."
              : "There are currently no doctors available. Please check back later."
            }
          </p>
          <Button onClick={loadDoctors} variant="outline" className="mt-4">
            Refresh
          </Button>
        </motion.div>
      )}

    </div>
  )
}