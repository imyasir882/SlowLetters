'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, PenTool, Send } from 'lucide-react'

export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-12 h-12 rounded-full border-4 border-vintage-300 border-t-vintage-600"></div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Heart className="w-4 h-4 text-vintage-600 fill-current" />
        </motion.div>
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-vintage-600 font-serif"
      >
        {text}
      </motion.p>
    </div>
  )
}

export function FullPageLoader({ message = "Preparing your romantic sanctuary..." }: { message?: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    { icon: Heart, text: "Opening hearts..." },
    { icon: PenTool, text: "Preparing your quill..." },
    { icon: Send, text: "Connecting souls..." }
  ]
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [steps.length])
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-vintage-50 via-rose-50 to-vintage-100 flex flex-col items-center justify-center z-50"
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-serif text-vintage-800 mb-4">
            SlowLetters
          </h1>
          <p className="text-vintage-600 text-lg font-light">
            Where time stands still for love
          </p>
        </motion.div>
        
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full border-4 border-vintage-200 border-t-vintage-500 mx-auto"
          />
          
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {steps[currentStep] && (
              <steps[currentStep].icon className="w-8 h-8 text-vintage-600" />
            )}
          </motion.div>
        </div>
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-vintage-600 font-serif"
        >
          {steps[currentStep]?.text || message}
        </motion.div>
        
        <div className="flex space-x-2 justify-center">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                opacity: index === currentStep ? 1 : 0.3
              }}
              className="w-2 h-2 rounded-full bg-vintage-500"
            />
          ))}
        </div>
      </div>
      
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 text-vintage-400 text-sm"
      >
        ✨ Crafting your perfect letter-writing experience ✨
      </motion.div>
    </motion.div>
  )
}

export function ButtonLoader() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
    />
  )
}
