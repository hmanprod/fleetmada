import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    email: string;
    type: string;
}

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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenPayload = validateToken(token);
        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const data = await request.json();
        const group = await prisma.group.update({
            where: { id: params.id },
            data: {
                name: data.name,
                color: data.color,
            },
        });

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ success: false, error: 'A group with this name already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenPayload = validateToken(token);
        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        await prisma.group.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
