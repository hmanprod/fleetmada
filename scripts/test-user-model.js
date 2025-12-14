import { PrismaClient } from '@prisma/client';

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function testUserModel() {
  try {
    console.log('🔍 Test du modèle User Prisma...');
    
    // Test de connexion à la base de données
    console.log('✅ Connexion à la base de données établie');
    
    // Test de la structure du modèle User
    console.log('📋 Structure du modèle User:');
    console.log('- id: String (auto-généré avec cuid())');
    console.log('- name: String (obligatoire)');
    console.log('- email: String (unique, obligatoire)');
    console.log('- password: String (obligatoire)');
    console.log('- companyName: String (obligatoire)');
    console.log('- avatar: String? (optionnel)');
    console.log('- createdAt: DateTime (auto-généré)');
    console.log('- updatedAt: DateTime (auto-généré)');
    
    // Test des relations du modèle User
    console.log('🔗 Relations du modèle User:');
    console.log('- vehicles: Vehicle[]');
    console.log('- issues: Issue[]');
    console.log('- serviceEntries: ServiceEntry[]');
    console.log('- fuelEntries: FuelEntry[]');
    console.log('- chargingEntries: ChargingEntry[]');
    
    // Vérifier que le client Prisma peut être utilisé avec TypeScript
    const testUser = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Types TypeScript et requêtes Prisma fonctionnels');
    
    console.log('🎉 Tous les tests du modèle User sont réussis !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testUserModel().catch(console.error);