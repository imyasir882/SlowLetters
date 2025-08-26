'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, X, Type, Heart } from 'lucide-react'

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

interface ComposerProps {
  onSend: (content: string) => void
  onCancel: () => void
}

export default function Composer({ onSend, onCancel }: ComposerProps) {
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isSending, setIsSending] = useState(false)
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

  const handleSend = async () => {
    if (content.trim() && !isSending) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="vintage-paper rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden letter-shadow-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-vintage-gold/10 rounded-full">
              <Type className="w-6 h-6 text-vintage-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-vintage-sepia font-serif">
                Write Your Letter
              </h2>
              <p className="text-vintage-faded text-sm">
                Express your heart through words
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="p-2 rounded-full text-vintage-faded hover:text-vintage-sepia hover:bg-vintage-cream/50 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Writing Area */}
        <div className="relative mb-6">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Dear beloved, let your heart speak through these words..."
            className="w-full h-80 p-6 bg-vintage-cream/30 border border-vintage-gold/20 rounded-xl text-vintage-sepia placeholder-vintage-faded/60 resize-none focus:outline-none focus:ring-2 focus:ring-vintage-gold/50 focus:border-transparent font-serif text-lg leading-relaxed"
            disabled={isSending}
          />
          
          {/* Word Count */}
          <div className="absolute bottom-3 right-3 text-xs text-vintage-faded bg-vintage-cream/80 px-2 py-1 rounded-full">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        </div>

        {/* Voice Recording */}
        <AnimatePresence>
          {recognition && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-vintage-gold/10 rounded-xl border border-vintage-gold/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                    className="p-2 bg-vintage-gold/20 rounded-full"
                  >
                    <Mic className="w-5 h-5 text-vintage-gold" />
                  </motion.div>
                  <div>
                    <p className="text-vintage-sepia font-medium text-sm">Voice to Text</p>
                    <p className="text-vintage-faded text-xs">
                      {isListening ? 'Listening... Speak your heart' : 'Click to start voice input'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-vintage-gold hover:bg-vintage-darkGold text-vintage-cream'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 inline mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 inline mr-1" />
                      Record
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-vintage-gold/20">
          <div className="flex items-center space-x-2 text-vintage-faded text-sm">
            <Heart className="w-4 h-4" />
            <span>Ctrl + Enter to send</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-vintage-cream hover:bg-vintage-faded/10 text-vintage-faded hover:text-vintage-sepia rounded-lg transition-all font-medium"
              disabled={isSending}
            >
              Cancel
            </button>
            
            <motion.button
              onClick={handleSend}
              disabled={!content.trim() || isSending}
              className={`px-8 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                content.trim() && !isSending
                  ? 'bg-vintage-gold hover:bg-vintage-darkGold text-vintage-cream shadow-md'
                  : 'bg-vintage-faded/20 text-vintage-faded/60 cursor-not-allowed'
              }`}
              whileHover={content.trim() && !isSending ? { scale: 1.02 } : {}}
              whileTap={content.trim() && !isSending ? { scale: 0.98 } : {}}
            >
              {isSending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 border-2 border-vintage-cream/30 border-t-vintage-cream rounded-full"
                  />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Letter</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-6 pt-4 text-center">
          <p className="text-vintage-faded text-sm italic">
            "The written word carries the soul's whisper across time and distance" ✨
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
