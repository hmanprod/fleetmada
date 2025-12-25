import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
        const { searchParams } = new URL(request.url);

        const locationType = searchParams.get('locationType');
        const search = searchParams.get('search');

        const whereClause: any = {
            entityType: 'vehicle',
            entityId: vehicleId,
        };

        if (locationType) {
            whereClause.locationType = locationType;
        }

        if (search) {
            whereClause.OR = [
                { fileName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const photos = await prisma.photo.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            data: photos,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des photos:', error);
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

        const file = formData.get('file') as File;
        const locationType = formData.get('locationType') as string | null;
        const description = formData.get('description') as string | null;
        const tagsStr = formData.get('tags') as string | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Fichier requis' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Seuls les fichiers image sont acceptés' },
                { status: 400 }
            );
        }

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos', 'vehicles', vehicleId);
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.name);
        const uniqueFileName = `${uuidv4()}${ext}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        const publicPath = `/uploads/photos/vehicles/${vehicleId}/${uniqueFileName}`;

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Parse tags
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

        // Create database record
        const photo = await prisma.photo.create({
            data: {
                entityType: 'vehicle',
                entityId: vehicleId,
                fileName: file.name,
                filePath: publicPath,
                fileSize: file.size,
                mimeType: file.type,
                locationType: locationType || undefined,
                description: description || undefined,
                tags: tags,
                userId: userId,
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
        console.error('Erreur lors de l\'upload de la photo:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
