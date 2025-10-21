import { useState } from 'react'
import api from '@/lib/api'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callApi = async <T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    body?: any,
    options?: UseApiOptions
  ): Promise<T> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`🔄 API Call: ${method.toUpperCase()} ${url}`, body)

      const response = await api({
        method,
        url,
        data: body,
      })

      console.log('✅ API Response:', response.data)

      // Handle different response formats
      let responseData = response.data
      
      // If response has a success property (error response), throw error
      if (responseData && typeof responseData === 'object' && responseData.success === false) {
        throw new Error(responseData.message || responseData.error || 'Request failed')
      }
      
      // If response has a data property (ApiResponse format), use that
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        responseData = responseData.data
      }

      options?.onSuccess?.(responseData)
      return responseData

    } catch (err: any) {
      console.error('❌ API Error:', err)

      let errorMessage = 'An error occurred'

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.'
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.'
      }

      setError(errorMessage)
      options?.onError?.(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    callApi,
    resetError: () => setError(null),
  }
}