import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to validate token
async function validateToken(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; commentId: string } }
) {
    const userId = await validateToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { commentId } = params;
        const body = await request.json();

        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content: body.message,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        const transformedComment = {
            id: comment.id,
            message: comment.content,
            userName: comment.user?.name || comment.author || 'Anonyme',
            userAvatar: comment.user?.avatar,
            userId: comment.userId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };

        return NextResponse.json({
            success: true,
            data: transformedComment,
        });
    } catch (error) {
        console.error('Erreur lors de la modification du commentaire:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; commentId: string } }
) {
    const userId = await validateToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { commentId } = params;

        await prisma.comment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({
            success: true,
            message: 'Commentaire supprimé avec succès',
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
