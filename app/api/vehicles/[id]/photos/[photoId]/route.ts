import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { unlink } from 'fs/promises';
import path from 'path';

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
    { params }: { params: { id: string; photoId: string } }
) {
    const userId = await validateToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { photoId } = params;
        const body = await request.json();

        const photo = await prisma.photo.update({
            where: { id: photoId },
            data: {
                description: body.description,
                locationType: body.locationType,
                tags: body.tags,
                isPublic: body.isPublic,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: photo,
        });
    } catch (error) {
        console.error('Erreur lors de la modification de la photo:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; photoId: string } }
) {
    const userId = await validateToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { photoId } = params;

        // Get photo to delete file
        const photo = await prisma.photo.findUnique({
            where: { id: photoId },
        });

        if (!photo) {
            return NextResponse.json(
                { success: false, error: 'Photo non trouvée' },
                { status: 404 }
            );
        }

        // Delete file from disk
        try {
            const filePath = path.join(process.cwd(), 'public', photo.filePath);
            await unlink(filePath);
        } catch (fileError) {
            console.warn('Impossible de supprimer le fichier:', fileError);
        }

        // Delete database record
        await prisma.photo.delete({
            where: { id: photoId },
        });

        return NextResponse.json({
            success: true,
            message: 'Photo supprimée avec succès',
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
