'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/auth/register-form'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { CheckCircle, Users, Calendar, Clock } from 'lucide-react'

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'doctor') {
        router.push('/doctor')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, router])

  const benefits = [
    "Book appointments in seconds",
    "Access top healthcare specialists",
    "Secure video consultations",
    "Digital health records",
    "24/7 customer support",
    "AI-powered health insights"
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 rounded-full animate-ping opacity-20" />
          </div>
          <p className="text-gray-600">Creating your account...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join MedConnect
            </h1>
            <p className="text-gray-600">
              Create your account and start your health journey
            </p>
          </motion.div>

          <RegisterForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign in here
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-md text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-4">
                Start Your{' '}
                <span className="bg-gradient-to-r from-green-300 to-cyan-200 bg-clip-text text-transparent">
                  Health Journey
                </span>
              </h1>
              <p className="text-blue-100 text-lg">
                Join thousands of patients transforming their healthcare experience
              </p>
            </motion.div>

            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-8"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-100">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              {[
                { icon: Users, value: '50K+', label: 'Patients' },
                { icon: Calendar, value: '500+', label: 'Doctors' },
                { icon: Clock, value: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <p className="text-blue-100 italic mb-4">
                "MedConnect made finding the right specialist so easy. The voice booking feature is incredible!"
              </p>
              <div className="text-white font-semibold">Sarah Johnson</div>
              <div className="text-blue-200 text-sm">Patient since 2023</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}