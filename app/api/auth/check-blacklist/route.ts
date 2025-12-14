import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route pour vérifier si un token est dans la blacklist
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Vérifier si le token est blacklisté
    const blacklistedToken = await prisma.blacklistedToken.findUnique({
      where: { token }
    })

    const isBlacklisted = !!blacklistedToken

    return NextResponse.json({
      success: true,
      isBlacklisted,
      token: blacklistedToken?.token || null
    })

  } catch (error) {
    console.error('[Check Blacklist API] Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}