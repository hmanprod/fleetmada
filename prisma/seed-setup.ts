import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

dotenv.config();
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const typeMap: Record<string, any> = {
    'Photo': 'PHOTO',
    'Date / Time': 'DATE_TIME',
    'Free Text': 'TEXT',
    'Dropdown': 'MULTIPLE_CHOICE',
    'Signature': 'SIGNATURE',
    'Meter Entry': 'METER',
    'Pass/Fail': 'PASS_FAIL',
    'Pass / Fail': 'PASS_FAIL',
    'Numeric': 'NUMERIC',
    'Number': 'NUMERIC',
    'Header': 'HEADER',
    'datetime': 'DATE_TIME'
};

async function seedTemplateFromJson(filePath: string, companyId: string) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { inspection_checklist } = JSON.parse(fileContent);
    const { metadata, sections } = inspection_checklist;

    console.log(`📝 Seeding template: ${metadata.title}...`);

    const template = await prisma.inspectionTemplate.create({
        data: {
            name: metadata.title,
            category: metadata.category || 'Général',
            description: metadata.description || '',
            color: metadata.color || null,
            isActive: true,
        }
    });

    let sortOrder = 1;
    for (const section of sections) {
        // Optionnel: On pourrait ajouter un header pour chaque section si besoin
        // Mais ici on va juste utiliser le section_name comme catégorie pour les items

        for (const item of section.items) {
            await prisma.inspectionTemplateItem.create({
                data: {
                    inspectionTemplateId: template.id,
                    name: item.item_name,
                    category: section.section_name,
                    isRequired: item.required ?? false,
                    sortOrder: sortOrder++,
                    type: typeMap[item.type] || 'PASS_FAIL',
                    options: item.choices ? item.choices.map((c: any) => c.label) : [],
                    unit: item.unit || null,
                    instructions: item.instructions || null,
                    shortDescription: item.short_description || null,
                    passLabel: item.pass_label || 'Pass',
                    failLabel: item.fail_label || 'Fail',
                    requirePhotoOnPass: item.require_photo_pass ?? item.require_photo_comment_pass ?? false,
                    requirePhotoOnFail: item.require_photo_fail ?? item.require_photo_comment_fail ?? item.require_photo_verification ?? false,
                    enableNA: item.enable_na ?? item.enable_na_option ?? true,
                    dateTimeType: (item.date_format === 'Date and Time' || item.date_format === 'datetime') ? 'DATE_TIME' : (item.date_format === 'Date Only' ? 'DATE_ONLY' : null),
                    requireSecondaryMeter: item.require_secondary_meter ?? false,
                    minRange: typeof item.minimum === 'number' ? item.minimum : (parseFloat(item.minimum) || null),
                    maxRange: typeof item.maximum === 'number' ? item.maximum : (parseFloat(item.maximum) || null),
                } as any
            });
        }
    }
}

async function main() {
    console.log('🌱 Starting Setup Seeding (Essential only)...');

    // Deleting existing data to ensure clean setup
    console.log('🧹 Cleaning existing data...');
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
    await prisma.vehicle.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.part.deleteMany();
    await prisma.serviceTask.deleteMany();
    await prisma.serviceProgram.deleteMany();
    await prisma.place.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    // Create essential admin password
    const adminPassword = await bcrypt.hash('testpassword123', 10);

    // Create main company
    console.log('🏢 Creating main company...');
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

    // Create main admin user
    console.log('👥 Creating admin user...');
    await prisma.user.create({
        data: {
            name: 'Jean Rakoto',
            email: 'admin@fleetmadagascar.mg',
            password: adminPassword,
            companyId: fleetMadagascar.id,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
    });

    // Seed Templates from JSON
    const templatesDir = path.join(__dirname, 'templates');
    const essentialTemplates = ['standard_inspection.json', 'daily_safety_inspection.json', 'accident.json'];

    for (const filename of essentialTemplates) {
        const filePath = path.join(templatesDir, filename);
        if (fs.existsSync(filePath)) {
            await seedTemplateFromJson(filePath, fleetMadagascar.id);
        }
    }

    console.log('✅ Setup Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during setup seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
