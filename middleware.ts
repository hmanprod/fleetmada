import { NextRequest, NextResponse } from 'next/server'

// Fonction de logging
const logAuthAttempt = (action: string, details: any) => {
  console.log(`[Auth Middleware] ${new Date().toISOString()} - ${action}:`, details)
}

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/check-blacklist',
]

// Vérifier si une route est publique
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

// Vérifier si c'est une route API qui nécessite une protection
const isProtectedApiRoute = (pathname: string): boolean => {
  return pathname.startsWith('/api/') && !isPublicRoute(pathname)
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  logAuthAttempt('Request received', {
    method: request.method,
    pathname,
    userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'Unknown'
  })

  // Optional kill-switch: block Documents/Reports UI routes.
  // Default is to allow access; set FLEETMADA_DISABLE_DOCS_REPORTS_ROUTES=1 to enable blocking.
  const shouldBlockDocsReports = process.env.FLEETMADA_DISABLE_DOCS_REPORTS_ROUTES === '1'
  if (shouldBlockDocsReports) {
    const FORBIDDEN_ROUTES = ['/documents', '/reports']
    if (FORBIDDEN_ROUTES.some(route => pathname.startsWith(route))) {
      logAuthAttempt('Access to forbidden route blocked', { pathname })
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Autoriser l'accès aux routes non-API et aux ressources statiques
  if (!pathname.startsWith('/api/')) {
    logAuthAttempt('Non-API route, allowing access', { pathname })
    return NextResponse.next()
  }

  // Autoriser l'accès aux routes publiques
  if (isPublicRoute(pathname)) {
    logAuthAttempt('Public route, allowing access', { pathname })
    return NextResponse.next()
  }

  // Pour les routes API protégées, vérifier la présence du token Authorization
  if (isProtectedApiRoute(pathname)) {
    logAuthAttempt('Protected API route, checking authentication', { pathname })

    // Extraction du token depuis le header Authorization
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAuthAttempt('Missing authorization header', { pathname })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    // Vérification du format Bearer token
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAuthAttempt('Invalid authorization header format', {
        pathname,
        authHeader: authHeader.substring(0, 20) + '...'
      })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]

    // Vérification basique du format du token (en Edge Runtime, pas de crypto)
    if (!token || token.length < 10) {
      logAuthAttempt('Invalid token format', {
        pathname,
        tokenLength: token?.length || 0
      })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Vérifier la blacklist pour toutes les routes protégées
    try {
      const response = await fetch(new URL('/api/auth/check-blacklist', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.isBlacklisted) {
          logAuthAttempt('Token is blacklisted', {
            pathname,
            tokenType: authHeader.substring(0, 20) + '...'
          })
          return NextResponse.json(
            { success: false, error: 'Token invalide (déconnecté)' },
            { status: 401 }
          )
        }
      }
    } catch (error) {
      console.warn('[Middleware] Erreur lors de la vérification de la blacklist:', error)
      // En cas d'erreur, on continue mais on log l'erreur
    }

    logAuthAttempt('Basic token validation passed', {
      pathname,
      tokenType: authHeader.substring(0, 20) + '...'
    })

    // Continuer vers la route demandée (la validation JWT complète se fera dans la route)
    return NextResponse.next()
  }

  // Pour toute autre route API non listée, appliquer la protection par défaut
  logAuthAttempt('Default protection applied', { pathname })
  return NextResponse.json(
    { success: false, error: 'Route non autorisée' },
    { status: 403 }
  )
}
