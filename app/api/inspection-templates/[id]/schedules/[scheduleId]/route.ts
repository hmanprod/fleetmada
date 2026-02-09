import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const verifyToken = (request: NextRequest) => {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
        return null;
    }
};

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; scheduleId: string } }
) {
    const user = verifyToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Verify the schedule belongs to the template (optional but good for safety)
        const count = await prisma.inspectionSchedule.count({
            where: {
                id: params.scheduleId,
                templateId: params.id
            }
        });

        if (count === 0) {
            return NextResponse.json({ error: 'Schedule not found for this template' }, { status: 404 });
        }

        await prisma.inspectionSchedule.delete({
            where: { id: params.scheduleId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete schedule:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
