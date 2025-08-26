import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, PairInfo, TimerInfo } from '@/types'
import { authenticateRequest } from '@/lib/api-auth'

// Helper function to calculate timer info
function calculateTimerInfo(pair: any): TimerInfo {
  if (!pair.lastSentAt) {
    return {
      canSend: true,
      timeRemaining: 0,
      nextAvailableAt: null
    }
  }

  const lastSent = new Date(pair.lastSentAt)
  const nextAvailable = new Date(lastSent.getTime() + (pair.delaySeconds * 1000))
  const now = new Date()
  const timeRemaining = Math.max(0, nextAvailable.getTime() - now.getTime())

  return {
    canSend: timeRemaining === 0,
    timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
    nextAvailableAt: timeRemaining > 0 ? nextAvailable : null
  }
}

// GET - Get all letters for the user's pair
export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Get user's pair
    const pair = await prisma.pair.findFirst({
      where: {
        OR: [
          { userAId: user.userId },
          { userBId: user.userId }
        ]
      },
      include: {
        userA: {
          select: { id: true, displayName: true, username: true }
        },
        userB: {
          select: { id: true, displayName: true, username: true }
        },
        letters: {
          include: {
            author: {
              select: { id: true, displayName: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!pair) {
      return NextResponse.json<ApiResponse<PairInfo>>({
        success: true,
        data: {
          pair: null,
          partner: null,
          isYourTurn: false,
          timer: {
            canSend: false,
            timeRemaining: 0,
            nextAvailableAt: null
          }
        }
      })
    }

    const partner = pair.userAId === user.userId ? pair.userB : pair.userA
    const isYourTurn = pair.turnUserId === user.userId
    const timer = calculateTimerInfo(pair)

    const pairInfo: PairInfo = {
      pair: pair as any,  // Cast due to Prisma include types mismatch
      partner: partner as any,  // Cast due to partial select
      isYourTurn: isYourTurn && timer.canSend,
      timer
    }

    return NextResponse.json<ApiResponse<PairInfo>>({
      success: true,
      data: pairInfo
    })

  } catch (error) {
    console.error('Get letters error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Send a new letter
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
    const { bodyText } = body

    if (!bodyText || bodyText.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Letter content is required'
      }, { status: 400 })
    }

    // Get user's pair
    const pair = await prisma.pair.findFirst({
      where: {
        OR: [
          { userAId: user.userId },
          { userBId: user.userId }
        ]
      }
    })

    if (!pair) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You are not paired with anyone'
      }, { status: 400 })
    }

    // Check if it's user's turn
    if (pair.turnUserId !== user.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'It is not your turn to send a letter'
      }, { status: 400 })
    }

    // Check timer
    const timer = calculateTimerInfo(pair)
    if (!timer.canSend) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `You must wait ${Math.ceil(timer.timeRemaining / 3600)} more hours before sending another letter`
      }, { status: 400 })
    }

    // Create letter and update pair
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the letter
      const letter = await tx.letter.create({
        data: {
          pairId: pair.id,
          authorId: user.userId,
          bodyText: bodyText.trim()
        },
        include: {
          author: {
            select: { id: true, displayName: true, username: true }
          }
        }
      })

      // Update pair - switch turn and set last sent time
      const partnerId = pair.userAId === user.userId ? pair.userBId : pair.userAId
      await tx.pair.update({
        where: { id: pair.id },
        data: {
          turnUserId: partnerId,
          lastSentAt: new Date()
        }
      })

      return letter
    })

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: { letter: result },
      message: 'Letter sent successfully! Now wait for your partner to reply.'
    })

  } catch (error) {
    console.error('Send letter error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
