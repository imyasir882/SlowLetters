import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    
    const body = await request.json()
    const { username, password } = body

    console.log('Login attempt for username:', username)

    if (!username || !password) {
      console.log('Missing credentials')
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 })
    }

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 })
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not configured')
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Database configuration error'  
      }, { status: 500 })
    }

    console.log('Environment variables check passed')

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        passwordHash: true,
        pairedWith: true,
        inviteCode: true
      }
    })

    console.log('Database query completed, user found:', !!user)

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid username or password'
      }, { status: 401 })
    }

    // Verify password
    const isValidPassword = comparePassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid username or password'
      }, { status: 401 })
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username
    })

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      pairedWith: user.pairedWith,
      inviteCode: user.inviteCode
    }

    return NextResponse.json<ApiResponse<{ user: AuthUser, token: string }>>({
      success: true,
      data: { user: authUser, token },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Internal server error'
    }, { status: 500 })
  }
}
