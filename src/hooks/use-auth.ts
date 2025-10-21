"use client";
import { useState, useEffect } from 'react'
import { User } from '@/types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    
    if (storedToken) {
      setAccessToken(storedToken)
    }
    
    setIsLoading(false)
  }, [])

  const login = (userData: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
    
    setUser(userData);
    setAccessToken(token);
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setAccessToken(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  return {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }
}