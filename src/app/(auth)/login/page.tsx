'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { useAuth } from '@/hooks/use-auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Shield, Zap } from 'lucide-react'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Your health and comfort are our top priorities"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level security for all your medical data"
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Connect with doctors in minutes, not days"
    },
    {
      icon: Sparkles,
      title: "Smart Features",
      description: "AI-powered recommendations and voice booking"
    }
  ]

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'doctor') {
        router.push('/doctor')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-20" />
          </div>
          <p className="text-gray-600">Preparing your experience...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }
const FeatureIcon = features[currentFeature].icon
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features Carousel */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-md text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-4">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                  MedConnect
                </span>
              </h1>
              <p className="text-blue-100 text-lg">
                Your journey to better healthcare starts here
              </p>
            </motion.div>

            {/* Features Carousel */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FeatureIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-blue-100 mt-1">
                        {features[currentFeature].description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Feature Indicators */}
              <div className="flex justify-center space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'bg-white w-6' 
                        : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-6 text-center"
            >
              {[
                { value: '50K+', label: 'Patients' },
                { value: '500+', label: 'Doctors' },
                { value: '99%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to your MedConnect account
            </p>
          </motion.div>

          <LoginForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Create one now
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}