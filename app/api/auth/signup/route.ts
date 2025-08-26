import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateInviteCode } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { displayName, username, password } = body

    if (!displayName || !username || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Display name, username, and password are required'
      }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username already exists'
      }, { status: 400 })
    }

    // Create user
    const hashedPassword = hashPassword(password)
    const inviteCode = generateInviteCode()

    const user = await prisma.user.create({
      data: {
        displayName,
        username,
        passwordHash: hashedPassword,
        inviteCode
      }
    })

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
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
