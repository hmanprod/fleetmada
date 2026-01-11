import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Development Seeding (Mock data)...');

    // Check if setup was run
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

    // Additional Companies
    console.log('🏢 Creating additional companies...');
    const transportIavola = await prisma.company.upsert({
        where: { name: 'Transport Iavola' },
        update: {},
        create: {
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

    const taxiBe = await prisma.company.upsert({
        where: { name: 'Taxi Be Express' },
        update: {},
        create: {
            name: 'Taxi Be Express',
            address: 'Avenue de l\'Europe, Analakely, Antananarivo 101, Madagascar',
            phone: '+261 20 22 987 65',
            description: 'Service de taxi urbain moderne',
            taxId: 'MGA-456789123',
            employees: 156,
            fleetSize: 89,
        },
    });

    // Additional Users
    console.log('👥 Creating additional users...');
    const fleetManager = await prisma.user.upsert({
        where: { email: 'marie.ratsimba@fleetmadagascar.mg' },
        update: {},
        create: {
            name: 'Marie Ratsimba',
            email: 'marie.ratsimba@fleetmadagascar.mg',
            password: userPassword,
            companyId: fleetMadagascar.id,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        },
    });

    const driver1 = await prisma.user.upsert({
        where: { email: 'paul.andriamanantsoa@fleetmadagascar.mg' },
        update: {},
        create: {
            name: 'Paul Andriamanantsoa',
            email: 'paul.andriamanantsoa@fleetmadagascar.mg',
            password: userPassword,
            companyId: fleetMadagascar.id,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
    });

    const transportManager = await prisma.user.upsert({
        where: { email: 'sophie@transport-iavola.mg' },
        update: {},
        create: {
            name: 'Sophie Razafindrakoto',
            email: 'sophie@transport-iavola.mg',
            password: userPassword,
            companyId: transportIavola.id,
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        },
    });

    const taxiDriver = await prisma.user.upsert({
        where: { email: 'alain@taxibe.mg' },
        update: {},
        create: {
            name: 'Alain Ratsahotra',
            email: 'alain@taxibe.mg',
            password: userPassword,
            companyId: taxiBe.id,
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        },
    });

    // Create Vehicles
    console.log('🚗 Creating vehicles...');
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
            status: 'ACTIVE',
            meterReading: 45670.5,
            userId: adminUser.id,
            fuelQuality: 'Diesel',
            fuelTankCapacity: 80,
            purchaseDate: new Date('2022-03-15'),
            purchasePrice: 145000000,
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
            status: 'ACTIVE',
            meterReading: 32840.2,
            userId: fleetManager.id,
            fuelQuality: 'Essence 95',
            fuelTankCapacity: 73,
        },
    });

    const vehicle3 = await prisma.vehicle.upsert({
        where: { vin: 'MMCELK1A0JH123456' },
        update: {},
        create: {
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
    });

    const vehicles = [vehicle1, vehicle2, vehicle3];

    // Vendores, Contacts, etc...
    console.log('🏪 Creating vendors...');
    const vendor = await prisma.vendor.upsert({
        where: { name: 'Toyota Madagascar' },
        update: {},
        create: {
            name: 'Toyota Madagascar',
            phone: '+261 20 22 456 78',
            address: 'Lot 45A Antsahavola, Antananarivo',
            contactName: 'Rakoto Ratsimba',
        },
    });

    const vendorTotal = await prisma.vendor.upsert({
        where: { name: 'Total Antsahavola' },
        update: {},
        create: {
            name: 'Total Antsahavola',
            address: 'Antsahavola',
        }
    });

    // Fuel Entries
    console.log('⛽ Creating fuel entries...');
    // Only create if we don't have one for this vehicle on this date to avoid duplicates on re-run
    const existingFuelEntry = await prisma.fuelEntry.findFirst({
        where: {
            vehicleId: vehicles[0].id,
            date: new Date('2024-12-10T08:30:00'),
        }
    });

    if (!existingFuelEntry) {
        await prisma.fuelEntry.create({
            data: {
                vehicleId: vehicles[0].id,
                userId: adminUser.id,
                date: new Date('2024-12-10T08:30:00'),
                vendorName: 'Total Antsahavola',
                vendorId: vendorTotal.id,
                usage: 12.5,
                volume: 50.0,
                cost: 150000.0,
                mpg: 8.2,
            },
        });
    }

    // Assignations
    console.log('👤 Creating assignments...');
    const existingAssignment = await prisma.vehicleAssignment.findFirst({
        where: {
            vehicleId: vehicles[0].id,
            operator: 'Paul Andriamanantsoa',
            status: 'ACTIVE'
        }
    });

    if (!existingAssignment) {
        await prisma.vehicleAssignment.create({
            data: {
                vehicleId: vehicles[0].id,
                operator: 'Paul Andriamanantsoa',
                startDate: new Date('2024-01-01'),
                status: 'ACTIVE',
            },
        });
    }

    // Groups
    console.log('👥 Creating groups...');
    const groupOps = await prisma.group.upsert({
        where: { name: 'Opérations' },
        update: {},
        create: { name: 'Opérations', color: '#008751' }
    });

    const groupSales = await prisma.group.upsert({
        where: { name: 'Ventes' },
        update: {},
        create: { name: 'Ventes', color: '#2563eb' }
    });

    const groupTech = await prisma.group.upsert({
        where: { name: 'Technique' },
        update: {},
        create: { name: 'Technique', color: '#dc2626' }
    });

    // Contacts with roles
    console.log('📇 Creating contacts with roles...');

    await prisma.contact.upsert({
        where: { email: 'jean.dupont@example.com' },
        update: {},
        create: {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com',
            phone: '+261 34 00 000 01',
            groupId: groupOps.id,
            userType: 'Driver',
            classifications: ['Operator', 'Employee'],
            status: 'ACTIVE',
            jobTitle: 'Chauffeur Senior',
            licenseNumber: 'T-12345',
            licenseClass: ['B', 'C']
        }
    });

    await prisma.contact.upsert({
        where: { email: 'marie.curie@example.com' },
        update: {},
        create: {
            firstName: 'Marie',
            lastName: 'Curie',
            email: 'marie.curie@example.com',
            phone: '+261 33 11 111 02',
            groupId: groupTech.id,
            userType: 'Technician',
            classifications: ['Technician', 'Employee'],
            status: 'ACTIVE',
            jobTitle: 'Mécanicienne Principale'
        }
    });

    await prisma.contact.upsert({
        where: { email: 'pierre.martin@example.com' },
        update: {},
        create: {
            firstName: 'Pierre',
            lastName: 'Martin',
            email: 'pierre.martin@example.com',
            phone: '+261 32 22 222 03',
            groupId: groupSales.id,
            userType: 'Manager',
            classifications: ['Manager', 'Employee'],
            status: 'ACTIVE',
            jobTitle: 'Responsable Commercial'
        }
    });

    // Add extra contacts for variety
    await prisma.contact.upsert({
        where: { email: 'luc.razon@example.com' },
        update: {},
        create: {
            firstName: 'Luc',
            lastName: 'Razon',
            email: 'luc.razon@example.com',
            phone: '+261 34 55 555 05',
            groupId: groupOps.id,
            userType: 'Driver',
            classifications: ['Operator', 'Employee'],
            status: 'ACTIVE',
            jobTitle: 'Chauffeur Livreur'
        }
    });

    console.log('✅ Development Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during development seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
