
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateExpenseEntrySchema } from '@/lib/validations/vehicle-validations'
import jwt from 'jsonwebtoken'

// Interface pour les données du token JWT décodé
interface TokenPayload {
    userId: string
    email: string
    type: string
    iat: number
    exp?: number
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
    console.log(`[Global Expense API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key'
        const decoded = jwt.verify(token, secret) as TokenPayload

        if (decoded.type !== 'login') {
            console.log('[Global Expense API] Token type invalide:', decoded.type)
            return null
        }

        return decoded
    } catch (error) {
        console.log('[Global Expense API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
        return null
    }
}

// GET /api/expenses/[id] - Détails d'une dépense spécifique (sans vehicleId)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: expenseId } = params

        if (!expenseId) {
            return NextResponse.json(
                { success: false, error: 'ID de la dépense manquant' },
                { status: 400 }
            )
        }

        // Extraction et validation du token JWT
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })
        }

        const userId = tokenPayload.userId

        // Recherche de la dépense et vérification de l'appartenance
        const expense = await prisma.expenseEntry.findFirst({
            where: {
                id: expenseId,
                vehicle: {
                    userId // Vérifie que le véhicule appartient bien à l'utilisateur
                }
            },
            include: {
                vehicle: true,
                vendor: { select: { id: true, name: true } }
            }
        })

        if (!expense) {
            return NextResponse.json(
                { success: false, error: 'Dépense non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: expense
        })

    } catch (error) {
        console.error('Error fetching expense:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}

// PUT /api/expenses/[id] - Modification d'une dépense (sans vehicleId)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: expenseId } = params

        if (!expenseId) {
            return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })
        }

        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const tokenPayload = validateToken(token)
        if (!tokenPayload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const userId = tokenPayload.userId
        const body = await request.json()

        // Vérifier l'existence et les droits d'abord
        const existingExpense = await prisma.expenseEntry.findFirst({
            where: { id: expenseId, vehicle: { userId } }
        })

        if (!existingExpense) {
            return NextResponse.json({ success: false, error: 'Dépense introuvable' }, { status: 404 })
        }

        // Validation Zod, en injectant vehicleId de l'existant car le schéma le demande souvent ou pas?
        // UpdateExpenseEntrySchema demande vehicleId? vérifions.
        // UpdateExpenseEntrySchema est "CreateExpenseEntrySchema.partial().extend({ id: z.string() })".
        // Donc tous les champs sont optionnels.

        const updateData = UpdateExpenseEntrySchema.parse({ ...body, id: expenseId, vehicleId: existingExpense.vehicleId })

        const updateFields: any = { ...body }
        if (updateFields.date) updateFields.date = new Date(updateFields.date)

        // Nettoyage
        delete updateFields.id
        delete updateFields.vehicleId // On ne change pas le véhicule d'une expense généralement via cet endpoint simple
        delete updateFields.createdAt
        delete updateFields.updatedAt

        const updatedExpense = await prisma.expenseEntry.update({
            where: { id: expenseId },
            data: updateFields
        })

        return NextResponse.json({
            success: true,
            data: updatedExpense,
            message: 'Dépense mise à jour avec succès'
        })

    } catch (error) {
        console.error('Error updating expense:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ success: false, error: 'Validation error', details: error.message }, { status: 400 })
        }
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}

// DELETE /api/expenses/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: expenseId } = params;

        if (!expenseId) {
            return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 });
        }

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenPayload = validateToken(token);
        if (!tokenPayload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 });

        const userId = tokenPayload.userId;

        const existingExpense = await prisma.expenseEntry.findFirst({
            where: { id: expenseId, vehicle: { userId } }
        });

        if (!existingExpense) {
            return NextResponse.json({ success: false, error: 'Dépense introuvable' }, { status: 404 });
        }

        await prisma.expenseEntry.delete({
            where: { id: expenseId }
        });

        return NextResponse.json({ success: true, message: 'Dépense supprimée' });

    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
