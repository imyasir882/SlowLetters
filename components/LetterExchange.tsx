'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AuthUser, PairInfo, Letter, ApiResponse } from '@/types'
import Stopwatch from './Stopwatch'
import LetterCard from './LetterCard'
import Composer from './Composer'

interface LetterExchangeProps {
  pairInfo: PairInfo
  user: AuthUser
  onLetterSent: () => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function LetterExchange({ pairInfo, user, onLetterSent, showToast }: LetterExchangeProps) {
  const [showFavorites, setShowFavorites] = useState(false)
  const [showComposer, setShowComposer] = useState(false)

  const { pair, partner, isYourTurn, timer } = pairInfo

  const allLetters = pair?.letters || []
  const favoriteLetters = allLetters.filter(letter => letter.isFavorite)

  const handleSendLetter = async (content: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bodyText: content }),
      })

      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setShowComposer(false)
        onLetterSent()
        showToast(data.message || 'Letter sent successfully!', 'success')
      } else {
        showToast(data.error || 'Failed to send letter', 'error')
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error')
    }
  }

  const handleToggleFavorite = async (letterId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/letters/${letterId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data: ApiResponse = await response.json()
      
      if (data.success) {
        onLetterSent() // Refresh the data
        showToast(data.message || 'Favorite status updated', 'success')
      } else {
        showToast(data.error || 'Failed to update favorite', 'error')
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error')
    }
  }

  return (
    <div className="space-y-8">
      {/* Status Header */}
      <div className="text-center">
        <div className="mb-6">
          <Stopwatch 
            timeRemaining={timer.timeRemaining}
            isActive={!timer.canSend}
            size="lg"
          />
        </div>

        <div className="vintage-paper vintage-gold-border rounded-lg p-6 letter-shadow">
          <h2 className="elegant-serif text-2xl font-bold text-vintage-sepia mb-2">
            Your Letter Exchange with {partner?.displayName}
          </h2>
          
          {isYourTurn ? (
            <p className="text-vintage-faded mb-4">
              It's your turn! You can write a new letter.
            </p>
          ) : (
            <p className="text-vintage-faded mb-4">
              Waiting for {partner?.displayName} to send their next letter...
            </p>
          )}

          <div className="flex justify-center space-x-4">
            {isYourTurn && (
              <button
                onClick={() => setShowComposer(true)}
                className="btn-vintage"
              >
                Write New Letter
              </button>
            )}
            
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="px-6 py-3 border-2 border-vintage-gold text-vintage-gold hover:bg-vintage-gold hover:text-white transition-colors rounded-lg"
            >
              {showFavorites ? 'All Letters' : 'Favorites'} ({showFavorites ? allLetters.length : favoriteLetters.length})
            </button>
          </div>
        </div>
      </div>

      {/* Letters Display */}
      <div className="space-y-4">
        {(showFavorites ? favoriteLetters : allLetters).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-vintage-faded text-lg mb-4">
              {showFavorites ? 'No favorite letters yet' : 'No letters yet'}
            </div>
            <p className="text-vintage-faded">
              {showFavorites 
                ? 'Star your favorite letters to see them here'
                : isYourTurn 
                  ? 'Write your first letter to start the conversation'
                  : 'Waiting for the first letter...'
              }
            </p>
          </motion.div>
        ) : (
          (showFavorites ? favoriteLetters : allLetters).map((letter, index) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              isOwn={letter.authorId === user.id}
              onToggleFavorite={() => handleToggleFavorite(letter.id)}
              animationDelay={index * 0.1}
            />
          ))
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <Composer
          onSend={handleSendLetter}
          onCancel={() => setShowComposer(false)}
        />
      )}
    </div>
  )
}
