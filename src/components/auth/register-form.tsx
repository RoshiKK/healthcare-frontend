'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, UserPlus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { registerSchema } from '@/lib/validations'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type FormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string>('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setServerError('')
    
    try {
      console.log('🔄 Attempting registration...')
      
      const response = await api.post('/auth/register', data)
      console.log('✅ Registration response:', response)
      
      // Show success message
      setServerError('success')
      
      setTimeout(() => {
        alert('Registration successful! Please login with your credentials.')
        router.push('/login')
      }, 1500)
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error)
      
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.message.includes('connect to server')) {
        errorMessage = 'Backend server is not running. Please contact administrator.'
      } else if (error.message.includes('Network error')) {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setServerError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <UserPlus className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-green-600 to-blue-600 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join thousands of patients managing their health with MedConnect
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success/Error Messages */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mb-6 p-4 rounded-lg border ${
                serverError === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center">
                {serverError === 'success' ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    <span>Account created successfully! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">{serverError}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...register('name')}
                disabled={isLoading}
                className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50"
              />
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
                className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50"
              />
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                  disabled={isLoading}
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {errors.password.message}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-gray-500 bg-blue-50/50 p-4 rounded-lg border border-blue-100"
            >
              <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-green-400 rounded-full opacity-20 animate-float" />
      <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-30 animate-float animation-delay-1000" />
      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-cyan-400 rounded-full opacity-40 animate-float animation-delay-2000" />
    </motion.div>
  )
}