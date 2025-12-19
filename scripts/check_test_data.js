
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const vehiclesCount = await prisma.vehicle.count();
    console.log(`Vehicles: ${vehiclesCount}`);
    
    const templatesCount = await prisma.inspectionTemplate.count();
    console.log(`Templates: ${templatesCount}`);

    const issuesCount = await prisma.issue.count();
    console.log(`Issues: ${issuesCount}`);
    
    if (templatesCount === 0) {
        console.log("Creating a test template...");
        await prisma.inspectionTemplate.create({
            data: {
                name: 'Test Template',
                category: 'General',
                items: {
                    create: [
                        { label: 'Check engine', type: 'PASS_FAIL' },
                        { label: 'Tire pressure', type: 'TEXT' }
                    ]
                }
            }
        });
        console.log("Test template created.");
    }

    if (vehiclesCount === 0) {
        console.log("Creating a test vehicle...");
        await prisma.vehicle.create({
            data: {
                internal_id: 'V-001',
                make: 'TestMake',
                model: 'TestModel',
                year: 2023,
                vin: 'TESTVIN123456',
                status: 'ACTIVE',
                type: 'TRUCK'
            }
        });
        console.log("Test vehicle created.");
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
