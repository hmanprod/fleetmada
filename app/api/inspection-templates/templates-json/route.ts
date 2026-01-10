import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Interface pour les données du token JWT décodé
interface TokenPayload {
    userId: string;
    email: string;
    type: string;
    iat: number;
    exp?: number;
}

const typeMap: Record<string, any> = {
    'Photo': 'PHOTO',
    'Date / Time': 'DATE_TIME',
    'Free Text': 'TEXT',
    'Dropdown': 'MULTIPLE_CHOICE',
    'Signature': 'SIGNATURE',
    'Meter Entry': 'METER',
    'Pass/Fail': 'PASS_FAIL',
    'Pass / Fail': 'PASS_FAIL',
    'Numeric': 'NUMERIC',
    'Number': 'NUMERIC',
    'Header': 'HEADER'
};

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key';
        const decoded = jwt.verify(token, secret) as TokenPayload;
        if (decoded.type !== 'login') return null;
        return decoded;
    } catch (error) {
        return null;
    }
};

const getTemplatesDir = () => path.join(process.cwd(), 'prisma', 'templates');

// GET /api/inspection-templates/templates-json - Liste les fichiers JSON disponibles
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !validateToken(authHeader.split(' ')[1])) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const templatesDir = getTemplatesDir();
        if (!fs.existsSync(templatesDir)) {
            return NextResponse.json({ success: true, data: [] });
        }

        const files = fs.readdirSync(templatesDir);
        const templates = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
                try {
                    const data = JSON.parse(content);
                    const { metadata } = data.inspection_checklist;
                    return {
                        filename: file,
                        title: metadata.title,
                        category: metadata.category,
                        description: metadata.description
                    };
                } catch (e) {
                    return null;
                }
            })
            .filter(item => item !== null);

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST /api/inspection-templates/templates-json - Crée un template à partir d'un fichier JSON
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const tokenPayload = validateToken(authHeader?.split(' ')[1] || '');
        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const { filename } = await request.json();
        if (!filename) {
            return NextResponse.json({ success: false, error: 'Nom de fichier requis' }, { status: 400 });
        }

        const filePath = path.join(getTemplatesDir(), filename);
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'Fichier non trouvé' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { inspection_checklist } = JSON.parse(fileContent);
        const { metadata, sections } = inspection_checklist;

        // Création du template
        const template = await prisma.$transaction(async (tx) => {
            const newTemplate = await tx.inspectionTemplate.create({
                data: {
                    name: `${metadata.title} (Template)`,
                    category: metadata.category || 'Général',
                    description: metadata.description || '',
                    isActive: true,
                }
            });

            let sortOrder = 1;
            for (const section of sections) {
                for (const item of section.items) {
                    await tx.inspectionTemplateItem.create({
                        data: {
                            inspectionTemplateId: newTemplate.id,
                            name: item.item_name,
                            category: section.section_name,
                            isRequired: item.required ?? false,
                            sortOrder: sortOrder++,
                            type: typeMap[item.type] || 'PASS_FAIL',
                            options: item.choices ? item.choices.map((c: any) => c.label) : [],
                            unit: item.unit || null,
                            instructions: item.instructions || null,
                            shortDescription: item.short_description || null,
                            passLabel: item.pass_label || 'Pass',
                            failLabel: item.fail_label || 'Fail',
                            requirePhotoOnPass: item.require_photo_pass ?? item.require_photo_comment_pass ?? false,
                            requirePhotoOnFail: item.require_photo_fail ?? item.require_photo_comment_fail ?? item.require_photo_verification ?? false,
                            enableNA: item.enable_na ?? item.enable_na_option ?? true,
                            dateTimeType: item.date_format === 'Date and Time' ? 'DATE_TIME' : (item.date_format === 'Date Only' ? 'DATE_ONLY' : null),
                            requireSecondaryMeter: item.require_secondary_meter ?? false,
                            minRange: typeof item.minimum === 'number' ? item.minimum : (parseFloat(item.minimum) || null),
                            maxRange: typeof item.maximum === 'number' ? item.maximum : (parseFloat(item.maximum) || null),
                        } as any
                    });
                }
            }
            return newTemplate;
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Error creating template from JSON:', error);
        return NextResponse.json({ success: false, error: 'Erreur lors de la création du template' }, { status: 500 });
    }
}
