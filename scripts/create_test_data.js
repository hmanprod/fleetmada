const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log("Création des données de test...");

    // Créer des templates d'inspection
    const template1 = await prisma.inspectionTemplate.upsert({
      where: { id: 'test-template-1' },
      update: {},
      create: {
        id: 'test-template-1',
        name: 'Inspection de Sécurité Véhicule',
        description: 'Inspection complète des éléments de sécurité',
        category: 'Sécurité',
        isActive: true,
        items: {
          create: [
            {
              name: 'Freins',
              description: 'Vérification du système de freins',
              category: 'Sécurité',
              isRequired: true,
              sortOrder: 1
            },
            {
              name: 'Pneus',
              description: 'Vérification de l\'état des pneus',
              category: 'Sécurité',
              isRequired: true,
              sortOrder: 2
            },
            {
              name: 'Lumières',
              description: 'Vérification de tous les feux',
              category: 'Sécurité',
              isRequired: true,
              sortOrder: 3
            }
          ]
        }
      }
    });

    const template2 = await prisma.inspectionTemplate.upsert({
      where: { id: 'test-template-2' },
      update: {},
      create: {
        id: 'test-template-2',
        name: 'Inspection d\'Entretien Régulier',
        description: 'Inspection standard d\'entretien',
        category: 'Entretien',
        isActive: true,
        items: {
          create: [
            {
              name: 'Niveau d\'huile',
              description: 'Vérification du niveau d\'huile moteur',
              category: 'Entretien',
              isRequired: true,
              sortOrder: 1
            },
            {
              name: 'Filtres',
              description: 'Vérification des filtres',
              category: 'Entretien',
              isRequired: false,
              sortOrder: 2
            }
          ]
        }
      }
    });

    console.log("Templates créés:", template1.name, template2.name);

    // Créer quelques véhicules de test s'il n'y en a pas
    const vehiclesCount = await prisma.vehicle.count();
    if (vehiclesCount === 0) {
      await prisma.vehicle.createMany({
        data: [
          {
            internal_id: 'TEST-001',
            make: 'Freightliner',
            model: 'Cascadia',
            year: 2022,
            vin: '1HGBH41JXMN109186',
            status: 'ACTIVE',
            type: 'TRUCK'
          },
          {
            internal_id: 'TEST-002', 
            make: 'Peterbilt',
            model: '579',
            year: 2021,
            vin: '1HGBH41JXMN109187',
            status: 'ACTIVE',
            type: 'TRUCK'
          }
        ]
      });
      console.log("Véhicules de test créés");
    }

    // Créer quelques issues de test
    const issuesCount = await prisma.issue.count();
    if (issuesCount === 0) {
      const vehicle = await prisma.vehicle.findFirst();
      if (vehicle) {
        await prisma.issue.create({
          data: {
            vehicleId: vehicle.id,
            userId: 'test-user',
            summary: 'Problème de freins détecté',
            status: 'OPEN',
            priority: 'HIGH',
            reportedDate: new Date(),
            labels: ['Sécurité', 'Freins'],
            watchers: 1
          }
        });
        console.log("Issue de test créée");
      }
    }

    console.log("Données de test créées avec succès !");

  } catch (error) {
    console.error('Erreur lors de la création des données de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
