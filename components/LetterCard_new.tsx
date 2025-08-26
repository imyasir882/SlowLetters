'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, User, X } from 'lucide-react'
import { Letter } from '@/types'

interface LetterCardProps {
  letter: Letter
  isOwn: boolean
  onToggleFavorite: () => void
  animationDelay?: number
}

export default function LetterCard({ 
  letter, 
  isOwn, 
  onToggleFavorite, 
  animationDelay = 0 
}: LetterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      {/* Compact Letter Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: animationDelay,
          ease: "easeOut" 
        }}
        className={`vintage-paper rounded-lg p-4 letter-shadow ${
          isOwn ? 'ml-8 border-l-4 border-l-vintage-gold' : 'mr-8 border-r-4 border-r-vintage-gold'
        } relative group cursor-pointer hover:shadow-lg transition-all duration-300`}
        onClick={() => setIsExpanded(true)}
      >
        {/* Letter Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-vintage-faded" />
            <h3 className="font-semibold text-vintage-sepia text-sm">
              {isOwn ? 'You' : letter.author?.displayName}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {letter.isFavorite && (
              <Heart className="w-4 h-4 text-vintage-gold fill-current" />
            )}
            <div className="flex items-center space-x-1 text-xs text-vintage-faded">
              <Calendar className="w-3 h-3" />
              <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Letter Preview */}
        <div className="mb-3">
          <p className="text-vintage-sepia text-sm leading-relaxed">
            {truncateText(letter.bodyText)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all ${
              letter.isFavorite
                ? 'text-vintage-gold hover:text-vintage-darkGold bg-vintage-gold/10'
                : 'text-vintage-faded hover:text-vintage-gold hover:bg-vintage-gold/10'
            }`}
          >
            <Heart className={`w-3 h-3 ${letter.isFavorite ? 'fill-current' : ''}`} />
            <span>{letter.isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          <span className="text-xs text-vintage-faded">Click to expand</span>
        </div>
      </motion.div>

      {/* Expanded Letter Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="vintage-paper rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto letter-shadow-strong"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-vintage-sepia mb-2 font-serif">
                    Letter from {isOwn ? 'You' : letter.author?.displayName}
                  </h2>
                  <p className="text-vintage-faded">
                    {formatDate(letter.createdAt)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onToggleFavorite}
                    className={`p-2 rounded-full transition-all ${
                      letter.isFavorite
                        ? 'text-vintage-gold hover:text-vintage-darkGold bg-vintage-gold/10'
                        : 'text-vintage-faded hover:text-vintage-gold hover:bg-vintage-gold/10'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${letter.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full text-vintage-faded hover:text-vintage-sepia hover:bg-vintage-cream/50 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Letter Content */}
              <div className="prose prose-vintage max-w-none">
                <div className="bg-vintage-cream/30 rounded-lg p-6 border border-vintage-gold/20">
                  <p className="text-vintage-sepia leading-relaxed text-lg font-serif whitespace-pre-wrap">
                    {letter.bodyText}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-vintage-gold/20 text-center">
                <p className="text-vintage-faded text-sm italic">
                  "Love lives in every word" ✨
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
