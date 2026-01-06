const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vehicles = await prisma.vehicle.count();
    const contacts = await prisma.contact.count();
    const assignments = await prisma.vehicleAssignment.count();

    console.log('--- DB Content Summary ---');
    console.log(`Vehicles: ${vehicles}`);
    console.log(`Contacts: ${contacts}`);
    console.log(`Assignments: ${assignments}`);

    if (vehicles > 0) {
        const v = await prisma.vehicle.findFirst();
        console.log('Example Vehicle:', JSON.stringify(v, null, 2));
    }

    if (contacts > 0) {
        const c = await prisma.contact.findFirst();
        console.log('Example Contact:', JSON.stringify(c, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
