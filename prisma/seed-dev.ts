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

    // Additional Users
    console.log('👥 Creating additional users...');
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

    // Create Vehicles
    console.log('🚗 Creating vehicles...');
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
                fuelQuality: 'Diesel',
                fuelTankCapacity: 80,
                purchaseDate: new Date('2022-03-15'),
                purchasePrice: 145000000,
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
                fuelQuality: 'Essence 95',
                fuelTankCapacity: 73,
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
    ]);

    // Fuel Entries
    console.log('⛽ Creating fuel entries...');
    await prisma.fuelEntry.create({
        data: {
            vehicleId: vehicles[0].id,
            userId: adminUser.id,
            date: new Date('2024-12-10T08:30:00'),
            vendorName: 'Total Antsahavola',
            usage: 12.5,
            volume: 50.0,
            cost: 150000.0,
            mpg: 8.2,
        },
    });

    // Vendores, Contacts, etc...
    console.log('🏪 Creating vendors...');
    const vendor = await prisma.vendor.create({
        data: {
            name: 'Toyota Madagascar',
            phone: '+261 20 22 456 78',
            address: 'Lot 45A Antsahavola, Antananarivo',
            contactName: 'Rakoto Ratsimba',
        },
    });

    // Assignations
    console.log('👤 Creating assignments...');
    await prisma.vehicleAssignment.create({
        data: {
            vehicleId: vehicles[0].id,
            operator: 'Paul Andriamanantsoa',
            startDate: new Date('2024-01-01'),
            status: 'ACTIVE',
        },
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
