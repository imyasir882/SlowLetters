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
    const { partnerId, delaySeconds = 86400 } = body // Default 24 hours

    if (!partnerId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Partner ID is required'
      }, { status: 400 })
    }

    // Validate delay (1 day to 30 days)
    const minDelay = 86400 // 1 day
    const maxDelay = 30 * 86400 // 30 days
    
    if (delaySeconds < minDelay || delaySeconds > maxDelay) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Delay must be between 1 and 30 days'
      }, { status: 400 })
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the pair
      const pair = await tx.pair.create({
        data: {
          userAId: user.userId,
          userBId: partnerId,
          delaySeconds,
          turnUserId: user.userId, // User who creates the pair goes first
        }
      })

      // Update both users to mark them as paired
      await tx.user.update({
        where: { id: user.userId },
        data: { pairedWith: partnerId }
      })

      await tx.user.update({
        where: { id: partnerId },
        data: { pairedWith: user.userId }
      })

      // Get partner info
      const partner = await tx.user.findUnique({
        where: { id: partnerId },
        select: {
          id: true,
          displayName: true,
          username: true
        }
      })

      return { pair, partner }
    })

    return NextResponse.json<ApiResponse<{ pair: any, partner: any }>>({
      success: true,
      data: {
        pair: result.pair,
        partner: result.partner
      },
      message: 'Successfully paired! You can now start exchanging letters.'
    })

  } catch (error) {
    console.error('Confirm pair error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
