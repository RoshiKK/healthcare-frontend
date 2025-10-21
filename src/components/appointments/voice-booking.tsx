'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Loader2, Volume2, Bot, User, RefreshCw, AlertCircle } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

interface VoiceBookingProps {
  doctorId: string
  doctorName: string
  onBookingComplete: (appointment: any) => void
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function VoiceBooking({ doctorId, doctorName, onBookingComplete }: VoiceBookingProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [appointmentData, setAppointmentData] = useState<any>({})
  const [error, setError] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState(true)
  const recognitionRef = useRef<any>(null)
  const { callApi } = useApi()

  useEffect(() => {
    initializeVoiceSession()
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [doctorId])

  const initializeVoiceSession = async () => {
    try {
      console.log("🔄 Initializing voice session for doctor:", doctorId)
      setIsInitializing(true)
      setError('')
      setSessionId('') // Reset session ID
      
      const response = await callApi('post', '/voice/session/initiate', { doctorId })
      
      if (response && response.sessionId) {
        setSessionId(response.sessionId)
        setConversation([{
          role: 'assistant',
          content: response.welcomeMessage,
          timestamp: new Date()
        }])
        console.log("✅ Voice session initialized:", response.sessionId)
        setupSpeechRecognition()
      } else {
        throw new Error('Invalid response from server - no session ID received')
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize voice session:', error)
      const errorMsg = error.message || 'Failed to initialize voice session'
      setError(errorMsg)
      setConversation([{
        role: 'assistant',
        content: `Sorry, I couldn't start the voice session (${errorMsg}). Please try again or use the form booking.`,
        timestamp: new Date()
      }])
    } finally {
      setIsInitializing(false)
    }
  }

  const setupSpeechRecognition = () => {
    if (typeof window === 'undefined') return

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser')
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice booking.',
          timestamp: new Date()
        }])
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started")
        setIsListening(true)
        setError('')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        console.log("🎯 Speech recognized:", transcript)
        handleUserInput(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error)
        setIsListening(false)
        
        let errorMessage = 'Sorry, I encountered an error listening to your voice. '
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'I didn\'t hear anything. Please try speaking again.'
            break
          case 'audio-capture':
            errorMessage += 'I couldn\'t access your microphone. Please check your microphone settings.'
            break
          case 'not-allowed':
            errorMessage += 'Microphone access was denied. Please allow microphone access to use voice booking.'
            break
          default:
            errorMessage += 'Please try speaking again.'
        }
        
        setError(event.error)
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        }])
      }

      recognition.onend = () => {
        console.log("🔇 Speech recognition ended")
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } catch (error) {
      console.error('❌ Error setting up speech recognition:', error)
      setError('Failed to set up speech recognition')
    }
  }

  const handleUserInput = async (userInput: string) => {
    if (!userInput.trim()) return
    
    setConversation(prev => [...prev, {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }])

    setIsProcessing(true)
    setError('')

    try {
      console.log("🔄 Sending voice command to backend:", { 
        sessionId: sessionId || 'undefined', 
        userInput, 
        doctorId 
      })
      
      const requestData: any = {
        text: userInput,
        doctorId // Always include doctorId for session recovery
      }
      
      // Only include sessionId if we have one
      if (sessionId) {
        requestData.sessionId = sessionId
      }
      
      const response = await callApi('post', '/voice/process', requestData)

      console.log("✅ Voice command response:", response)

      if (response && response.message) {
        // Update sessionId if a new one was created
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId)
          console.log("🔄 Session ID updated:", response.sessionId)
        }
        
        setAppointmentData(response.updatedData || {})
        
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        }])

        // Handle completion
        if (response.isComplete && response.bookingResult) {
          onBookingComplete(response.bookingResult)
        }
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error: any) {
      console.error('❌ Error processing voice input:', error)
      
      let errorMessage = 'Sorry, I encountered an error processing your request. '
      
      // Handle specific error cases
      if (error.message.includes('session') || error.message.includes('Session')) {
        errorMessage += 'Your session expired. '
        // Reset session to allow retry
        setSessionId('')
      }
      
      errorMessage += 'Please try speaking again or use the form booking.'
      
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }])
      
      setError(error.message || 'Processing error')
    } finally {
      setIsProcessing(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setError('Failed to start listening. Please refresh the page and try again.')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const resetConversation = async () => {
    setConversation([])
    setAppointmentData({})
    setError('')
    await initializeVoiceSession()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Voice Booking Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Session Status */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Session ID:</strong> {sessionId ? sessionId.substring(0, 15) + '...' : 'Not started'}
            </p>
            <p className="text-blue-800 text-sm">
              <strong>Doctor:</strong> {doctorName}
            </p>
          </div>

          {/* Conversation Display */}
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
            {isInitializing ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p>Initializing voice session...</p>
                </div>
              </div>
            ) : conversation.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Click the microphone to start voice booking</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isInitializing || !sessionId}
              size="lg"
              className={`${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } min-w-[140px]`}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              <span className="ml-2">
                {isProcessing ? 'Processing' : isListening ? 'Stop' : 'Start Speaking'}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={resetConversation}
              disabled={isProcessing || isListening || isInitializing}
              className="min-w-[100px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">How to use voice booking:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click "Start Speaking" and wait for the beep</li>
              <li>• Speak clearly and naturally</li>
              <li>• I'll ask for your name, email, phone, and symptoms</li>
              <li>• Say "help" at any time for assistance</li>
              <li>• Say "restart" to start over</li>
              <li>• Make sure you're in a quiet environment</li>
            </ul>
          </div>

          {/* Status */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              {isInitializing ? '🔄 Initializing...' : 
               isListening ? '🎤 Listening...' : 
               isProcessing ? '🔄 Processing...' : 
               sessionId ? '✅ Ready' : '❌ Not ready'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}