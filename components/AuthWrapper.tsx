'use client'

import { useState, useEffect } from 'react'
import { AuthUser } from '@/types'
import AuthForm from './AuthForm'
import Dashboard from './Dashboard'

export default function AuthWrapper() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        // Invalid data, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: AuthUser, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-dots text-vintage-gold text-xl">
          Loading your account
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
