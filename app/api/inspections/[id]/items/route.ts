
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// JWT Secret - should match other routes
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // 1. Authentication
        const authHeader = req.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            )
        }

        const token = authHeader.split(' ')[1]
        try {
            jwt.verify(token, JWT_SECRET)
        } catch {
            return NextResponse.json(
                { error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        // 2. Fetch Items
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { error: 'ID d\'inspection manquant' },
                { status: 400 }
            )
        }

        const items = await prisma.inspectionItem.findMany({
            where: {
                inspectionId: id
            },
            orderBy: {
                sortOrder: 'asc'
            },
            include: {
                templateItem: true
            }
        })

        return NextResponse.json({
            success: true,
            data: items
        })
    } catch (error) {
        console.error('Erreur lors de la récupération des items:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des items' },
            { status: 500 }
        )
    }
}
