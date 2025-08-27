import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/drafts/send - Send a draft as a letter
export async function POST(request: NextRequest) {
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

    const { draftId } = await request.json()

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    // Get user's pair
    const pair = await prisma.pair.findFirst({
      where: {
        OR: [
          { userAId: decoded.userId },
          { userBId: decoded.userId }
        ]
      }
    })

    if (!pair) {
      return NextResponse.json(
        { success: false, error: 'No pair found' },
        { status: 404 }
      )
    }

    // Check if it's the user's turn and timer allows sending
    if (pair.turnUserId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: "It's not your turn to send a letter" },
        { status: 403 }
      )
    }

    // Check timer
    if (pair.lastSentAt) {
      const timeSinceLastSent = Date.now() - new Date(pair.lastSentAt).getTime()
      if (timeSinceLastSent < pair.delaySeconds * 1000) {
        const remainingTime = Math.ceil((pair.delaySeconds * 1000 - timeSinceLastSent) / 1000 / 3600)
        return NextResponse.json(
          { success: false, error: `You need to wait ${remainingTime} more hours before sending` },
          { status: 403 }
        )
      }
    }

    // Get the draft
    const draft = await prisma.letter.findFirst({
      where: {
        id: draftId,
        authorId: decoded.userId,
        isDraft: true
      }
    })

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Convert draft to sent letter and update pair
    const [sentLetter] = await prisma.$transaction([
      // Update the draft to be a sent letter
      prisma.letter.update({
        where: { id: draftId },
        data: {
          isDraft: false,
          sentAt: new Date()
        }
      }),
      // Update pair to switch turns
      prisma.pair.update({
        where: { id: pair.id },
        data: {
          turnUserId: pair.userAId === decoded.userId ? pair.userBId : pair.userAId,
          lastSentAt: new Date()
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: sentLetter,
      message: 'Letter sent successfully!'
    })

  } catch (error) {
    console.error('Error sending draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send letter' },
      { status: 500 }
    )
  }
}
