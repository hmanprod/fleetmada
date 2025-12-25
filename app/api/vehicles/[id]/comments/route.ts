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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const userId = await validateToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const vehicleId = params.id;

        // Fetch comments for this vehicle
        const comments = await prisma.comment.findMany({
            where: {
                entityType: 'vehicle',
                entityId: vehicleId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to match frontend expectations
        const transformedComments = comments.map((comment) => ({
            id: comment.id,
            message: comment.content,
            userName: comment.user?.name || comment.author || 'Anonyme',
            userAvatar: comment.user?.avatar,
            userId: comment.userId,
            entityType: comment.entityType,
            entityId: comment.entityId,
            parentId: comment.parentId,
            attachments: comment.attachments,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        }));

        return NextResponse.json({
            success: true,
            data: transformedComments,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const userId = await validateToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const vehicleId = params.id;
        const formData = await request.formData();

        const message = formData.get('message') as string;
        const parentId = formData.get('parentId') as string | null;

        if (!message?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Le message est requis' },
                { status: 400 }
            );
        }

        // Get user info for author field
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });

        // Handle attachments (simplified - store as JSON metadata)
        const attachments: { fileName: string; fileSize: number }[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('attachment_') && value instanceof File) {
                attachments.push({
                    fileName: value.name,
                    fileSize: value.size,
                });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content: message.trim(),
                entityType: 'vehicle',
                entityId: vehicleId,
                userId: userId,
                author: user?.name || 'Utilisateur',
                parentId: parentId || null,
                attachments: attachments.length > 0 ? attachments : undefined,
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
            entityType: comment.entityType,
            entityId: comment.entityId,
            parentId: comment.parentId,
            attachments: comment.attachments,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };

        return NextResponse.json({
            success: true,
            data: transformedComment,
        });
    } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
