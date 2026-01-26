import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    companyId?: string | null;
    type: string;
    iat: number;
    exp?: number;
}

export const validateToken = (request: NextRequest): TokenPayload | null => {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

        const token = parts[1];
        const secret = process.env.JWT_SECRET || 'fallback-secret-key';
        const decoded = jwt.verify(token, secret) as TokenPayload;

        if (decoded.type !== 'login') return null;

        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Génère un filtre Prisma de base basé sur le rôle de l'utilisateur.
 * @param token Payload du token JWT
 * @param relationPath (Optionnel) Chemin vers la relation 'user' si non direct (ex: 'vehicle.user')
 */
export const getBaseFilter = (token: TokenPayload, relationPath?: string) => {
    const { userId, companyId, role } = token;
    const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

    if (isAdminOrManager && companyId) {
        // Si c'est un admin, on filtre par entreprise
        if (!relationPath) {
            // Pour les modèles qui ont une relation directe avec User
            return { user: { companyId } };
        } else {
            // Pour les modèles avec relation imbriquée
            const filter: any = {};
            const parts = relationPath.split('.');
            let current = filter;
            for (let i = 0; i < parts.length; i++) {
                current[parts[i]] = i === parts.length - 1 ? { companyId } : {};
                current = current[parts[i]];
            }
            return filter;
        }
    }

    // Par défaut (ou si Driver/Tech), on filtre par l'utilisateur lui-même
    // Sauf si on veut plus de granularité (voir plus bas)
    return { userId };
};

/**
 * Vérifie si un utilisateur a accès à un véhicule (même entreprise ou propriétaire).
 */
export const checkVehicleAccess = async (vehicleId: string, userId: string): Promise<any | null> => {
    const { prisma } = await import('./prisma');

    // Chercher le véhicule et l'utilisateur
    const [vehicle, requestingUser] = await Promise.all([
        prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: { user: true }
        }),
        prisma.user.findUnique({
            where: { id: userId }
        })
    ]);

    if (!vehicle || !requestingUser) return null;

    // Accès si propriétaire direct
    if (vehicle.userId === userId) return vehicle;

    // Accès si même entreprise
    if (vehicle.user?.companyId && requestingUser.companyId && vehicle.user.companyId === requestingUser.companyId) {
        return vehicle;
    }

    return null;
};
