import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'
import { ApiResponse } from '@/types'

// PATCH - Toggle favorite status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const letterId = params.id

    // Find the letter and verify user has access
    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      include: {
        pair: true
      }
    })

    if (!letter) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Letter not found'
      }, { status: 404 })
    }

    // Check if user is part of this pair
    const isUserInPair = letter.pair.userAId === user.userId || letter.pair.userBId === user.userId

    if (!isUserInPair) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have access to this letter'
      }, { status: 403 })
    }

    // Toggle favorite status
    const updatedLetter = await prisma.letter.update({
      where: { id: letterId },
      data: {
        isFavorite: !letter.isFavorite
      },
      include: {
        author: {
          select: { id: true, displayName: true, username: true }
        }
      }
    })

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: { letter: updatedLetter },
      message: `Letter ${updatedLetter.isFavorite ? 'added to' : 'removed from'} favorites`
    })

  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
