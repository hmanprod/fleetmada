import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// Interface pour les données du token JWT décodé
interface TokenPayload {
    userId: string
    email: string
    type: string
    iat: number
    exp?: number
}

// Schémas de validation
const IssueStatusUpdateSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
})

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
    console.log(`[Issue Status API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key'
        const decoded = jwt.verify(token, secret) as TokenPayload

        if (decoded.type !== 'login') {
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}

// POST /api/issues/[id]/status - Changer le statut d'un problème
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })
        }

        const userId = tokenPayload.userId
        const issueId = params.id

        const body = await request.json()
        const { status } = IssueStatusUpdateSchema.parse(body)

        const issue = await prisma.issue.findFirst({
            where: { id: issueId, userId }
        })

        if (!issue) {
            return NextResponse.json({ success: false, error: 'Problème non trouvé' }, { status: 404 })
        }

        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: { status, updatedAt: new Date() },
            include: {
                vehicle: true,
                user: true
            }
        })

        return NextResponse.json({
            success: true,
            data: updatedIssue,
            message: `Statut mis à jour vers ${status}`
        })

    } catch (error) {
        console.error('Error in status update route:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}
