const jwt = require('jsonwebtoken')

// Configuration
const JWT_SECRET = 'fleetmada-jwt-secret-key-2024-development-only'

// Générer un token JWT valide pour un utilisateur test
const generateValidToken = () => {
  const payload = {
    userId: 'cmj61fona0007uimckrb92fjs', // L'ID de l'utilisateur créé précédemment
    email: 'test-api@example.com',
    type: 'login',
    iat: Math.floor(Date.now() / 1000)
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
  return token
}

// Test de déconnexion avec token valide
const testLogout = async () => {
  try {
    const token = generateValidToken()
    console.log('Token généré:', token.substring(0, 50) + '...')

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
      console.log('✅ Déconnexion réussie !')
    } else {
      console.log('❌ Échec de la déconnexion')
    }

  } catch (error) {
    console.error('Erreur:', error.message)
  }
}

testLogout()