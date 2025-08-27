'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthUser, ApiResponse } from '@/types'

interface AuthFormProps {
  onLogin: (user: AuthUser, token: string) => void
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data: ApiResponse<{ user: AuthUser; token: string }> = await response.json()

      if (data.success && data.data) {
        onLogin(data.data.user, data.data.token)
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="vintage-paper vintage-gold-border rounded-lg p-8 letter-shadow">
        <div className="text-center mb-8">
          <h2 className="elegant-serif text-3xl font-bold text-vintage-sepia mb-2">
            {isLogin ? 'Welcome Back' : 'Join SlowLetters'}
          </h2>
          <p className="text-vintage-faded">
            {isLogin ? 'Sign in to your love story' : 'Create your romantic journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-vintage-sepia font-semibold mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-vintage-gold/30 rounded-lg bg-vintage-cream focus:vintage-focus focus:border-vintage-gold transition-colors"
                  placeholder="How should your partner see your name?"
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-vintage-sepia font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-vintage-gold/30 rounded-lg bg-vintage-cream focus:vintage-focus focus:border-vintage-gold transition-colors"
              placeholder="Your unique username"
              required
            />
          </div>

          <div>
            <label className="block text-vintage-sepia font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-vintage-gold/30 rounded-lg bg-vintage-cream focus:vintage-focus focus:border-vintage-gold transition-colors"
              placeholder="Your secret key"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-vintage disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setFormData({ displayName: '', username: '', password: '' })
            }}
            className="text-vintage-gold hover:text-vintage-darkGold transition-colors underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
