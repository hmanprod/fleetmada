const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

// Configuration
const JWT_SECRET = 'fleetmada-jwt-secret-key-2024-development-only'
const prisma = new PrismaClient()

// Test direct de la base de données
const testDatabase = async () => {
  try {
    console.log('🔍 Test de connexion à la base de données...')
    
    // Test 1: Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: 'cmj61fona0007uimckrb92fjs' }
    })
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }
    
    console.log('✅ Utilisateur trouvé:', user.email)
    
    // Test 2: Tester la lecture de la table BlacklistedToken
    const tokens = await prisma.blacklistedToken.findMany()
    console.log('✅ Table BlacklistedToken accessible, nombre de tokens:', tokens.length)
    
    // Test 3: Générer un token JWT valide
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'login',
      iat: Math.floor(Date.now() / 1000)
    }
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
    console.log('✅ Token généré:', token.substring(0, 50) + '...')
    
    // Test 4: Tester l'insertion dans la blacklist
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    const blacklistedToken = await prisma.blacklistedToken.create({
      data: {
        token: token,
        userId: user.id,
        expiresAt: expiresAt
      }
    })
    
    console.log('✅ Token ajouté à la blacklist:', blacklistedToken.id)
    
    // Test 5: Vérifier que le token est maintenant dans la blacklist
    const tokenCheck = await prisma.blacklistedToken.findUnique({
      where: { token: token }
    })
    
    if (tokenCheck) {
      console.log('✅ Token trouvé dans la blacklist')
    } else {
      console.log('❌ Token non trouvé dans la blacklist')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()