'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { 
  Stethoscope, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  Calendar,
  Users,
  Award,
  Sparkles,
  Heart,
  Zap,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: Clock,
      title: "Quick Booking",
      description: "Book appointments in seconds with our intuitive interface",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Star,
      title: "Top Specialists",
      description: "Access to certified healthcare professionals across specialties",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Instant Confirmation",
      description: "Get immediate appointment confirmations and reminders",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Heart,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Smart recommendations and voice booking assistance",
      color: "from-violet-500 to-purple-500"
    }
  ]

  const stats = [
    { value: "500+", label: "Happy Patients", icon: Users },
    { value: "50+", label: "Expert Doctors", icon: Stethoscope },
    { value: "24/7", label: "Support Available", icon: Clock },
    { value: "99%", label: "Satisfaction Rate", icon: Star }
  ]

  const benefits = [
    "No waiting rooms",
    "Flexible scheduling",
    "Secure video calls",
    "Digital prescriptions",
    "Health records access",
    "Insurance support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-4 py-2 mb-8 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Revolutionizing Healthcare Access
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Healthcare Made{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Simple
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with top healthcare professionals, book appointments effortlessly, 
              and manage your health journey with our comprehensive platform.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/doctors">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Appointment
                    </Link>
                  </Button>
                  {user?.role === 'admin' && (
                    <Button asChild variant="outline" size="lg">
                      <Link href="/admin">
                        Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  {user?.role === 'doctor' && (
                    <Button asChild variant="outline" size="lg">
                      <Link href="/doctor">
                        Doctor Portal
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/register">
                      Get Started Free
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MedConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience healthcare that puts you first with our innovative platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Modern Healthcare at Your Fingertips
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Access quality healthcare from anywhere, anytime. Our platform brings 
                doctors and patients together through cutting-edge technology.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="text-center">
                  <Award className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="text-blue-100 mb-6">
                    Join thousands of patients who trust MedConnect for their healthcare needs
                  </p>
                  <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Link href={isAuthenticated ? "/doctors" : "/register"}>
                      {isAuthenticated ? "Book Now" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-bounce animation-delay-1000" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}