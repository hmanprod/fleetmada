import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  type: string
}

const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = validateToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const assignments = await prisma.vehicleAssignment.findMany({
      where: { vehicleId: params.id },
      include: {
        contact: true
      },
      orderBy: { startDate: 'desc' }
    })

    return NextResponse.json({ success: true, data: assignments })

  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { operator, contactId, startDate, endDate, comments } = body

    const assignment = await prisma.vehicleAssignment.create({
      data: {
        vehicleId: params.id,
        operator,
        contactId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        comments
      }
    })

    return NextResponse.json({ success: true, data: assignment })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, operator, contactId, startDate, endDate, comments } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Assignment ID is required' }, { status: 400 })
    }

    const assignment = await prisma.vehicleAssignment.update({
      where: { id },
      data: {
        operator,
        contactId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        comments
      }
    })

    return NextResponse.json({ success: true, data: assignment })
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Assignment ID is required' }, { status: 400 })
    }

    await prisma.vehicleAssignment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
