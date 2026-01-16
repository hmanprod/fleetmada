import { prisma } from './prisma'

/**
 * Vérifie si un utilisateur a accès à un véhicule (soit propriétaire, soit même entreprise)
 */
export async function checkVehicleAccess(vehicleId: string, userId: string) {
    // Récupération de l'utilisateur courant pour obtenir son companyId
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
    })

    const vehicle = await prisma.vehicle.findFirst({
        where: {
            id: vehicleId,
            OR: [
                { userId }, // Propriétaire
                ...(currentUser?.companyId ? [{ user: { companyId: currentUser.companyId } }] : []) // Même entreprise
            ]
        },
        include: {
            _count: {
                select: {
                    fuelEntries: true,
                    serviceEntries: true,
                    issues: true,
                    chargingEntries: true,
                    meterEntries: true,
                    reminders: true,
                    expenses: true,
                    assignments: true
                }
            }
        }
    })

    return vehicle
}
