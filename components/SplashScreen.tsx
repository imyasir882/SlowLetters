'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Feather } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

export default function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true)
      setTimeout(onComplete, 500) // Allow exit animation to complete
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onComplete])
  
  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gradient-to-br from-rose-100 via-vintage-50 to-amber-50 flex flex-col items-center justify-center z-50"
        >
          <div className="relative">
            {/* Background ornamental pattern */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1.2 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 -m-32"
            >
              <div className="w-64 h-64 rounded-full border-4 border-vintage-300 opacity-20" />
              <div className="absolute inset-4 rounded-full border-2 border-rose-300 opacity-30" />
              <div className="absolute inset-8 rounded-full border border-amber-300 opacity-40" />
            </motion.div>
            
            {/* Main content */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 1.2,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              className="relative text-center space-y-6 p-8"
            >
              {/* Logo/Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative mx-auto w-24 h-24 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-vintage-300 rounded-full opacity-20" />
                <Heart className="w-12 h-12 text-vintage-700 fill-rose-300" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2"
                >
                  <Feather className="w-6 h-6 text-vintage-500 absolute top-0 right-0" />
                </motion.div>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl md:text-7xl font-serif text-vintage-800"
              >
                SlowLetters
              </motion.h1>
              
              {/* Subtitle */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="space-y-2"
              >
                <p className="text-xl text-vintage-600 font-light italic">
                  Where hearts speak through ink
                </p>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-vintage-500"
                >
                  A romantic sanctuary for two souls
                </motion.p>
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="flex justify-center items-center space-x-4 text-vintage-400"
              >
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-vintage-400" />
                <span className="text-2xl">✦</span>
                <div className="w-8 h-px bg-gradient-to-l from-transparent to-vintage-400" />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Loading progress */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "12rem" }}
            transition={{ duration: duration / 1000, ease: "easeInOut" }}
            className="absolute bottom-12 h-1 bg-gradient-to-r from-rose-300 to-vintage-400 rounded-full"
          />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0, 1, 0],
                y: [100, -20, -100],
                x: [0, Math.sin(i) * 50, Math.sin(i + 1) * 30]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute"
              style={{
                left: `${20 + i * 12}%`,
                bottom: "10%"
              }}
            >
              <div className="w-2 h-2 bg-rose-300 rounded-full opacity-60" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
