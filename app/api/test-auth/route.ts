import { NextRequest, NextResponse } from 'next/server'

// Route de test simple pour vérifier l'authentification
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  const userName = request.headers.get('x-user-name')

  return NextResponse.json({
    success: true,
    message: 'Route de test accessible',
    user: {
      id: userId,
      email: userEmail,
      name: userName
    },
    timestamp: new Date().toISOString()
  })
}

// Gestion des méthodes non autorisées
export async function POST() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}