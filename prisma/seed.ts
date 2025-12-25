import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Nettoyer les données existantes
  console.log('🧹 Nettoyage des données existantes...');

  // Supprimer les entrées dépendantes d'autres entités d'abord
  await prisma.blacklistedToken.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.fuelEntry.deleteMany();
  await prisma.chargingEntry.deleteMany();
  await prisma.expenseEntry.deleteMany();
  await prisma.serviceEntryPart.deleteMany();
  await prisma.serviceTaskEntry.deleteMany();
  await prisma.serviceEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issueImage.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.serviceReminder.deleteMany();
  await prisma.meterEntry.deleteMany();
  await prisma.vehicleAssignment.deleteMany();
  await prisma.programVehicle.deleteMany();
  await prisma.vehicleRenewal.deleteMany();
  await prisma.inspectionResult.deleteMany();
  await prisma.inspectionItem.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.inspectionTemplateItem.deleteMany();
  await prisma.inspectionTemplate.deleteMany();
  await prisma.reportShare.deleteMany();
  await prisma.reportSchedule.deleteMany();
  await prisma.report.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.securitySettings.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.integration.deleteMany();

  // Supprimer les entités principales
  await prisma.vehicle.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.part.deleteMany();
  await prisma.serviceTask.deleteMany();
  await prisma.serviceProgram.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Hasher les mots de passe
  const adminPassword = await bcrypt.hash('testpassword123', 10);
  const userPassword = await bcrypt.hash('userpassword123', 10);

  // Créer les entreprises
  console.log('🏢 Création des entreprises...');
  const fleetMadagascar = await prisma.company.create({
    data: {
      name: 'FleetMadagascar SARL',
      address: 'Lot II M 89 Bis Antsahavola, Antananarivo 101, Madagascar',
      phone: '+261 20 22 123 45',
      website: 'https://fleetmadagascar.mg',
      description: 'Entreprise spécialisée dans la gestion de flotte automobile à Madagascar',
      taxId: 'MGA-123456789',
      employees: 45,
      fleetSize: 28,
    },
  });

  const transportIavola = await prisma.company.create({
    data: {
      name: 'Transport Iavola',
      address: 'Zone Industrielle Ivato, Antananarivo 105, Madagascar',
      phone: '+261 20 24 567 89',
      website: 'https://transport-iavola.mg',
      description: 'Société de transport et logistique',
      taxId: 'MGA-987654321',
      employees: 78,
      fleetSize: 52,
    },
  });

  const taxiBe = await prisma.company.create({
    data: {
      name: 'Taxi Be Express',
      address: 'Avenue de l\'Europe, Analakely, Antananarivo 101, Madagascar',
      phone: '+261 20 22 987 65',
      description: 'Service de taxi urbain moderne',
      taxId: 'MGA-456789123',
      employees: 156,
      fleetSize: 89,
    },
  });

  // Créer les utilisateurs
  console.log('👥 Création des utilisateurs...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Jean Rakoto',
      email: 'admin@fleetmadagascar.mg',
      password: adminPassword,
      companyId: fleetMadagascar.id,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  });

  const fleetManager = await prisma.user.create({
    data: {
      name: 'Marie Ratsimba',
      email: 'marie.ratsimba@fleetmadagascar.mg',
      password: userPassword,
      companyId: fleetMadagascar.id,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      name: 'Paul Andriamanantsoa',
      email: 'paul.andriamanantsoa@fleetmadagascar.mg',
      password: userPassword,
      companyId: fleetMadagascar.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  });

  const transportManager = await prisma.user.create({
    data: {
      name: 'Sophie Razafindrakoto',
      email: 'sophie@transport-iavola.mg',
      password: userPassword,
      companyId: transportIavola.id,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
  });

  const taxiDriver = await prisma.user.create({
    data: {
      name: 'Alain Ratsahotra',
      email: 'alain@taxibe.mg',
      password: userPassword,
      companyId: taxiBe.id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Créer quelques véhicules
  console.log('🚗 Création des véhicules...');
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        name: 'Toyota Hilux - FM-001-AA',
        vin: 'JTFB22H10A1234567',
        type: 'Camion',
        year: 2022,
        make: 'Toyota',
        model: 'Hilux',
        status: 'ACTIVE',
        meterReading: 45670.5,
        userId: adminUser.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Nissan Pathfinder - FM-002-BB',
        vin: '5N1AR2MN0HC123456',
        type: 'SUV',
        year: 2021,
        make: 'Nissan',
        model: 'Pathfinder',
        status: 'ACTIVE',
        meterReading: 32840.2,
        userId: fleetManager.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Mitsubishi L200 - FM-003-CC',
        vin: 'MMCELK1A0JH123456',
        type: 'Pickup',
        year: 2023,
        make: 'Mitsubishi',
        model: 'L200',
        status: 'ACTIVE',
        meterReading: 12340.8,
        userId: driver1.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Ford Transit - TI-001-DD',
        vin: '1FBAX2CM5MKA12345',
        type: 'Fourgonnette',
        year: 2022,
        make: 'Ford',
        model: 'Transit',
        status: 'MAINTENANCE',
        meterReading: 67890.3,
        userId: transportManager.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Peugeot 208 - TB-001-EE',
        vin: 'VF3CC8HZCJS123456',
        type: 'Berline',
        year: 2023,
        make: 'Peugeot',
        model: '208',
        status: 'ACTIVE',
        meterReading: 18750.6,
        userId: taxiDriver.id,
      },
    }),
  ]);

  // Créer quelques entrées de carburant
  console.log('⛽ Création des entrées de carburant...');
  const fuelEntries = await Promise.all([
    prisma.fuelEntry.create({
      data: {
        vehicleId: vehicles[0].id,
        userId: adminUser.id,
        date: new Date('2024-12-10T08:30:00'),
        vendorName: 'Total Antsahavola',
        usage: 12.5,
        volume: 50.0,
        cost: 150000.0, // En Ariary
        mpg: 8.2,
      },
    }),
    prisma.fuelEntry.create({
      data: {
        vehicleId: vehicles[1].id,
        userId: fleetManager.id,
        date: new Date('2024-12-11T14:15:00'),
        vendorName: 'Shell Ivato',
        usage: 11.8,
        volume: 45.0,
        cost: 135000.0,
        mpg: 8.9,
      },
    }),
    prisma.fuelEntry.create({
      data: {
        vehicleId: vehicles[4].id,
        userId: taxiDriver.id,
        date: new Date('2024-12-12T07:45:00'),
        vendorName: 'Evo Energy Behoririka',
        usage: 7.2,
        volume: 35.0,
        cost: 105000.0,
        mpg: 10.1,
      },
    }),
  ]);

  // Créer quelques entrées de recharge électrique
  console.log('🔌 Création des entrées de recharge...');
  const chargingEntries = await Promise.all([
    prisma.chargingEntry.create({
      data: {
        vehicleId: vehicles[4].id,
        userId: taxiDriver.id,
        date: new Date('2024-12-13T19:30:00'),
        location: 'Station de recharge JIRAMA Analakely',
        energyKwh: 28.5,
        cost: 28450.0,
        durationMin: 45,
      },
    }),
  ]);

  // Créer quelques fournisseurs
  console.log('🏪 Création des fournisseurs...');
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Toyota Madagascar',
        phone: '+261 20 22 456 78',
        website: 'https://toyota.mg',
        address: 'Lot 45A Antsahavola, Antananarivo',
        contactName: 'Rakoto Ratsimba',
        contactEmail: 'rakoto@toyota.mg',
        contactPhone: '+261 34 12 345 67',
        labels: ['Concessionnaire', 'Pièces détachées'],
        classification: ['Officiel', 'Premium'],
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Garage Central',
        phone: '+261 20 24 123 45',
        address: 'Avenue de la République, Antananarivo',
        contactName: 'Jean Claude',
        contactEmail: 'jc@garagecentral.mg',
        contactPhone: '+261 33 98 765 43',
        labels: ['Réparation', 'Maintenance'],
        classification: ['Local', 'Fiable'],
      },
    }),
  ]);

  // Créer quelques contacts
  console.log('📞 Création des contacts...');
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'Hery',
        lastName: 'Rakotoarivelo',
        email: 'hery.rakotoarivelo@example.mg',
        phone: '+261 34 11 22 33 4',
        group: 'Fournisseurs',
        jobTitle: 'Directeur Logistique',
        company: 'Entreprise Partner SARL',
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Voahangy',
        lastName: 'Andrianjafy',
        email: 'voahangy.andrianjafy@example.mg',
        phone: '+261 32 44 55 66 7',
        group: 'Clients',
        jobTitle: 'Responsable Achats',
        company: 'Société Cliente SA',
      },
    }),
  ]);

  // Créer quelques rappels de maintenance
  console.log('🔔 Création des rappels de maintenance...');
  const reminders = await Promise.all([
    prisma.serviceReminder.create({
      data: {
        vehicleId: vehicles[0].id,
        task: 'Vidange moteur',
        status: 'ACTIVE',
        nextDue: new Date('2025-01-15'),
        compliance: 85.5,
      },
    }),
    prisma.serviceReminder.create({
      data: {
        vehicleId: vehicles[1].id,
        task: 'Contrôle technique',
        status: 'ACTIVE',
        nextDue: new Date('2025-02-01'),
        compliance: 92.3,
      },
    }),
    prisma.serviceReminder.create({
      data: {
        vehicleId: vehicles[0].id,
        task: 'Changement des pneus',
        status: 'ACTIVE',
        nextDue: new Date('2025-03-01'),
        compliance: 75.0,
      },
    }),
  ]);

  // Créer des entrées de compteur (Meter History)
  console.log('📏 Création des entrées de compteur...');
  const meterEntries = await Promise.all([
    prisma.meterEntry.create({
      data: {
        vehicleId: vehicles[0].id,
        date: new Date('2024-12-15T09:00:00'),
        value: 45670.5,
        type: 'MILEAGE',
        source: 'Manual',
      },
    }),
    prisma.meterEntry.create({
      data: {
        vehicleId: vehicles[0].id,
        date: new Date('2024-12-10T10:00:00'),
        value: 45320.0,
        type: 'MILEAGE',
        source: 'FuelEntry',
      },
    }),
    prisma.meterEntry.create({
      data: {
        vehicleId: vehicles[1].id,
        date: new Date('2024-12-14T14:30:00'),
        value: 32840.2,
        type: 'MILEAGE',
        source: 'Manual',
      },
    }),
    prisma.meterEntry.create({
      data: {
        vehicleId: vehicles[2].id,
        date: new Date('2024-12-13T08:00:00'),
        value: 120.5,
        type: 'HOURS',
        source: 'Inspection',
      },
    }),
  ]);

  // Créer des entrées de service (Service History)
  console.log('🔧 Création de l\'historique de service...');
  const serviceEntries = await Promise.all([
    prisma.serviceEntry.create({
      data: {
        vehicleId: vehicles[0].id,
        userId: adminUser.id,
        date: new Date('2024-12-01'),
        status: 'COMPLETED',
        meter: 44500,
        totalCost: 205000.0,
        notes: 'Vidange moteur et filtre à huile',
        vendorId: vendors[1].id,
      },
    }),
    prisma.serviceEntry.create({
      data: {
        vehicleId: vehicles[1].id,
        userId: fleetManager.id,
        date: new Date('2024-11-25'),
        status: 'COMPLETED',
        meter: 32000,
        totalCost: 230000.0,
        notes: 'Changement des plaquettes de frein avant',
        vendorId: vendors[0].id,
      },
    }),
    prisma.serviceEntry.create({
      data: {
        vehicleId: vehicles[0].id,
        userId: adminUser.id,
        date: new Date('2024-10-15'),
        status: 'COMPLETED',
        meter: 42000,
        totalCost: 550000.0,
        notes: 'Révision complète 40 000 km',
        vendorId: vendors[0].id,
      },
    }),
  ]);

  // Créer des issues
  console.log('⚠️ Création des signalements...');
  const issues = await Promise.all([
    prisma.issue.create({
      data: {
        vehicleId: vehicles[0].id,
        userId: driver1.id,
        summary: 'Voyant moteur allumé - Le voyant moteur s\'est allumé ce matin lors du démarrage.',
        priority: 'HIGH',
        status: 'OPEN',
        reportedDate: new Date('2024-12-14'),
      },
    }),
    prisma.issue.create({
      data: {
        vehicleId: vehicles[1].id,
        userId: fleetManager.id,
        summary: 'Climatisation ne fonctionne pas - La climatisation ne refroidit plus correctement.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        reportedDate: new Date('2024-12-10'),
      },
    }),
    prisma.issue.create({
      data: {
        vehicleId: vehicles[3].id,
        userId: transportManager.id,
        summary: 'Bruit anormal dans le moteur - Un bruit métallique est audible lors de l\'accélération.',
        priority: 'HIGH',
        status: 'OPEN',
        reportedDate: new Date('2024-12-12'),
      },
    }),
  ]);

  // Créer des affectations de véhicules
  console.log('👤 Création des affectations de véhicules...');
  const vehicleAssignments = await Promise.all([
    prisma.vehicleAssignment.create({
      data: {
        vehicleId: vehicles[0].id,
        operator: 'Paul Andriamanantsoa',
        startDate: new Date('2024-01-01'),
        endDate: null,
        status: 'ACTIVE',
      },
    }),
    prisma.vehicleAssignment.create({
      data: {
        vehicleId: vehicles[1].id,
        operator: 'Marie Ratsimba',
        startDate: new Date('2024-06-01'),
        endDate: null,
        status: 'ACTIVE',
      },
    }),
    prisma.vehicleAssignment.create({
      data: {
        vehicleId: vehicles[4].id,
        operator: 'Alain Ratsahotra',
        startDate: new Date('2024-03-15'),
        endDate: null,
        status: 'ACTIVE',
      },
    }),
  ]);

  // Créer des templates d'inspection
  console.log('📝 Création des templates d\'inspection...');
  const inspectionTemplate = await prisma.inspectionTemplate.create({
    data: {
      name: 'Inspection Quotidienne Sécurité',
      category: 'Sécurité',
      description: 'Vérification de routine des éléments de sécurité du véhicule',
      items: {
        create: [
          { name: 'Freins', category: 'Mécanique', description: 'Vérifier l\'état des plaquettes et le liquide', isRequired: true, sortOrder: 1 },
          { name: 'Pneus', category: 'Extérieur', description: 'Vérifier la pression et l\'usure', isRequired: true, sortOrder: 2 },
          { name: 'Phares', category: 'Électricité', description: 'Vérifier le fonctionnement de tous les feux', isRequired: true, sortOrder: 3 },
          { name: 'Niveaux', category: 'Fluides', description: 'Huile, lave-glace, liquide de refroidissement', isRequired: false, sortOrder: 4 },
        ]
      }
    },
    include: { items: true }
  });

  // Créer des inspections de test
  console.log('🔍 Création des inspections de test...');
  await Promise.all([
    prisma.inspection.create({
      data: {
        vehicleId: vehicles[0].id,
        userId: adminUser.id,
        inspectionTemplateId: inspectionTemplate.id,
        title: 'Inspection Toyota Hilux - Hebdomadaire',
        status: 'SCHEDULED',
        scheduledDate: new Date('2024-12-25'),
        inspectorName: 'Jean Rakoto',
      }
    }),
    prisma.inspection.create({
      data: {
        vehicleId: vehicles[1].id,
        userId: adminUser.id,
        inspectionTemplateId: inspectionTemplate.id,
        title: 'Inspection Nissan Pathfinder - Mensuelle',
        status: 'DRAFT',
        scheduledDate: new Date('2024-12-28'),
        inspectorName: 'Jean Rakoto',
      }
    }),
    prisma.inspection.create({
      data: {
        vehicleId: vehicles[2].id,
        userId: adminUser.id,
        inspectionTemplateId: inspectionTemplate.id,
        title: 'Inspection Mitsubishi L200 - Sécurité',
        status: 'SCHEDULED',
        scheduledDate: new Date('2024-12-20'),
        inspectorName: 'Jean Rakoto',
      }
    })
  ]);

  console.log('✅ Seeding terminé avec succès!');
  console.log('\n📊 Résumé des données créées:');
  console.log(`- Entreprises: 3`);
  console.log(`- Utilisateurs: 5 (admin + utilisateurs)`);
  console.log(`- Véhicules: ${vehicles.length}`);
  console.log(`- Entrées carburant: ${fuelEntries.length}`);
  console.log(`- Entrées recharge: ${chargingEntries.length}`);
  console.log(`- Fournisseurs: ${vendors.length}`);
  console.log(`- Contacts: ${contacts.length}`);
  console.log(`- Rappels: ${reminders.length}`);
  console.log('\n🔑 Credentials de test:');
  console.log('Admin FleetMadagascar:');
  console.log('  Email: admin@fleetmadagascar.mg');
  console.log('  Mot de passe: testpassword123');
  console.log('\nUtilisateur FleetMadagascar:');
  console.log('  Email: marie.ratsimba@fleetmadagascar.mg');
  console.log('  Mot de passe: userpassword123');
  console.log('\nUtilisateur Transport Iavola:');
  console.log('  Email: sophie@transport-iavola.mg');
  console.log('  Mot de passe: userpassword123');
  console.log('\nUtilisateur Taxi Be:');
  console.log('  Email: alain@taxibe.mg');
  console.log('  Mot de passe: userpassword123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });