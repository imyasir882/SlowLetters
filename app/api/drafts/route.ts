import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/drafts - Get user's current draft
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

    // Get current draft
    const draft = await prisma.letter.findFirst({
      where: {
        pairId: pair.id,
        authorId: decoded.userId,
        isDraft: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: draft
    })

  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}

// POST /api/drafts - Create or update draft
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

    const { bodyText, draftId } = await request.json()

    if (!bodyText || bodyText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Letter content is required' },
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

    let draft

    if (draftId) {
      // Update existing draft
      draft = await prisma.letter.update({
        where: {
          id: draftId,
          authorId: decoded.userId,
          isDraft: true
        },
        data: {
          bodyText: bodyText.trim(),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new draft (first delete any existing draft)
      await prisma.letter.deleteMany({
        where: {
          pairId: pair.id,
          authorId: decoded.userId,
          isDraft: true
        }
      })

      draft = await prisma.letter.create({
        data: {
          pairId: pair.id,
          authorId: decoded.userId,
          bodyText: bodyText.trim(),
          isDraft: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: draft,
      message: 'Draft saved successfully'
    })

  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// DELETE /api/drafts - Delete draft
export async function DELETE(request: NextRequest) {
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

    // Delete all drafts for this user in this pair
    await prisma.letter.deleteMany({
      where: {
        pairId: pair.id,
        authorId: decoded.userId,
        isDraft: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
