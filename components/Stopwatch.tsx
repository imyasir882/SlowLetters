'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface StopwatchProps {
  timeRemaining: number // in seconds
  isActive: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Stopwatch({ timeRemaining, isActive, size = 'md' }: StopwatchProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining)

  useEffect(() => {
    setDisplayTime(timeRemaining)
    
    if (!isActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        const newTime = Math.max(0, prev - 1)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isActive])

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  }

  const getProgress = () => {
    if (timeRemaining <= 0) return 100
    return Math.max(0, 100 - (displayTime / timeRemaining) * 100)
  }

  const sizeClasses = {
    sm: 'w-24 h-24 text-sm',
    md: 'w-32 h-32 text-base',
    lg: 'w-48 h-48 text-2xl'
  }

  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} mx-auto`}
      animate={isActive && displayTime > 0 ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full vintage-gold-border bg-gradient-to-br from-vintage-cream to-vintage-parchment shadow-lg">
        {/* Inner circle with gradient */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-vintage-parchment to-vintage-cream border border-vintage-gold/30">
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`font-mono font-bold text-vintage-sepia ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'}`}>
                {displayTime > 0 ? formatTime(displayTime) : 'Ready!'}
              </div>
              {displayTime > 0 && (
                <div className={`text-vintage-faded ${size === 'lg' ? 'text-xs' : 'text-xs'}`}>
                  until next letter
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress circle */}
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        style={{ filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.3))' }}
      >
        <circle
          cx="50%"
          cy="50%"
          r={`calc(50% - ${strokeWidth}px)`}
          fill="none"
          stroke="rgba(212, 175, 55, 0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx="50%"
          cy="50%"
          r={`calc(50% - ${strokeWidth}px)`}
          fill="none"
          stroke={displayTime > 0 ? "#D4AF37" : "#28A745"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`calc(2 * 3.14159 * (50% - ${strokeWidth}px))`}
          initial={{ strokeDashoffset: `calc(2 * 3.14159 * (50% - ${strokeWidth}px))` }}
          animate={{
            strokeDashoffset: `calc(2 * 3.14159 * (50% - ${strokeWidth}px) * ${1 - getProgress() / 100})`
          }}
          transition={{ duration: 1 }}
        />
      </svg>

      {/* Vintage clock hands decoration */}
      {displayTime <= 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-1 h-6 bg-vintage-gold rounded-full origin-bottom" style={{ marginTop: '12px' }} />
        </motion.div>
      )}
    </motion.div>
  )
}
