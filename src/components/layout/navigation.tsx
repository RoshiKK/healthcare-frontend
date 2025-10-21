'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { 
  Stethoscope, 
  Menu, 
  X, 
  User, 
  Calendar,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Stethoscope },
    { href: '/doctors', label: 'Doctors', icon: User },
    { href: '/appointments', label: 'Appointments', icon: Calendar },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-sm -z-10" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                MedConnect
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "relative transition-all duration-200 group/navitem",
                        isActive ? "shadow-sm" : "hover:shadow-sm"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <motion.div 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-3 py-1 border border-blue-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs font-medium text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </motion.div>
                
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="sm" className="space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Admin</span>
                      </Button>
                    </motion.div>
                  </Link>
                )}
                
                {user?.role === 'doctor' && (
                  <Link href="/doctor">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="sm" className="space-x-2">
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Button>
                    </motion.div>
                  </Link>
                )}

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div 
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start space-x-2"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Signed in as {user?.name}
                      </div>
                      {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Button>
                        </Link>
                      )}
                      {user?.role === 'doctor' && (
                        <Link href="/doctor" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start space-x-2">
                            <User className="h-4 w-4" />
                            <span>Doctor Dashboard</span>
                          </Button>
                        </Link>
                      )}
                      <Button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        variant="outline"
                        className="w-full justify-start space-x-2 text-red-600 border-red-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          Create Account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}