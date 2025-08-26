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
          select: { displayName: true, username: true }
        },
        pair: {
          include: {
            userA: { select: { displayName: true } },
            userB: { select: { displayName: true } }
          }
        }
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

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 80,
        bottom: 80,
        left: 80,
        right: 80,
      },
    })

    // Set up response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="letter-${letter.createdAt.toISOString().split('T')[0]}.pdf"`)

    // Create a readable stream from the PDF
    const stream = new ReadableStream({
      start(controller) {
        doc.on('data', (chunk) => {
          controller.enqueue(chunk)
        })
        
        doc.on('end', () => {
          controller.close()
        })

        // PDF Content
        // Header with vintage styling
        doc.fontSize(24)
           .fillColor('#704214')
           .font('Times-Roman')
           .text('SlowLetters', 50, 50)
           .fontSize(12)
           .fillColor('#8B7355')
           .text('Romance in Every Word', 50, 75)

        // Decorative line
        doc.moveTo(50, 100)
           .lineTo(545, 100)
           .strokeColor('#D4AF37')
           .lineWidth(2)
           .stroke()

        // Letter metadata
        const createdAt = letter.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        doc.fontSize(14)
           .fillColor('#704214')
           .font('Times-Bold')
           .text(`From: ${letter.author.displayName}`, 50, 130)
           .text(`Date: ${createdAt}`, 50, 150)

        // Letter content
        doc.fontSize(16)
           .fillColor('#2C1810')
           .font('Times-Roman')
           .text(letter.bodyText, 50, 200, {
             width: 495,
             align: 'left',
             lineGap: 8
           })

        // Footer
        const pageHeight = doc.page.height
        doc.fontSize(10)
           .fillColor('#8B7355')
           .text('Created with SlowLetters - Where love lives in every word', 50, pageHeight - 50, {
             width: 495,
             align: 'center'
           })

        // Finish the document
        doc.end()
      },
    })

    return new NextResponse(stream, { headers })

  } catch (error) {
    console.error('Generate PDF error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
