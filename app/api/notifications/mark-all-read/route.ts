import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: 'Token d\'authentification manquant' },
      { status: 401 }
    )
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return NextResponse.json(
      { success: false, error: 'Format de token invalide' },
      { status: 401 }
    )
  }

  const tokenPayload = validateToken(parts[1])
  if (!tokenPayload?.userId) {
    return NextResponse.json(
      { success: false, error: 'Token invalide ou expiré' },
      { status: 401 }
    )
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId: tokenPayload.userId,
      read: false
    },
    data: {
      read: true
    }
  })

  return NextResponse.json({
    success: true,
    message: `${result.count} notifications marquées comme lues`,
    data: {
      updatedCount: result.count
    }
  })
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Méthode GET non supportée' },
    { status: 405 }
  )
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode POST non supportée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée' },
    { status: 405 }
  )
}
