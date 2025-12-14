const jwt = require('jsonwebtoken')

// Configuration
const JWT_SECRET = 'fleetmada-jwt-secret-key-2024-development-only'

// Générer un token JWT frais avec une date d'expiration valide
const generateFreshToken = () => {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = 24 * 60 * 60 // 24 heures en secondes
  
  const payload = {
    userId: 'cmj61fona0007uimckrb92fjs',
    email: 'test-api@example.com',
    type: 'login',
    iat: now,
    exp: now + expiresIn
  }

  const token = jwt.sign(payload, JWT_SECRET)
  return token
}

// Test avec le nouveau token
const testWithFreshToken = async () => {
  try {
    const token = generateFreshToken()
    console.log('Nouveau token généré:', token.substring(0, 50) + '...')
    
    // Décoder le token pour vérifier
    const decoded = jwt.decode(token)
    console.log('Token décodé:', {
      userId: decoded.userId,
      email: decoded.email,
      type: decoded.type,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString()
    })

    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Réponse:', JSON.stringify(data, null, 2))

    if (response.status === 200 && data.success) {
      console.log('✅ Déconnexion réussie avec le nouveau token !')
    } else {
      console.log('❌ Échec de la déconnexion')
    }

  } catch (error) {
    console.error('Erreur:', error.message)
  }
}

testWithFreshToken()