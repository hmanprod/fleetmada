/**
 * Script pour créer un utilisateur de test pour les tests d'API
 */

const API_BASE = 'http://localhost:3000'

const createTestUser = async () => {
  console.log('🔧 CRÉATION DE L\'UTILISATEUR DE TEST')
  console.log('======================================')
  
  try {
    // Tentative de création d'un utilisateur de test
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@fleetmada.com',
        password: 'testpassword123',
        companyName: 'FleetMada Test Company'
      })
    })

    if (response.ok) {
      const userData = await response.json()
      console.log('✅ Utilisateur de test créé avec succès')
      console.log(`📧 Email: test@fleetmada.com`)
      console.log(`🔑 Password: testpassword123`)
      console.log(`🆔 User ID: ${userData.user?.id}`)
    } else {
      const error = await response.json()
      if (response.status === 409) {
        console.log('⚠️  Utilisateur de test existe déjà')
        console.log(`📧 Email: test@fleetmada.com`)
        console.log(`🔑 Password: testpassword123`)
      } else {
        console.error('❌ Erreur lors de la création:', error)
      }
    }

    // Test de connexion
    console.log('\n🔐 TEST DE CONNEXION')
    console.log('=====================')
    
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@fleetmada.com',
        password: 'testpassword123'
      })
    })

    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Connexion réussie')
      console.log(`🎫 Token: ${loginData.token.substring(0, 20)}...`)
      return loginData.token
    } else {
      const error = await loginResponse.json()
      console.error('❌ Échec de la connexion:', error)
      return null
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error)
    return null
  }
}

// Vérification si le script est appelé directement
if (require.main === module) {
  createTestUser()
    .then(token => {
      if (token) {
        console.log('\n🎉 UTILISATEUR DE TEST PRÊT POUR LES TESTS')
      } else {
        console.log('\n❌ Impossible de préparer l\'utilisateur de test')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('Erreur:', error)
      process.exit(1)
    })
}

module.exports = { createTestUser }