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

    // Seed Service Tasks
    console.log('🛠️ Seeding Service Tasks...');
    const serviceTasks = [
        // 🛑 Freinage / Sécurité
        { name: 'Remplacement du module de contrôle ABS', categoryCode: '1', systemCode: '013', assemblyCode: '001', reasonForRepairCode: '02' },
        { name: 'Remplacement de la cartouche déshiccante du sécheur d’air', categoryCode: '1', systemCode: '013', assemblyCode: '002', reasonForRepairCode: '01' },
        { name: 'Remplacement de l’airbag – porte conducteur', categoryCode: '1', systemCode: '014', assemblyCode: '001', reasonForRepairCode: '02' },
        { name: 'Remplacement de l’airbag – côté conducteur avant', categoryCode: '1', systemCode: '014', assemblyCode: '002', reasonForRepairCode: '02' },
        { name: 'Remplacement de l’airbag – porte passager', categoryCode: '1', systemCode: '014', assemblyCode: '003', reasonForRepairCode: '02' },
        { name: 'Remplacement de l’airbag – côté passager avant', categoryCode: '1', systemCode: '014', assemblyCode: '004', reasonForRepairCode: '02' },
        { name: 'Remplacement de l’airbag – porte de cabine', categoryCode: '1', systemCode: '014', assemblyCode: '005', reasonForRepairCode: '02' },
        { name: 'Remplacement de l’airbag – latéral / rideau', categoryCode: '1', systemCode: '014', assemblyCode: '006', reasonForRepairCode: '02' },
        { name: 'Inspection du système d’airbags', categoryCode: '1', systemCode: '014', assemblyCode: '007', reasonForRepairCode: '01' },

        // ❄️ Climatisation / Chauffage
        { name: 'Remplacement de l’accumulateur de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '001', reasonForRepairCode: '02' },
        { name: 'Remplacement du compresseur de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '002', reasonForRepairCode: '02' },
        { name: 'Remplacement du condenseur de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '003', reasonForRepairCode: '02' },
        { name: 'Remplacement de l’évaporateur de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '004', reasonForRepairCode: '02' },
        { name: 'Remplacement de la vanne d’expansion de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '005', reasonForRepairCode: '02' },
        { name: 'Remplacement du réservoir déshydrateur (receiver dryer)', categoryCode: '2', systemCode: '001', assemblyCode: '006', reasonForRepairCode: '02' },
        { name: 'Vidange, mise sous vide et recharge du système de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '007', reasonForRepairCode: '01' },
        { name: 'Test du système de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '008', reasonForRepairCode: '01' },
        { name: 'Inspection du condenseur de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '009', reasonForRepairCode: '01' },
        { name: 'Inspection du système de climatisation', categoryCode: '2', systemCode: '001', assemblyCode: '010', reasonForRepairCode: '01' },

        // ⚙️ Moteur / Admission
        { name: 'Inspection de la pédale d’accélérateur', categoryCode: '3', systemCode: '041', assemblyCode: '001', reasonForRepairCode: '01' },
        { name: 'Nettoyage de la grille anti-debris du conduit d’admission d’air', categoryCode: '3', systemCode: '042', assemblyCode: '001', reasonForRepairCode: '01' },
        { name: 'Inspection du manomètre de restriction du filtre à air', categoryCode: '3', systemCode: '042', assemblyCode: '002', reasonForRepairCode: '01' },

        // 🛠️ Suspension
        { name: 'Inspection des rotules de suspension pneumatique', categoryCode: '4', systemCode: '016', assemblyCode: '001', reasonForRepairCode: '01' },
        { name: 'Remplacement des rotules de suspension pneumatique', categoryCode: '4', systemCode: '016', assemblyCode: '002', reasonForRepairCode: '02' },
        { name: 'Suspension pneumatique – divers travaux', categoryCode: '4', systemCode: '016', assemblyCode: '003', reasonForRepairCode: '02' },
        { name: 'Inspection du système de suspension pneumatique', categoryCode: '4', systemCode: '016', assemblyCode: '004', reasonForRepairCode: '01' },
        { name: 'Lubrification du système de suspension pneumatique', categoryCode: '4', systemCode: '016', assemblyCode: '005', reasonForRepairCode: '01' },
        { name: 'Serrage au couple du système de suspension pneumatique', categoryCode: '4', systemCode: '016', assemblyCode: '006', reasonForRepairCode: '01' },

        // ⚡ Électricité / Démarrage
        { name: 'Remplacement de l’alternateur', categoryCode: '5', systemCode: '032', assemblyCode: '001', reasonForRepairCode: '02' },
        { name: 'Test de l’alternateur', categoryCode: '5', systemCode: '032', assemblyCode: '002', reasonForRepairCode: '01' },
        { name: 'Inspection de la batterie', categoryCode: '5', systemCode: '031', assemblyCode: '001', reasonForRepairCode: '01' },
        { name: 'Remplacement de la batterie', categoryCode: '5', systemCode: '031', assemblyCode: '002', reasonForRepairCode: '02' },
        { name: 'Entretien de la batterie', categoryCode: '5', systemCode: '031', assemblyCode: '003', reasonForRepairCode: '01' },
        { name: 'Test de la batterie', categoryCode: '5', systemCode: '031', assemblyCode: '004', reasonForRepairCode: '01' },
        { name: 'Inspection des câbles de batterie', categoryCode: '5', systemCode: '031', assemblyCode: '005', reasonForRepairCode: '01' },
        { name: 'Inspection des câbles de batterie (montage en série)', categoryCode: '5', systemCode: '031', assemblyCode: '006', reasonForRepairCode: '01' },
        { name: 'Inspection du câble batterie–masse', categoryCode: '5', systemCode: '043', assemblyCode: '001', reasonForRepairCode: '01' },
        { name: 'Inspection du câble batterie–boîtier de jonction', categoryCode: '5', systemCode: '043', assemblyCode: '002', reasonForRepairCode: '01' },
        { name: 'Inspection du câble batterie–démarreur', categoryCode: '5', systemCode: '043', assemblyCode: '003', reasonForRepairCode: '01' },

        // 🚗 Transmission automatique
        { name: 'Remplacement de la boîte de vitesses automatique complète', categoryCode: '6', systemCode: '026', assemblyCode: '001', reasonForRepairCode: '02' },
        { name: 'Remplacement du filtre de transmission automatique', categoryCode: '6', systemCode: '026', assemblyCode: '002', reasonForRepairCode: '01' },
        { name: 'Inspection du niveau d’huile de transmission automatique', categoryCode: '6', systemCode: '026', assemblyCode: '003', reasonForRepairCode: '01' },
        { name: 'Inspection des fuites de transmission automatique', categoryCode: '6', systemCode: '026', assemblyCode: '004', reasonForRepairCode: '01' },
        { name: 'Transmission automatique – divers travaux', categoryCode: '6', systemCode: '026', assemblyCode: '005', reasonForRepairCode: '02' },
        { name: 'Inspection du solénoïde de verrouillage de levier (Brake Shift Interlock)', categoryCode: '6', systemCode: '026', assemblyCode: '006', reasonForRepairCode: '01' },
        { name: 'Remplacement du filtre AWD (transmission intégrale)', categoryCode: '6', systemCode: '027', assemblyCode: '001', reasonForRepairCode: '01' },

        // 🚘 Transmission / Essieux
        { name: 'Remplacement de l’arbre de transmission (cardan)', categoryCode: '7', systemCode: '022', assemblyCode: '001', reasonForRepairCode: '02' },

        // 🧰 Divers / Administration
        { name: 'Accessoires / aménagements spécifiques – divers', categoryCode: '8', systemCode: '050', assemblyCode: '001', reasonForRepairCode: '03' },
        { name: 'Frais administratifs / divers', categoryCode: '8', systemCode: '091', assemblyCode: '001', reasonForRepairCode: '03' },
        { name: 'Pose d’autocollants de carrosserie', categoryCode: '8', systemCode: '050', assemblyCode: '002', reasonForRepairCode: '03' },
    ];

    for (const task of serviceTasks) {
        await prisma.serviceTask.create({
            data: task
        });
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
