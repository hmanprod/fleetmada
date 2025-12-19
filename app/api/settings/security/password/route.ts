import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
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
    return decoded;
  } catch (error) {
    return null;
  }
};

// POST /api/settings/security/password - Change password
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = validateToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        error: 'Tous les champs sont requis' 
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        error: 'Les nouveaux mots de passe ne correspondent pas' 
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
      }, { status: 400 });
    }

    // Verify current password
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser || !dbUser.password) {
      return NextResponse.json({ 
        error: 'Utilisateur introuvable' 
      }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValid) {
      return NextResponse.json({ 
        error: 'Mot de passe actuel incorrect' 
      }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });
    
    // Mettre à jour la date de changement de mot de passe dans les settings de sécurité
    // S'assurer d'abord que les settings existent
    const existingSettings = await prisma.securitySettings.findUnique({
      where: { userId: userId }
    });
    
    if (existingSettings) {
      await prisma.securitySettings.update({
        where: { userId: userId },
        data: {
          passwordChanged: new Date(),
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.securitySettings.create({
        data: {
          userId: userId,
          passwordChanged: new Date(),
          twoFactorEnabled: false,
          sessionTimeout: 30,
          marketingEmails: true
        }
      });
    }

    console.log(`Password changed for user ${userId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Mot de passe modifié avec succès' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du changement de mot de passe',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
