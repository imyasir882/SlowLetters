'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Heart, Users, Clock, Settings, RefreshCw } from 'lucide-react'
import { AuthUser, PairInfo, ApiResponse } from '@/types'
import PairingFlow from './PairingFlow'
import LetterExchange from './LetterExchange'
import Toast from './Toast'

interface DashboardProps {
  user: AuthUser
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [pairInfo, setPairInfo] = useState<PairInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchPairInfo = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/letters', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data: ApiResponse<PairInfo> = await response.json()
      
      if (data.success && data.data) {
        setPairInfo(data.data)
      }
    } catch (error) {
      console.error('Error fetching pair info:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPairInfo()
    // Poll for updates every 30 seconds
    const interval = setInterval(() => fetchPairInfo(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-12 border-4 border-vintage-gold/30 border-t-vintage-gold rounded-full mx-auto mb-4"
          />
          <p className="text-vintage-sepia font-serif">Loading your letters...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream to-vintage-paper">
      {/* Compact Header */}
      <header className="bg-vintage-cream/80 backdrop-blur-sm border-b border-vintage-gold/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-vintage-gold/10 rounded-full">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-vintage-gold" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-vintage-sepia font-serif">SlowLetters</h1>
                <p className="text-xs text-vintage-faded hidden sm:block">Welcome back, {user.displayName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => fetchPairInfo(true)}
                disabled={refreshing}
                className="p-2 text-vintage-faded hover:text-vintage-sepia hover:bg-vintage-cream/50 rounded-lg transition-all"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-vintage-faded hover:text-vintage-sepia hover:bg-vintage-cream/50 rounded-lg transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {!pairInfo?.pair ? (
          // Pairing Flow - Centered and Prominent
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <PairingFlow 
              user={user} 
              onPairingComplete={() => fetchPairInfo()} 
              showToast={showToast} 
            />
          </motion.div>
        ) : (
          // Main Content - Letter Exchange Prominent
          <div className="space-y-6">
            {/* Connection Status - Compact */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-vintage-paper/50 rounded-xl p-3 sm:p-4 border border-vintage-gold/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-vintage-gold/10 rounded-full">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-vintage-gold" />
                  </div>
                  <div>
                    <p className="text-vintage-sepia font-medium text-sm">
                      Connected with {pairInfo.partner?.displayName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-vintage-faded">
                      <Clock className="w-3 h-3" />
                      <span>
                        {pairInfo.isYourTurn 
                          ? pairInfo.timer.canSend 
                            ? "Your turn to write"
                            : `Wait ${Math.ceil(pairInfo.timer.timeRemaining / 3600)}h to send`
                          : "Waiting for their letter"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats - Minimized */}
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-vintage-faded ml-8 sm:ml-0">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-vintage-gold" />
                    <span>{pairInfo.pair.letters?.filter(l => l.isFavorite).length || 0}</span>
                  </div>
                  <div className="text-vintage-faded/60">
                    {pairInfo.pair.letters?.length || 0} letters
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Letter Exchange - Main Focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-vintage-paper rounded-xl border border-vintage-gold/20 overflow-hidden"
            >
              <LetterExchange
                pairInfo={pairInfo}
                user={user}
                onLetterSent={() => fetchPairInfo()}
                showToast={showToast}
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
