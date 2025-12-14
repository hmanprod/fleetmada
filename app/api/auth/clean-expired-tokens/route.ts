import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route pour nettoyer les tokens expirés de la blacklist
export async function POST(request: NextRequest) {
  try {
    // Nettoyer les tokens expirés
    const result = await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    console.log(`[Clean Expired Tokens] ${result.count} tokens expirés supprimés`)

    return NextResponse.json({
      success: true,
      message: `${result.count} tokens expirés supprimés`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('[Clean Expired Tokens] Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du nettoyage' },
      { status: 500 }
    )
  }
}