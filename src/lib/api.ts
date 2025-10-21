import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_BASE_URL, // Now includes /api
  withCredentials: true,
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error Details:')
    console.error('URL:', error.config?.url)
    console.error('Method:', error.config?.method)
    console.error('Status:', error.response?.status)
    console.error('Response Data:', error.response?.data)
    console.error('Message:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Backend server is not running!')
      return Promise.reject(new Error('Cannot connect to server. Please make sure the backend is running on port 5000.'))
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return Promise.reject(new Error('Network error. Please check your internet connection.'))
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred'
    
    return Promise.reject(new Error(errorMessage))
  }
)

export default api