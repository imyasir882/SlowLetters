'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AuthUser, PairInfo, ApiResponse } from '@/types'

interface PairingFlowProps {
  user: AuthUser
  onPairingComplete: (pairInfo: PairInfo) => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function PairingFlow({ user, onPairingComplete, showToast }: PairingFlowProps) {
  const [step, setStep] = useState<'invite' | 'confirm'>('invite')
  const [inviteCode, setInviteCode] = useState('')
  const [partner, setPartner] = useState<any>(null)
  const [delayDays, setDelayDays] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleJoinPair = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pair/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
      })

      const data: ApiResponse<{ partner: any }> = await response.json()
      
      if (data.success && data.data) {
        setPartner(data.data.partner)
        setStep('confirm')
      } else {
        showToast(data.error || 'Failed to join pair', 'error')
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPairing = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pair/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          partnerId: partner.id,
          delaySeconds: delayDays * 24 * 60 * 60 
        }),
      })

      const data: ApiResponse<{ pair: any, partner: any }> = await response.json()
      
      if (data.success && data.data) {
        const pairInfo: PairInfo = {
          pair: data.data.pair,
          partner: data.data.partner,
          isYourTurn: true, // Creator goes first
          timer: {
            canSend: true,
            timeRemaining: 0,
            nextAvailableAt: null
          }
        }
        onPairingComplete(pairInfo)
      } else {
        showToast(data.error || 'Failed to confirm pairing', 'error')
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {step === 'invite' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="vintage-paper vintage-gold-border rounded-lg p-4 sm:p-6 md:p-8 letter-shadow"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="elegant-serif text-2xl sm:text-3xl font-bold text-vintage-sepia mb-4">
              Connect with Your Love
            </h2>
            <p className="text-vintage-faded text-sm sm:text-base">
              Enter the invite code your partner shared with you to begin your letter exchange.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="vintage-paper border border-vintage-gold/30 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold text-vintage-sepia mb-2 text-sm sm:text-base">Your Invite Code</h3>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <code className="flex-1 text-lg sm:text-2xl font-mono bg-vintage-cream p-2.5 sm:p-3 rounded-lg border text-vintage-sepia tracking-widest text-center w-full">
                  {user.inviteCode || 'Loading...'}
                </code>
                <button
                  onClick={() => {
                    if (user.inviteCode) {
                      navigator.clipboard.writeText(user.inviteCode)
                      showToast('Invite code copied to clipboard!', 'success')
                    }
                  }}
                  className="btn-vintage w-full sm:w-auto"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs sm:text-sm text-vintage-faded mt-2">
                Share this code with your partner so they can connect with you.
              </p>
            </div>

            <div className="text-center text-vintage-faded text-sm sm:text-base">
              <span>- OR -</span>
            </div>

            <form onSubmit={handleJoinPair} className="space-y-4">
              <div>
                <label className="block text-vintage-sepia font-semibold mb-2 text-sm sm:text-base">
                  Enter Partner's Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 sm:p-3 border-2 border-vintage-gold/30 rounded-lg bg-vintage-cream focus:vintage-focus focus:border-vintage-gold transition-colors text-center text-lg sm:text-xl font-mono tracking-widest"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || inviteCode.length !== 8}
                className="w-full btn-vintage disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect with Partner'}
              </button>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="vintage-paper vintage-gold-border rounded-lg p-4 sm:p-6 md:p-8 letter-shadow"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="elegant-serif text-2xl sm:text-3xl font-bold text-vintage-sepia mb-4">
              Confirm Your Connection
            </h2>
            <p className="text-vintage-faded text-sm sm:text-base">
              You're about to pair with <strong>{partner?.displayName}</strong>. 
              Set up your letter exchange preferences.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-vintage-sepia font-semibold mb-2 text-sm sm:text-base">
                Letter Exchange Delay
              </label>
              <select
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full p-2.5 sm:p-3 border-2 border-vintage-gold/30 rounded-lg bg-vintage-cream focus:vintage-focus focus:border-vintage-gold transition-colors text-sm sm:text-base"
              >
                <option value={1}>1 Day (24 hours)</option>
                <option value={2}>2 Days (48 hours)</option>
                <option value={3}>3 Days (72 hours)</option>
                <option value={7}>1 Week</option>
                <option value={14}>2 Weeks</option>
                <option value={30}>1 Month</option>
              </select>
              <p className="text-xs sm:text-sm text-vintage-faded mt-2">
                This is how long you'll wait between sending letters. Choose wisely - 
                anticipation makes the heart grow fonder.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setStep('invite')}
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-3 border-2 border-vintage-gold text-vintage-gold hover:bg-vintage-gold hover:text-white transition-colors rounded-lg disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPairing}
                disabled={loading}
                className="flex-1 btn-vintage disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Pairing...' : 'Confirm & Start Writing'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
