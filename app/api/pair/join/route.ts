import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'
import { authenticateRequest } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invite code is required'
      }, { status: 400 })
    }

    // Find the user with the invite code
    const invitingUser = await prisma.user.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    })

    if (!invitingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid invite code'
      }, { status: 400 })
    }

    if (invitingUser.id === user.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You cannot invite yourself'
      }, { status: 400 })
    }

    if (invitingUser.pairedWith) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This user is already paired with someone'
      }, { status: 400 })
    }

    // Check if current user is already paired
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!currentUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    if (currentUser.pairedWith) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You are already paired with someone'
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse<{ partner: any }>>({
      success: true,
      data: {
        partner: {
          id: invitingUser.id,
          displayName: invitingUser.displayName,
          username: invitingUser.username
        }
      },
      message: 'Valid invite code. Ready to pair.'
    })

  } catch (error) {
    console.error('Join pair error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
