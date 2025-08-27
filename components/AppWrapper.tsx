'use client'

import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Don't show splash screen during SSR
  if (!isClient) {
    return <>{children}</>
  }
  
  return (
    <>
      {showSplash && (
        <SplashScreen 
          onComplete={() => setShowSplash(false)}
          duration={2500}
        />
      )}
      {children}
    </>
  )
}
