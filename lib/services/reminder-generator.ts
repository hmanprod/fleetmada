import { prisma } from '@/lib/prisma'
import { NotificationService } from './notification-service'

export interface ReminderGenerationConfig {
  /**
   * Générer des rappels pour les services de programme
   */
  generateFromServicePrograms?: boolean
  
  /**
   * Générer des rappels pour les renouvellements basés sur les dates de dernière exécution
   */
  generateFromLastServiceEntries?: boolean
  
  /**
   * Générer des rappels pour les renouvellements de véhicules
   */
  generateVehicleRenewals?: boolean
  
  /**
   * Nombre de jours à l'avance pour générer les rappels
   */
  daysInAdvance?: number
  
  /**
   * Générer des rappels automatiques seulement pour les nouveaux véhicules
   */
  newVehiclesOnly?: boolean
}

export class ReminderGenerator {
  /**
   * Générer tous les rappels automatiques basés sur la configuration
   */
  static async generateAllReminders(config: ReminderGenerationConfig = {}) {
    const finalConfig: ReminderGenerationConfig = {
      generateFromServicePrograms: true,
      generateFromLastServiceEntries: true,
      generateVehicleRenewals: true,
      daysInAdvance: 30,
      newVehiclesOnly: false,
      ...config
    }

    console.log('[ReminderGenerator] Début de la génération des rappels automatiques')

    let remindersGenerated = 0
    let renewalsGenerated = 0

    try {
      if (finalConfig.generateFromServicePrograms) {
        const programReminders = await this.generateFromServicePrograms()
        remindersGenerated += programReminders
        console.log(`[ReminderGenerator] ${programReminders} rappels générés depuis les programmes de service`)
      }

      if (finalConfig.generateFromLastServiceEntries) {
        const serviceReminders = await this.generateFromLastServiceEntries(finalConfig.daysInAdvance!)
        remindersGenerated += serviceReminders
        console.log(`[ReminderGenerator] ${serviceReminders} rappels générés depuis les dernières entrées de service`)
      }

      if (finalConfig.generateVehicleRenewals) {
        const vehicleRenewals = await this.generateVehicleRenewals(finalConfig.daysInAdvance!)
        renewalsGenerated += vehicleRenewals
        console.log(`[ReminderGenerator] ${vehicleRenewals} renouvellements générés pour les véhicules`)
      }

      console.log(`[ReminderGenerator] Génération terminée: ${remindersGenerated} rappels et ${renewalsGenerated} renouvellements créés`)
      
      return {
        remindersGenerated,
        renewalsGenerated,
        total: remindersGenerated + renewalsGenerated
      }
    } catch (error) {
      console.error('[ReminderGenerator] Erreur lors de la génération:', error)
      throw error
    }
  }

  /**
   * Générer des rappels basés sur les programmes de service
   */
  private static async generateFromServicePrograms(): Promise<number> {
    try {
      // Récupérer tous les programmes de service actifs
      const servicePrograms = await prisma.serviceProgram.findMany({
        where: {
          active: true
        },
        include: {
          vehicles: {
            include: {
              vehicle: {
                include: {
                  reminders: true,
                  serviceEntries: {
                    orderBy: { date: 'desc' },
                    take: 1
                  }
                }
              }
            }
          },
          tasks: {
            include: {
              serviceTask: true
            }
          }
        }
      })

      let remindersCreated = 0

      for (const program of servicePrograms) {
        for (const programVehicle of program.vehicles) {
          const vehicle = programVehicle.vehicle
          
          // Vérifier s'il y a déjà un rappel actif pour ce programme
          const existingReminder = await prisma.serviceReminder.findFirst({
            where: {
              vehicleId: vehicle.id,
              status: { in: ['ACTIVE', 'OVERDUE'] },
              serviceTaskId: { not: null }
            }
          })

          if (existingReminder) {
            continue // Skip si un rappel existe déjà
          }

          // Générer un rappel basé sur la dernière entrée de service
          if (vehicle.serviceEntries.length > 0) {
            const lastService = vehicle.serviceEntries[0]
            const nextServiceDate = new Date(lastService.date)
            
            // Extraire l'intervalle du programme (en mois)
            const intervalMonths = this.extractIntervalMonths(program.frequency)
            if (intervalMonths > 0) {
              nextServiceDate.setMonth(nextServiceDate.getMonth() + intervalMonths)
              
              // Créer le rappel
              for (const programTask of program.tasks) {
                await prisma.serviceReminder.create({
                  data: {
                    vehicleId: vehicle.id,
                    serviceTaskId: programTask.serviceTaskId,
                    task: programTask.serviceTask.name,
                    status: 'ACTIVE',
                    nextDue: nextServiceDate,
                    type: 'date',
                    intervalMonths: intervalMonths,
                    lastServiceDate: lastService.date,
                    lastServiceMeter: lastService.meter || undefined
                  }
                })
                remindersCreated++
              }
            }
          }
        }
      }

      return remindersCreated
    } catch (error) {
      console.error('[ReminderGenerator] Erreur lors de la génération depuis les programmes:', error)
      throw error
    }
  }

  /**
   * Générer des rappels basés sur les dernières entrées de service
   */
  private static async generateFromLastServiceEntries(daysInAdvance: number): Promise<number> {
    try {
      // Récupérer tous les véhicules avec leurs dernières entrées de service
      const vehicles = await prisma.vehicle.findMany({
        include: {
          reminders: {
            where: {
              status: { in: ['ACTIVE', 'OVERDUE'] }
            }
          },
          serviceEntries: {
            orderBy: { date: 'desc' },
            take: 5, // Prendre les 5 dernières entrées
            include: {
              tasks: {
                include: {
                  serviceTask: true
                }
              }
            }
          }
        }
      })

      let remindersCreated = 0
      const now = new Date()
      const cutoffDate = new Date(now.getTime() + daysInAdvance * 24 * 60 * 60 * 1000)

      for (const vehicle of vehicles) {
        // Pour chaque entrée de service récente
        for (const serviceEntry of vehicle.serviceEntries) {
          // Pour chaque tâche de cette entrée
          for (const taskEntry of serviceEntry.tasks) {
            const serviceTask = taskEntry.serviceTask
            
            // Vérifier s'il y a déjà un rappel pour cette tâche
            const existingReminder = await prisma.serviceReminder.findFirst({
              where: {
                vehicleId: vehicle.id,
                serviceTaskId: serviceTask.id,
                status: { in: ['ACTIVE', 'OVERDUE'] }
              }
            })

            if (existingReminder) {
              continue // Skip si un rappel existe déjà
            }

            // Déterminer l'intervalle en fonction de la tâche
            const intervalMonths = this.getDefaultIntervalForTask(serviceTask.name)
            if (intervalMonths > 0) {
              const nextServiceDate = new Date(serviceEntry.date)
              nextServiceDate.setMonth(nextServiceDate.getMonth() + intervalMonths)

              // Créer seulement si la date est dans la période d'avance
              if (nextServiceDate <= cutoffDate) {
                await prisma.serviceReminder.create({
                  data: {
                    vehicleId: vehicle.id,
                    serviceTaskId: serviceTask.id,
                    task: serviceTask.name,
                    status: 'ACTIVE',
                    nextDue: nextServiceDate,
                    type: 'date',
                    intervalMonths: intervalMonths,
                    lastServiceDate: serviceEntry.date,
                    lastServiceMeter: serviceEntry.meter || undefined
                  }
                })
                remindersCreated++
              }
            }
          }
        }
      }

      return remindersCreated
    } catch (error) {
      console.error('[ReminderGenerator] Erreur lors de la génération depuis les entrées de service:', error)
      throw error
    }
  }

  /**
   * Générer des renouvellements pour les véhicules
   */
  private static async generateVehicleRenewals(daysInAdvance: number): Promise<number> {
    try {
      // Récupérer tous les véhicules avec leurs renouvellements existants
      const vehicles = await prisma.vehicle.findMany({
        include: {
          renewals: {
            where: {
              status: { in: ['DUE', 'OVERDUE'] }
            }
          }
        }
      })

      let renewalsCreated = 0
      const now = new Date()
      const cutoffDate = new Date(now.getTime() + daysInAdvance * 24 * 60 * 60 * 1000)

      for (const vehicle of vehicles) {
        // Déterminer les renouvellements nécessaires basés sur l'âge du véhicule
        const vehicleAge = now.getFullYear() - vehicle.year
        
        // Immatriculation (annuelle)
        const hasRegistrationRenewal = vehicle.renewals.some(r => r.type === 'REGISTRATION')
        if (!hasRegistrationRenewal && vehicleAge >= 0) {
          const nextYear = new Date(now.getFullYear() + 1, 0, 1) // 1er janvier de l'année prochaine
          
          if (nextYear <= cutoffDate) {
            await prisma.vehicleRenewal.create({
              data: {
                vehicleId: vehicle.id,
                type: 'REGISTRATION',
                status: 'DUE',
                dueDate: nextYear,
                provider: 'Système d\'immatriculation'
              }
            })
            renewalsCreated++
          }
        }

        // Assurance (annuelle)
        const hasInsuranceRenewal = vehicle.renewals.some(r => r.type === 'INSURANCE')
        if (!hasInsuranceRenewal && vehicleAge >= 0) {
          const insuranceDue = new Date(now.getFullYear(), now.getMonth() + 12, 1) // Un an à partir d'aujourd'hui
          
          if (insuranceDue <= cutoffDate) {
            await prisma.vehicleRenewal.create({
              data: {
                vehicleId: vehicle.id,
                type: 'INSURANCE',
                status: 'DUE',
                dueDate: insuranceDue,
                provider: 'Compagnie d\'assurance'
              }
            })
            renewalsCreated++
          }
        }

        // Contrôle technique (pour véhicules de plus de 4 ans)
        if (vehicleAge >= 4) {
          const hasInspectionRenewal = vehicle.renewals.some(r => r.type === 'INSPECTION')
          if (!hasInspectionRenewal) {
            const inspectionDue = new Date(now.getFullYear(), now.getMonth() + 6, 1) // Dans 6 mois
            
            if (inspectionDue <= cutoffDate) {
              await prisma.vehicleRenewal.create({
                data: {
                  vehicleId: vehicle.id,
                  type: 'INSPECTION',
                  status: 'DUE',
                  dueDate: inspectionDue,
                  provider: 'Centre de contrôle technique'
                }
              })
              renewalsCreated++
            }
          }
        }
      }

      return renewalsCreated
    } catch (error) {
      console.error('[ReminderGenerator] Erreur lors de la génération des renouvellements:', error)
      throw error
    }
  }

  /**
   * Extraire le nombre de mois à partir d'une fréquence (ex: "3months", "6months", "yearly")
   */
  private static extractIntervalMonths(frequency: string): number {
    const lowerFreq = frequency.toLowerCase()
    
    if (lowerFreq.includes('month')) {
      const match = lowerFreq.match(/(\d+)\s*month/)
      return match ? parseInt(match[1]) : 0
    }
    
    if (lowerFreq.includes('year') || lowerFreq === 'yearly') {
      return 12
    }
    
    if (lowerFreq.includes('quarter')) {
      return 3
    }
    
    if (lowerFreq.includes('week')) {
      return 1 // Approximation
    }
    
    return 0
  }

  /**
   * Obtenir l'intervalle par défaut pour une tâche de service
   */
  private static getDefaultIntervalForTask(taskName: string): number {
    const lowerName = taskName.toLowerCase()
    
    // Tâches communes et leurs intervalles
    if (lowerName.includes('vidange') || lowerName.includes('oil')) return 6 // 6 mois
    if (lowerName.includes('filtre') || lowerName.includes('filter')) return 12 // 12 mois
    if (lowerName.includes('pneu') || lowerName.includes('tire')) return 12 // 12 mois
    if (lowerName.includes('frein') || lowerName.includes('brake')) return 24 // 24 mois
    if (lowerName.includes('batterie') || lowerName.includes('battery')) return 36 // 36 mois
    if (lowerName.includes('courroie') || lowerName.includes('belt')) return 60 // 60 mois
    
    // Par défaut, 12 mois
    return 12
  }

  /**
   * Nettoyer les anciens rappels complétés ou expirés
   */
  static async cleanupOldReminders(daysOld: number = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      
      // Supprimer les rappels complétés anciens
      const completedReminders = await prisma.serviceReminder.deleteMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: cutoffDate
          }
        }
      })
      
      // Supprimer les renouvellements complétés anciens
      const completedRenewals = await prisma.vehicleRenewal.deleteMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: cutoffDate
          }
        }
      })
      
      console.log(`[ReminderGenerator] Nettoyage: ${completedReminders.count} rappels et ${completedRenewals.count} renouvellements supprimés`)
      
      return {
        remindersDeleted: completedReminders.count,
        renewalsDeleted: completedRenewals.count
      }
    } catch (error) {
      console.error('[ReminderGenerator] Erreur lors du nettoyage:', error)
      throw error
    }
  }

  /**
   * Vérifier et mettre à jour les statuts des rappels (ACTIVE -> OVERDUE)
   */
  static async updateReminderStatuses() {
    try {
      const now = new Date()
      
      // Mettre à jour les rappels en retard
      const overdueReminders = await prisma.serviceReminder.updateMany({
        where: {
          status: 'ACTIVE',
          nextDue: {
            lt: now
          }
        },
        data: {
          status: 'OVERDUE'
        }
      })
      
      // Mettre à jour les renouvellements en retard
      const overdueRenewals = await prisma.vehicleRenewal.updateMany({
        where: {
          status: 'DUE',
          dueDate: {
            lt: now
          }
        },
        data: {
          status: 'OVERDUE'
        }
      })
      
      console.log(`[ReminderGenerator] Statuts mis à jour: ${overdueReminders.count} rappels et ${overdueRenewals.count} renouvellements marqués en retard`)
      
      return {
        overdueReminders: overdueReminders.count,
        overdueRenewals: overdueRenewals.count
      }
    } catch (error) {
      console.error('[ReminderGenerator] Erreur lors de la mise à jour des statuts:', error)
      throw error
    }
  }
}