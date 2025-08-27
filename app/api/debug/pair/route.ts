import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/debug/pair - Debug pair state
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user's pair with full details
    const pair = await prisma.pair.findFirst({
      where: {
        OR: [
          { userAId: decoded.userId },
          { userBId: decoded.userId }
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
          where: { isDraft: false },
          select: { id: true, authorId: true, sentAt: true, createdAt: true },
          orderBy: { sentAt: 'desc' }
        }
      }
    })

    if (!pair) {
      return NextResponse.json({
        success: true,
        data: { message: 'No pair found' }
      })
    }

    const currentUser = decoded.userId
    const partner = pair.userAId === currentUser ? pair.userB : pair.userA
    const isUserA = pair.userAId === currentUser

    // Calculate timer info
    let canSend = true
    let timeRemaining = 0
    
    if (pair.lastSentAt) {
      const timeSinceLastSent = Date.now() - new Date(pair.lastSentAt).getTime()
      const delayMs = pair.delaySeconds * 1000
      
      if (timeSinceLastSent < delayMs) {
        canSend = false
        timeRemaining = Math.ceil((delayMs - timeSinceLastSent) / 1000)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentUserId: currentUser,
        partnerId: partner.id,
        partnerName: partner.displayName,
        isUserA: isUserA,
        pairInfo: {
          id: pair.id,
          userAId: pair.userAId,
          userBId: pair.userBId,
          turnUserId: pair.turnUserId,
          delaySeconds: pair.delaySeconds,
          lastSentAt: pair.lastSentAt,
          createdAt: pair.createdAt
        },
        turnInfo: {
          isYourTurn: pair.turnUserId === currentUser,
          whoseTurnName: pair.turnUserId === pair.userAId ? pair.userA.displayName : pair.userB.displayName
        },
        timerInfo: {
          canSend,
          timeRemaining,
          lastSentAt: pair.lastSentAt
        },
        letterCount: pair.letters.length,
        lastLetter: pair.letters[0] || null
      }
    })

  } catch (error) {
    console.error('Error in debug API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debug info' },
      { status: 500 }
    )
  }
}
