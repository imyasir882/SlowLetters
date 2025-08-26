import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 })
    }

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
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
