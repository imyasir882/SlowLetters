import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'
import { ApiResponse } from '@/types'
import { jsPDF } from 'jspdf'

// GET - Generate and download letter as PDF
export async function GET(
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
        author: {
          select: { id: true, displayName: true, username: true }
        },
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

    // Create PDF using jsPDF
    const pdf = new jsPDF()
    
    // Set up styling
    pdf.setFontSize(20)
    pdf.setFont('times', 'normal')
    
    // Title
    pdf.text('SlowLetters', 105, 20, { align: 'center' })
    
    // Letter details
    pdf.setFontSize(12)
    pdf.text(`From: ${letter.author.displayName}`, 20, 40)
    pdf.text(`Date: ${letter.createdAt.toLocaleDateString()}`, 20, 50)
    
    // Letter content with word wrapping
    pdf.setFontSize(11)
    const splitText = pdf.splitTextToSize(letter.bodyText, 170)
    pdf.text(splitText, 20, 70)
    
    // Convert to buffer
    const pdfBuffer = pdf.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="letter-${letterId}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Generate PDF error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to generate PDF'
    }, { status: 500 })
  }
}
