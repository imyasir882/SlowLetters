'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, X, Type, Heart, Save, FileText, Trash2, Clock } from 'lucide-react'

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Define Speech Recognition event types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface Draft {
  id: string
  bodyText: string
  createdAt: string
  updatedAt: string
}

interface ComposerProps {
  onSend: (content: string) => void
  onCancel: () => void
  canSend: boolean
  timeUntilCanSend?: number
}

export default function DraftComposer({ onSend, onCancel, canSend, timeUntilCanSend }: ComposerProps) {
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Count words
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  useEffect(() => {
    // Auto-focus on textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Load existing draft
    loadDraft()
  }, [])

  const loadDraft = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/drafts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setCurrentDraft(data.data)
        setContent(data.data.bodyText)
        setLastSaved(new Date(data.data.updatedAt).toLocaleTimeString())
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }

  const saveDraft = useCallback(async () => {
    if (!content.trim() || isSavingDraft) return

    setIsSavingDraft(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          bodyText: content.trim(),
          draftId: currentDraft?.id
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCurrentDraft(data.data)
        setLastSaved(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSavingDraft(false)
    }
  }, [content, currentDraft?.id, isSavingDraft])

  // Auto-save draft every 30 seconds if there's content
  useEffect(() => {
    if (content.trim() && content !== currentDraft?.bodyText) {
      const timer = setTimeout(() => {
        saveDraft()
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [content, currentDraft?.bodyText, saveDraft])

  const deleteDraft = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/drafts', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      setCurrentDraft(null)
      setContent('')
      setLastSaved(null)
    } catch (error) {
      console.error('Failed to delete draft:', error)
    }
  }

  const sendDraft = async () => {
    if (!currentDraft || !canSend || isSending) return

    setIsSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/drafts/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ draftId: currentDraft.id }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setContent('')
        setCurrentDraft(null)
        setLastSaved(null)
        await onSend(content) // Notify parent component
      } else {
        throw new Error(data.error || 'Failed to send letter')
      }
    } catch (error) {
      console.error('Failed to send draft:', error)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  const handleSend = async () => {
    if (!content.trim()) return

    if (currentDraft && canSend) {
      // Send existing draft
      await sendDraft()
    } else if (canSend) {
      // Send new letter directly
      setIsSending(true)
      try {
        await onSend(content.trim())
        setContent('')
        setWordCount(0)
      } catch (error) {
        console.error('Failed to send letter:', error)
      } finally {
        setIsSending(false)
      }
    }
  }

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript) {
          setContent(prev => prev + finalTranscript + ' ')
        }
      }

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true)
      setIsListening(true)
      recognition.start()
    }
  }

  const stopRecording = () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
      setIsListening(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      if (canSend) {
        handleSend()
      } else {
        saveDraft()
      }
    }
  }

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="vintage-paper rounded-xl p-4 sm:p-6 lg:p-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto letter-shadow-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-vintage-gold/10 rounded-full">
              <Type className="w-5 h-5 sm:w-6 sm:h-6 text-vintage-gold" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-vintage-sepia font-serif">
                {currentDraft ? 'Edit Your Letter' : 'Write Your Letter'}
              </h3>
              <p className="text-xs sm:text-sm text-vintage-faded">
                {canSend ? 'Ready to send when you are' : 'Save as draft until you can send'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Draft status */}
            {lastSaved && (
              <div className="hidden sm:flex items-center space-x-1 text-xs text-vintage-faded">
                <FileText className="w-3 h-3" />
                <span>Saved {lastSaved}</span>
              </div>
            )}
            
            <button
              onClick={onCancel}
              className="p-2 text-vintage-faded hover:text-vintage-sepia hover:bg-vintage-cream/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Timer warning if can't send */}
        {!canSend && timeUntilCanSend && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                You can send your letter in {formatTimeRemaining(timeUntilCanSend)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Writing Area */}
        <div className="space-y-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full h-48 sm:h-56 md:h-64 lg:h-80 p-4 sm:p-6 border-2 border-vintage-gold/30 rounded-lg bg-vintage-cream/50 focus:vintage-focus focus:border-vintage-gold transition-all resize-none text-sm sm:text-base text-vintage-sepia leading-relaxed font-serif placeholder-vintage-faded/70"
            placeholder="Pour your heart into words... Your letter will be saved as a draft until you're ready to send it."
          />

          {/* Word count and voice controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs sm:text-sm text-vintage-faded">
                {wordCount} words
              </span>
              
              {lastSaved && (
                <span className="text-xs text-vintage-faded sm:hidden">
                  Saved {lastSaved}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {recognition && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 sm:p-3 rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-vintage-cream text-vintage-gold hover:bg-vintage-gold hover:text-white'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>
              )}

              {isListening && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          {/* Save Draft Button */}
          <button
            onClick={saveDraft}
            disabled={!content.trim() || isSavingDraft}
            className="flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 border-2 border-vintage-gold text-vintage-gold hover:bg-vintage-gold hover:text-white transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingDraft ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="text-sm sm:text-base">
              {currentDraft ? 'Update Draft' : 'Save Draft'}
            </span>
          </button>

          {/* Delete Draft Button */}
          {currentDraft && (
            <button
              onClick={deleteDraft}
              className="px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!content.trim() || isSending || (!canSend && !currentDraft)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              canSend
                ? 'btn-vintage'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {isSending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="text-sm sm:text-base">
              {canSend ? 'Send Letter' : 'Cannot Send Yet'}
            </span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-center mt-4">
          <p className="text-xs text-vintage-faded">
            Press <kbd className="px-1 py-0.5 bg-vintage-cream border border-vintage-gold/30 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-vintage-cream border border-vintage-gold/30 rounded text-xs">Enter</kbd> to {canSend ? 'send' : 'save draft'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
