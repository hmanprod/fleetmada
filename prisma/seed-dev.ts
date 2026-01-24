import dotenv from 'dotenv';
import { PrismaClient, VehicleStatus, IssueStatus, Priority, ServiceStatus, ReminderStatus, ContactStatus, PlaceType, RenewalType, RenewalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Development Seeding (Comprehensive Mock data)...');

    // 1. Initial Checks
    console.log('🔍 Checking for essential setup data...');
    const fleetMadagascar = await prisma.company.findFirst({
        where: { name: 'FleetMadagascar SARL' }
    });

    if (!fleetMadagascar) {
        throw new Error('Company "FleetMadagascar SARL" not found. Please run seed-setup.ts first.');
    }

    const adminUser = await prisma.user.findFirst({
        where: { email: 'admin@fleetmadagascar.mg' }
    });

    if (!adminUser) {
        throw new Error('Admin user not found. Please run seed-setup.ts first.');
    }

    const userPassword = await bcrypt.hash('userpassword123', 10);

    // 2. Places
    console.log('📍 Seeding Places...');
    const mainOffice = await prisma.place.upsert({
        where: { id: 'place-main-office' },
        update: {},
        create: {
            id: 'place-main-office',
            name: 'Siège Social Antananarivo',
            address: 'Lot II M 89 Bis Antsahavola, Antananarivo 101',
            placeType: PlaceType.OFFICE,
            companyId: fleetMadagascar.id,
            latitude: -18.9100,
            longitude: 47.5200,
        }
    });

    const garageCentrale = await prisma.place.upsert({
        where: { id: 'place-garage-central' },
        update: {},
        create: {
            id: 'place-garage-central',
            name: 'Garage Central FleetMada',
            address: 'Zone Industrielle Ivato, Antananarivo 105',
            placeType: PlaceType.SERVICE_CENTER,
            companyId: fleetMadagascar.id,
            latitude: -18.8000,
            longitude: 47.4800,
        }
    });

    // 3. Vehicles
    console.log('🚗 Seeding Vehicles...');
    const vehicle1 = await prisma.vehicle.upsert({
        where: { vin: 'JTFB22H10A1234567' },
        update: {},
        create: {
            name: 'Toyota Hilux - FM-001-AA',
            vin: 'JTFB22H10A1234567',
            type: 'Camion',
            year: 2022,
            make: 'Toyota',
            model: 'Hilux',
            status: VehicleStatus.ACTIVE,
            meterReading: 45670.5,
            userId: adminUser.id,
            fuelQuality: 'Diesel',
            fuelTankCapacity: 80,
            purchaseDate: new Date('2022-03-15'),
            purchasePrice: 145000000,
            licensePlate: '5678-TAB',
        },
    });

    const vehicle2 = await prisma.vehicle.upsert({
        where: { vin: '5N1AR2MN0HC123456' },
        update: {},
        create: {
            name: 'Nissan Pathfinder - FM-002-BB',
            vin: '5N1AR2MN0HC123456',
            type: 'SUV',
            year: 2021,
            make: 'Nissan',
            model: 'Pathfinder',
            status: VehicleStatus.ACTIVE,
            meterReading: 32840.2,
            userId: adminUser.id,
            fuelQuality: 'Essence 95',
            fuelTankCapacity: 73,
            licensePlate: '8912-TBC',
        },
    });

    const evVehicle = await prisma.vehicle.upsert({
        where: { vin: 'EV-TESLA-MODEL-3-2023' },
        update: {},
        create: {
            name: 'Tesla Model 3 - FM-EV01',
            vin: 'EV-TESLA-MODEL-3-2023',
            type: 'Berline Électrique',
            year: 2023,
            make: 'Tesla',
            model: 'Model 3',
            status: VehicleStatus.ACTIVE,
            meterReading: 1200.0,
            userId: adminUser.id,
            fuelQuality: 'Electric',
            licensePlate: '1234-TBD',
        }
    });

    // 4. Vendors
    console.log('🏪 Seeding Vendors...');
    const vendorToyota = await prisma.vendor.upsert({
        where: { name: 'Toyota Madagascar' },
        update: {},
        create: {
            name: 'Toyota Madagascar',
            phone: '+261 20 22 456 78',
            address: 'Lot 45A Antsahavola, Antananarivo',
            contactName: 'Rakoto Ratsimba',
            classification: ['Service', 'Parts']
        },
    });

    const vendorTotal = await prisma.vendor.upsert({
        where: { name: 'Total Antsahavola' },
        update: {},
        create: {
            name: 'Total Antsahavola',
            address: 'Antsahavola, Antananarivo',
            classification: ['Fuel']
        }
    });

    // 5. Contacts
    console.log('📇 Seeding Contacts...');
    const groupOps = await prisma.group.upsert({
        where: { name: 'Opérations' },
        update: {},
        create: { name: 'Opérations', color: '#008751' }
    });

    const contactDriver = await prisma.contact.upsert({
        where: { email: 'paul.driver@fleetmada.mg' },
        update: {},
        create: {
            firstName: 'Paul',
            lastName: 'Andriamanantsoa',
            email: 'paul.driver@fleetmada.mg',
            phone: '+261 34 00 000 01',
            groupId: groupOps.id,
            classifications: ['Operator', 'Employee'],
            status: ContactStatus.ACTIVE,
            jobTitle: 'Chauffeur Senior',
            placeId: mainOffice.id
        }
    });

    // 6. Issues
    console.log('⚠️ Seeding Issues...');
    await prisma.issue.create({
        data: {
            summary: 'Bruit suspect au freinage',
            status: IssueStatus.OPEN,
            priority: Priority.HIGH,
            reportedDate: new Date(),
            vehicleId: vehicle1.id,
            userId: adminUser.id,
            assignedTo: [contactDriver.id],
            labels: ['Freinage', 'Sécurité']
        }
    });

    await prisma.issue.create({
        data: {
            summary: 'Climatisation inefficace',
            status: IssueStatus.IN_PROGRESS,
            priority: Priority.MEDIUM,
            reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            vehicleId: vehicle2.id,
            userId: adminUser.id,
            labels: ['Confort']
        }
    });

    // 7. Fuel & Charging Entries
    console.log('⛽ Seeding Fuel & Charging Entries...');
    await prisma.fuelEntry.create({
        data: {
            vehicleId: vehicle1.id,
            userId: adminUser.id,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            vendorId: vendorTotal.id,
            volume: 45.0,
            cost: 180000,
            usage: 500,
            mpg: 10.5,
        }
    });

    await prisma.chargingEntry.create({
        data: {
            vehicleId: evVehicle.id,
            userId: adminUser.id,
            date: new Date(),
            location: 'Station Ivato',
            energyKwh: 65.5,
            cost: 45000,
            durationMin: 120
        }
    });

    // 8. Service Tasks & Entries (History)
    console.log('🛠️ Seeding Service History & Work Orders...');
    const vidangeTask = await prisma.serviceTask.findFirst({ where: { name: { contains: 'Vidange' } } });
    const inspectionTask = await prisma.serviceTask.findFirst({ where: { name: { contains: 'Inspection' } } });

    // Completed Service Entry (History)
    await prisma.serviceEntry.create({
        data: {
            vehicleId: vehicle1.id,
            userId: adminUser.id,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: ServiceStatus.COMPLETED,
            totalCost: 250000,
            meter: 42000,
            vendorId: vendorToyota.id,
            notes: 'Vidange standard des 40 000 km effectuée sans problème.',
            isWorkOrder: false,
            tasks: {
                create: [
                    { serviceTaskId: vidangeTask?.id || 'manual-task-1', cost: 150000, notes: 'Filtre à huile inclus' }
                ]
            }
        }
    });

    // Active Work Order
    await prisma.serviceEntry.create({
        data: {
            vehicleId: vehicle2.id,
            userId: adminUser.id,
            date: new Date(),
            status: ServiceStatus.IN_PROGRESS,
            totalCost: 0,
            priority: Priority.HIGH,
            isWorkOrder: true,
            assignedToContactId: contactDriver.id,
            scheduledStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            notes: 'Réparation de la clim et inspection générale.',
            tasks: {
                create: [
                    { serviceTaskId: inspectionTask?.id || 'manual-task-2', cost: 50000 }
                ]
            }
        }
    });

    // 9. Service Programs
    console.log('📅 Seeding Service Programs...');
    await prisma.serviceProgram.upsert({
        where: { id: 'prog-basic-maintenance' },
        update: {},
        create: {
            id: 'prog-basic-maintenance',
            name: 'Entretien de base Hilux',
            description: 'Plan d\'entretien standard pour Toyota Hilux tous les 10 000 km',
            frequency: '10000km',
            active: true,
            vehicles: {
                create: [
                    { vehicleId: vehicle1.id }
                ]
            },
            tasks: {
                create: [
                    { serviceTaskId: vidangeTask?.id || 'manual-task-1', estimatedCost: 150000 }
                ]
            }
        }
    });

    // 10. Service Reminders & Renewals
    console.log('⏰ Seeding Reminders & Renewals...');
    await prisma.serviceReminder.create({
        data: {
            vehicleId: vehicle1.id,
            serviceTaskId: vidangeTask?.id,
            status: ReminderStatus.ACTIVE,
            nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            nextDueMeter: 55000,
            lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            type: 'both'
        }
    });

    await prisma.vehicleRenewal.create({
        data: {
            vehicleId: vehicle1.id,
            type: RenewalType.INSURANCE,
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            cost: 1200000,
            status: RenewalStatus.DUE,
            provider: 'Toyota Madagascar'
        }
    });

    // 11. Parts & Inventory
    console.log('📦 Seeding Parts & Inventory...');
    const devParts = [
        {
            number: 'OIL-FL-800',
            description: 'Filtre à huile Premium Toyota',
            category: 'Filtration',
            manufacturer: 'Toyota Parts',
            cost: 45000,
            quantity: 25,
            minimumStock: 5
        },
        {
            number: 'BRK-PAD-101',
            description: 'Plaquettes de frein avant Hilux',
            category: 'Freinage',
            manufacturer: 'Brembo',
            cost: 185000,
            quantity: 10,
            minimumStock: 4
        },
        {
            number: 'BELT-ALT-202',
            description: 'Courroie d\'alternateur renforcée',
            category: 'Courroies',
            manufacturer: 'Gates',
            cost: 75000,
            quantity: 5,
            minimumStock: 2
        },
        {
            number: 'BATT-12V-70',
            description: 'Batterie 12V 70Ah sans entretien',
            category: 'Électricité',
            manufacturer: 'Varta',
            cost: 550000,
            quantity: 4,
            minimumStock: 2
        },
        {
            number: 'TIRE-ALL-TR',
            description: 'Pneu Tout Terrain 265/65R17',
            category: 'Pneus',
            manufacturer: 'BFGoodrich',
            cost: 850000,
            quantity: 8,
            minimumStock: 4
        }
    ];

    for (const part of devParts) {
        await prisma.part.upsert({
            where: { number: part.number },
            update: {},
            create: part
        });
    }

    // 12. Expenses
    console.log('💰 Seeding Expenses...');
    await prisma.expenseEntry.create({
        data: {
            vehicleId: vehicle1.id,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            type: 'Parking',
            vendorId: vendorToyota.id,
            source: 'Recu Manuel',
            amount: 5000,
            currency: 'MGA',
            notes: 'Parking à Ivato'
        }
    });

    // 13. Inspections
    console.log('📋 Seeding Inspections...');
    const standardTemplate = await prisma.inspectionTemplate.findFirst({ where: { name: { contains: 'standard' } } });
    if (standardTemplate) {
        await prisma.inspection.create({
            data: {
                vehicleId: vehicle1.id,
                inspectionTemplateId: standardTemplate.id,
                userId: adminUser.id,
                title: 'Inspection Standard Toyota Hilux',
                scheduledDate: new Date(),
                status: 'COMPLETED',
                complianceStatus: 'COMPLIANT',
                overallScore: 100,
                inspectorName: 'Jean Rakoto',
            }
        });
    }

    console.log('✅ Development Seeding completed successfully and comprehensively!');
}

main()
    .catch((e) => {
        console.error('❌ Error during development seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
