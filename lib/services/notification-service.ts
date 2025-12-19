import { prisma } from '@/lib/prisma'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'REMINDER_DUE' | 'REMINDER_OVERDUE' | 'ASSIGNMENT' | 'COMMENT' | 'SYSTEM'
  link?: string
}

export class NotificationService {
  /**
   * Créer une nouvelle notification
   */
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link || null,
          read: false
        }
      })
      
      console.log(`[NotificationService] Notification créée: ${notification.id}`)
      return notification
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la création:', error)
      throw error
    }
  }

  /**
   * Envoyer une notification de rappel d'échéance
   */
  static async sendReminderDueNotification(
    userId: string,
    vehicleName: string,
    task: string,
    dueDate: Date,
    daysUntilDue: number
  ) {
    const title = `Rappel de service: ${vehicleName}`
    const message = `Le service "${task}" pour ${vehicleName} est dû dans ${daysUntilDue} jour(s) (${dueDate.toLocaleDateString()}).`
    
    return await this.createNotification({
      userId,
      title,
      message,
      type: 'REMINDER_DUE',
      link: '/reminders/service'
    })
  }

  /**
   * Envoyer une notification de rappel en retard
   */
  static async sendReminderOverdueNotification(
    userId: string,
    vehicleName: string,
    task: string,
    dueDate: Date,
    daysOverdue: number
  ) {
    const title = `Service en retard: ${vehicleName}`
    const message = `Le service "${task}" pour ${vehicleName} est en retard de ${daysOverdue} jour(s) (dû le ${dueDate.toLocaleDateString()}).`
    
    return await this.createNotification({
      userId,
      title,
      message,
      type: 'REMINDER_OVERDUE',
      link: '/reminders/service'
    })
  }

  /**
   * Envoyer une notification de renouvellement dû
   */
  static async sendRenewalDueNotification(
    userId: string,
    vehicleName: string,
    renewalType: string,
    dueDate: Date,
    daysUntilDue: number
  ) {
    const typeNames: { [key: string]: string } = {
      'REGISTRATION': 'immatriculation',
      'INSURANCE': 'assurance',
      'INSPECTION': 'contrôle technique',
      'EMISSION_TEST': 'test d\'émission',
      'OTHER': 'renouvellement'
    }

    const typeName = typeNames[renewalType] || renewalType.toLowerCase()
    const title = `Renouvellement dû: ${vehicleName}`
    const message = `Le ${typeName} pour ${vehicleName} est dû dans ${daysUntilDue} jour(s) (${dueDate.toLocaleDateString()}).`
    
    return await this.createNotification({
      userId,
      title,
      message,
      type: 'REMINDER_DUE',
      link: '/reminders/vehicle-renewals'
    })
  }

  /**
   * Envoyer une notification de renouvellement en retard
   */
  static async sendRenewalOverdueNotification(
    userId: string,
    vehicleName: string,
    renewalType: string,
    dueDate: Date,
    daysOverdue: number
  ) {
    const typeNames: { [key: string]: string } = {
      'REGISTRATION': 'immatriculation',
      'INSURANCE': 'assurance',
      'INSPECTION': 'contrôle technique',
      'EMISSION_TEST': 'test d\'émission',
      'OTHER': 'renouvellement'
    }

    const typeName = typeNames[renewalType] || renewalType.toLowerCase()
    const title = `Renouvellement en retard: ${vehicleName}`
    const message = `Le ${typeName} pour ${vehicleName} est en retard de ${daysOverdue} jour(s) (dû le ${dueDate.toLocaleDateString()}).`
    
    return await this.createNotification({
      userId,
      title,
      message,
      type: 'REMINDER_OVERDUE',
      link: '/reminders/vehicle-renewals'
    })
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId // Sécurisé par utilisateur
        },
        data: {
          read: true
        }
      })
      
      console.log(`[NotificationService] Notification marquée comme lue: ${notificationId}`)
      return notification
    } catch (error) {
      console.error('[NotificationService] Erreur lors du marquage:', error)
      throw error
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false
        },
        data: {
          read: true
        }
      })
      
      console.log(`[NotificationService] ${result.count} notifications marquées comme lues pour ${userId}`)
      return result.count
    } catch (error) {
      console.error('[NotificationService] Erreur lors du marquage global:', error)
      throw error
    }
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false
        }
      })
      
      return count
    } catch (error) {
      console.error('[NotificationService] Erreur lors du comptage:', error)
      return 0
    }
  }

  /**
   * Nettoyer les anciennes notifications (plus de 30 jours)
   */
  static async cleanupOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      
      const result = await prisma.notification.deleteMany({
        where: {
          read: true,
          createdAt: {
            lt: cutoffDate
          }
        }
      })
      
      console.log(`[NotificationService] ${result.count} anciennes notifications supprimées`)
      return result.count
    } catch (error) {
      console.error('[NotificationService] Erreur lors du nettoyage:', error)
      throw error
    }
  }

  /**
   * Vérifier et créer des notifications pour les rappels en retard
   */
  static async checkOverdueReminders() {
    try {
      const now = new Date()
      const overdueReminders = await prisma.serviceReminder.findMany({
        where: {
          status: { in: ['ACTIVE', 'OVERDUE'] },
          nextDue: { not: null, lt: now }
        },
        include: {
          vehicle: {
            select: { userId: true, name: true }
          }
        }
      })

      let notificationsCreated = 0

      for (const reminder of overdueReminders) {
        if (!reminder.nextDue || !reminder.task) continue // Skip si données manquantes
        
        const daysOverdue = Math.ceil((now.getTime() - reminder.nextDue.getTime()) / (1000 * 60 * 60 * 24))
        
        // Éviter les notifications multiples pour le même retard
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: reminder.vehicle.userId,
            type: 'REMINDER_OVERDUE',
            message: {
              contains: reminder.task
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Dans les dernières 24h
            }
          }
        })

        if (!existingNotification && reminder.vehicle.userId) {
          await this.sendReminderOverdueNotification(
            reminder.vehicle.userId,
            reminder.vehicle.name,
            reminder.task,
            reminder.nextDue,
            daysOverdue
          )
          notificationsCreated++
        }
      }

      console.log(`[NotificationService] ${notificationsCreated} notifications de retard créées`)
      return notificationsCreated
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la vérification des retards:', error)
      throw error
    }
  }

  /**
   * Vérifier et créer des notifications pour les renouvellements en retard
   */
  static async checkOverdueRenewals() {
    try {
      const now = new Date()
      const overdueRenewals = await prisma.vehicleRenewal.findMany({
        where: {
          status: { in: ['DUE', 'OVERDUE'] },
          dueDate: { lt: now }
        },
        include: {
          vehicle: {
            select: { userId: true, name: true }
          }
        }
      })

      let notificationsCreated = 0

      for (const renewal of overdueRenewals) {
        const daysOverdue = Math.ceil((now.getTime() - renewal.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Éviter les notifications multiples pour le même retard
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: renewal.vehicle.userId,
            type: 'REMINDER_OVERDUE',
            message: {
              contains: renewal.type
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Dans les dernières 24h
            }
          }
        })

        if (!existingNotification && renewal.vehicle.userId) {
          await this.sendRenewalOverdueNotification(
            renewal.vehicle.userId,
            renewal.vehicle.name,
            renewal.type,
            renewal.dueDate,
            daysOverdue
          )
          notificationsCreated++
        }
      }

      console.log(`[NotificationService] ${notificationsCreated} notifications de renouvellement en retard créées`)
      return notificationsCreated
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la vérification des renouvellements en retard:', error)
      throw error
    }
  }
}