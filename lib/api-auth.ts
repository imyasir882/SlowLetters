import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export interface AuthenticatedUser {
  userId: string
  username: string
}

export function authenticateRequest(request: NextRequest): AuthenticatedUser | null {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null
    }

    const token = authorization.replace('Bearer ', '')
    const payload = verifyToken(token)
    
    if (!payload || !payload.userId || !payload.username) {
      return null
    }

    return {
      userId: payload.userId,
      username: payload.username
    }
  } catch (error) {
    return null
  }
}
