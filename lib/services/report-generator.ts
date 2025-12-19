import { prisma } from '@/lib/prisma'
import { ReportConfig, ReportData, ChartData, TableData, ReportTemplate } from '@/types/reports'
import { REPORT_TEMPLATES } from '@/types/reports'

export class ReportGeneratorService {
  private static readonly VALIDATION_ERROR = 'Erreur de validation des données'
  private static readonly GENERATION_ERROR = 'Erreur lors de la génération du rapport'
  private static readonly DATA_NOT_FOUND = 'Données non trouvées pour le rapport'

  // Génération d'un rapport basé sur un template
  static async generateReport(
    template: string,
    config: ReportConfig,
    userId: string
  ): Promise<ReportData> {
    try {
      // Validation des paramètres
      this.validateReportConfig(config, userId)

      // Recherche du template
      const templateConfig = REPORT_TEMPLATES.find(t => t.template === template)
      if (!templateConfig) {
        throw new Error(`Template '${template}' non trouvé`)
      }

      // Récupération des données selon le template
      const data = await this.getDataForTemplate(template, config, userId)
      
      // Transformation des données pour les charts et tables
      const charts = this.generateCharts(templateConfig, data)
      const tables = this.generateTables(templateConfig, data)
      const summary = this.generateSummary(templateConfig, data)

      return {
        summary,
        charts,
        tables,
        metadata: {
          generatedAt: new Date().toISOString(),
          totalRecords: this.getTotalRecords(data),
          dateRange: `${config.dateRange.start} - ${config.dateRange.end}`,
          template: template
        }
      }

    } catch (error) {
      console.error(`Erreur génération rapport ${template}:`, error)
      throw new Error(`${this.GENERATION_ERROR}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  // Génération de rapport personnalisé
  static async generateCustomReport(
    config: ReportConfig & { name: string; description: string },
    userId: string
  ): Promise<ReportData> {
    try {
      this.validateReportConfig(config, userId)

      // Pour un rapport personnalisé, on combine plusieurs sources de données
      const data = await this.getCustomData(config, userId)
      
      return {
        summary: this.generateCustomSummary(data),
        charts: this.generateCustomCharts(config, data),
        tables: this.generateCustomTables(config, data),
        metadata: {
          generatedAt: new Date().toISOString(),
          totalRecords: this.getTotalRecords(data),
          dateRange: `${config.dateRange.start} - ${config.dateRange.end}`,
          template: 'custom'
        }
      }

    } catch (error) {
      console.error('Erreur génération rapport personnalisé:', error)
      throw new Error(`${this.GENERATION_ERROR}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  // Récupération des données selon le template
  private static async getDataForTemplate(
    template: string,
    config: ReportConfig,
    userId: string
  ): Promise<any> {
    const startDate = new Date(config.dateRange.start)
    const endDate = new Date(config.dateRange.end)

    switch (template) {
      // VEHICLES TEMPLATES
      case 'vehicle-cost-comparison':
        return this.getVehicleCostComparisonData(startDate, endDate, userId, config)
      
      case 'vehicle-cost-meter-trend':
        return this.getCostMeterTrendData(startDate, endDate, userId, config)
      
      case 'vehicle-expense-summary':
        return this.getExpenseSummaryData(startDate, endDate, userId, config)
      
      case 'vehicle-expenses-vehicle':
        return this.getVehicleExpensesData(startDate, endDate, userId, config)
      
      case 'vehicle-group-changes':
        return this.getGroupChangesData(startDate, endDate, userId, config)
      
      case 'vehicle-status-changes':
        return this.getStatusChangesData(startDate, endDate, userId, config)
      
      case 'vehicle-utilization-summary':
        return this.getUtilizationData(startDate, endDate, userId, config)
      
      case 'vehicle-meter-history':
        return this.getMeterHistoryData(startDate, endDate, userId, config)
      
      case 'vehicle-list':
        return this.getVehicleListData(userId, config)
      
      case 'vehicle-profitability':
        return this.getVehicleProfitabilityData(startDate, endDate, userId, config)
      
      case 'vehicle-summary':
        return this.getVehicleSummaryData(userId, config)
      
      case 'vehicle-fuel-economy':
        return this.getFuelEconomyData(startDate, endDate, userId, config)
      
      case 'vehicle-replacement-analysis':
        return this.getReplacementAnalysisData(userId, config)
      
      case 'vehicle-costs-vs-budget':
        return this.getCostsVsBudgetData(startDate, endDate, userId, config)

      // SERVICE TEMPLATES
      case 'service-maintenance-categorization':
        return this.getMaintenanceCategorizationData(startDate, endDate, userId, config)
      
      case 'service-entries-summary':
        return this.getServiceEntriesSummaryData(startDate, endDate, userId, config)
      
      case 'service-history-by-vehicle':
        return this.getServiceHistoryData(startDate, endDate, userId, config)
      
      case 'service-reminder-compliance':
        return this.getServiceComplianceData(startDate, endDate, userId, config)
      
      case 'service-cost-summary':
        return this.getServiceCostSummaryData(startDate, endDate, userId, config)
      
      case 'service-provider-performance':
        return this.getServiceProviderData(startDate, endDate, userId, config)
      
      case 'service-labor-vs-parts':
        return this.getLaborVsPartsData(startDate, endDate, userId, config)
      
      case 'service-work-order-summary':
        return this.getWorkOrderSummaryData(startDate, endDate, userId, config)

      // FUEL TEMPLATES
      case 'fuel-entries-by-vehicle':
        return this.getFuelEntriesData(startDate, endDate, userId, config)
      
      case 'fuel-summary':
        return this.getFuelSummaryData(startDate, endDate, userId, config)
      
      case 'fuel-summary-by-location':
        return this.getFuelByLocationData(startDate, endDate, userId, config)

      // ISSUES TEMPLATES
      case 'issues-faults-summary':
        return this.getFaultsSummaryData(startDate, endDate, userId, config)
      
      case 'issues-list':
        return this.getIssuesListData(startDate, endDate, userId, config)

      // INSPECTIONS TEMPLATES
      case 'inspection-failures':
        return this.getInspectionFailuresData(startDate, endDate, userId, config)
      
      case 'inspection-schedules':
        return this.getInspectionSchedulesData(startDate, endDate, userId, config)
      
      case 'inspection-submissions':
        return this.getInspectionSubmissionsData(startDate, endDate, userId, config)
      
      case 'inspection-summary':
        return this.getInspectionSummaryData(startDate, endDate, userId, config)

      // CONTACTS TEMPLATES
      case 'contact-renewal-reminders':
        return this.getContactRenewalData(startDate, endDate, userId, config)
      
      case 'contacts-list':
        return this.getContactsListData(userId, config)

      // PARTS TEMPLATES
      case 'parts-by-vehicle':
        return this.getPartsByVehicleData(startDate, endDate, userId, config)

      default:
        throw new Error(`Template '${template}' non implémenté`)
    }
  }

  // Méthodes utilitaires
  private static validateReportConfig(config: ReportConfig, userId: string) {
    if (!config.dateRange?.start || !config.dateRange?.end) {
      throw new Error(`${this.VALIDATION_ERROR}: Période de dates requise`)
    }
    if (!userId) {
      throw new Error(`${this.VALIDATION_ERROR}: ID utilisateur requis`)
    }
  }

  private static generateCharts(templateConfig: ReportTemplate, data: any): ChartData[] {
    if (!templateConfig.charts || !data) return []
    
    return templateConfig.charts.map(chart => ({
      id: chart.id,
      type: chart.type,
      title: chart.title,
      data: data,
      config: chart
    }))
  }

  private static generateTables(templateConfig: ReportTemplate, data: any): TableData[] {
    if (!templateConfig.tables || !data) return []
    
    return templateConfig.tables.map(table => ({
      id: table.id,
      title: table.title,
      headers: table.columns.map(col => col.title),
      rows: data.map((row: any) => table.columns.map(col => row[col.key])),
      totals: this.calculateTotals(data, table.columns)
    }))
  }

  private static generateSummary(templateConfig: ReportTemplate, data: any): Record<string, any> {
    const summary: Record<string, any> = {}
    
    if (Array.isArray(data)) {
      summary.totalRecords = data.length
      if (data.length > 0) {
        const numericFields = Object.keys(data[0]).filter(key => 
          typeof data[0][key] === 'number'
        )
        numericFields.forEach(field => {
          summary[`total${field.charAt(0).toUpperCase() + field.slice(1)}`] = 
            data.reduce((sum, item) => sum + (item[field] || 0), 0)
        })
      }
    }
    
    return summary
  }

  private static calculateTotals(data: any[], columns: any[]): Record<string, number> {
    const totals: Record<string, number> = {}
    
    columns.forEach(column => {
      if (column.type === 'number' || column.type === 'currency') {
        totals[column.key] = data.reduce((sum, item) => sum + (item[column.key] || 0), 0)
      }
    })
    
    return totals
  }

  private static getTotalRecords(data: any): number {
    return Array.isArray(data) ? data.length : 1
  }

  // Implémentation des récupérations de données pour chaque template
  private static async getVehicleCostComparisonData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        fuelEntries: {
          where: { date: { gte: startDate, lte: endDate } },
          include: { vendor: true }
        },
        serviceEntries: {
          where: { date: { gte: startDate, lte: endDate } },
          include: { vendor: true, parts: { include: { part: true } } }
        },
        expenses: {
          where: { date: { gte: startDate, lte: endDate } },
          include: { vendor: true }
        },
        chargingEntries: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        meterEntries: {
          where: { date: { gte: startDate, lte: endDate } },
          orderBy: { date: 'desc' }
        }
      }
    })

    return vehicles.map(vehicle => {
      const totalCost = [
        vehicle.fuelEntries.reduce((sum, entry) => sum + entry.cost, 0),
        vehicle.serviceEntries.reduce((sum, entry) => sum + entry.totalCost, 0),
        vehicle.expenses.reduce((sum, entry) => sum + entry.amount, 0),
        vehicle.chargingEntries.reduce((sum, entry) => sum + entry.cost, 0)
      ].reduce((sum, cost) => sum + cost, 0)

      const totalMeters = vehicle.meterEntries.length > 0 
        ? vehicle.meterEntries[0].value - (vehicle.inServiceOdometer || 0)
        : 0

      const costPerMeter = totalMeters > 0 ? totalCost / totalMeters : 0

      // Calcul de l'âge du véhicule en service
      const inServiceYear = vehicle.inServiceDate ? new Date(vehicle.inServiceDate).getFullYear() : 0
      const currentYear = new Date().getFullYear()
      const yearInService = currentYear - inServiceYear

      return {
        vehicleName: vehicle.name,
        vehicleId: vehicle.id,
        yearInService,
        totalCost,
        totalMeters,
        costPerMeter,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type
      }
    })
  }

  private static async getCostMeterTrendData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const fuelEntries = await prisma.fuelEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        vendor: true 
      },
      orderBy: { date: 'asc' }
    })

    return fuelEntries.map(entry => ({
      date: entry.date,
      vehicleName: entry.vehicle.name,
      costPerMeter: entry.cost / (entry.usage || 1),
      totalCost: entry.cost,
      metersDriven: entry.usage || 0,
      mpg: entry.mpg || 0
    }))
  }

  private static async getExpenseSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const expenses = await prisma.expenseEntry.findMany({
      where: { 
        vehicle: { userId },
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        vendor: true 
      }
    })

    // Regroupement par type d'expense
    const expenseGroups = expenses.reduce((groups: any, expense) => {
      const type = expense.type
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(expense)
      return groups
    }, {})

    return Object.entries(expenseGroups).map(([type, expenses]: [string, any]) => {
      const total = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      return {
        expenseType: type,
        totalAmount: total,
        count: expenses.length,
        averageAmount: total / expenses.length
      }
    })
  }

  private static async getVehicleExpensesData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const expenses = await prisma.expenseEntry.findMany({
      where: { 
        vehicle: { userId },
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        vendor: true 
      },
      orderBy: { date: 'desc' }
    })

    return expenses.map(expense => ({
      vehicleName: expense.vehicle.name,
      date: expense.date,
      type: expense.type,
      vendor: expense.vendor?.name || expense.vendorName || 'N/A',
      amount: expense.amount,
      notes: expense.notes
    }))
  }

  private static async getGroupChangesData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Pour cet exemple, nous retournons des données simulées
    // Dans une implémentation réelle, il faudrait une table d'historique des changements
    return [
      {
        vehicleName: 'Véhicule Exemple 1',
        changeDate: new Date(),
        oldGroup: 'Groupe A',
        newGroup: 'Groupe B',
        reason: 'Reorganisation'
      }
    ]
  }

  private static async getStatusChangesData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Pour cet exemple, nous retournons des données simulées
    return [
      {
        vehicleName: 'Véhicule Exemple 1',
        changeDate: new Date(),
        oldStatus: 'ACTIVE',
        newStatus: 'MAINTENANCE',
        reason: 'Maintenance préventive'
      }
    ]
  }

  private static async getUtilizationData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        meterEntries: {
          where: { date: { gte: startDate, lte: endDate } },
          orderBy: { date: 'asc' }
        }
      }
    })

    return vehicles.map(vehicle => {
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const activeDays = vehicle.meterEntries.filter(entry => !entry.void).length
      const utilizationRate = totalDays > 0 ? (activeDays / totalDays * 100).toFixed(1) + '%' : '0%'
      
      const totalMeters = vehicle.meterEntries.length > 0 
        ? vehicle.meterEntries[vehicle.meterEntries.length - 1].value
        : 0

      return {
        vehicleName: vehicle.name,
        totalDays,
        activeDays,
        utilizationRate,
        totalMeters
      }
    })
  }

  private static async getMeterHistoryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const meterEntries = await prisma.meterEntry.findMany({
      where: { 
        vehicle: { userId },
        date: { gte: startDate, lte: endDate }
      },
      include: { vehicle: true },
      orderBy: { date: 'asc' }
    })

    return meterEntries.map((entry, index, array) => {
      const previousValue = index > 0 ? array[index - 1].value : 0
      const metersDriven = entry.value - previousValue

      return {
        vehicleName: entry.vehicle.name,
        date: entry.date,
        meterReading: entry.value,
        metersDriven,
        source: entry.source || 'Manual'
      }
    })
  }

  private static async getVehicleListData(userId: string, config: ReportConfig) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    })

    return vehicles.map(vehicle => ({
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      type: vehicle.type,
      status: vehicle.status,
      meterReading: vehicle.meterReading || 0
    }))
  }

  private static async getVehicleProfitabilityData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        fuelEntries: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        serviceEntries: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        expenses: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        chargingEntries: {
          where: { date: { gte: startDate, lte: endDate } }
        }
      }
    })

    return vehicles.map(vehicle => {
      const totalCosts = [
        vehicle.fuelEntries.reduce((sum, entry) => sum + entry.cost, 0),
        vehicle.serviceEntries.reduce((sum, entry) => sum + entry.totalCost, 0),
        vehicle.expenses.reduce((sum, entry) => sum + entry.amount, 0),
        vehicle.chargingEntries.reduce((sum, entry) => sum + entry.cost, 0)
      ].reduce((sum, cost) => sum + cost, 0)

      const revenue = 0 // À implémenter selon le modèle business
      const profitability = revenue - totalCosts
      const roi = vehicle.purchasePrice ? (profitability / vehicle.purchasePrice * 100).toFixed(2) : '0'

      return {
        vehicleName: vehicle.name,
        purchasePrice: vehicle.purchasePrice || 0,
        totalRevenue: revenue,
        totalCosts,
        profitability,
        roi: roi + '%'
      }
    })
  }

  private static async getVehicleSummaryData(userId: string, config: ReportConfig) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId }
    })

    const statusCounts = vehicles.reduce((counts: any, vehicle) => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1
      return counts
    }, {})

    const averageAge = vehicles.length > 0 
      ? vehicles.reduce((sum, v) => sum + (new Date().getFullYear() - v.year), 0) / vehicles.length
      : 0

    const totalValue = vehicles.reduce((sum, v) => sum + (v.purchasePrice || 0), 0)

    return {
      totalVehicles: vehicles.length,
      activeVehicles: statusCounts.ACTIVE || 0,
      maintenanceVehicles: statusCounts.MAINTENANCE || 0,
      inactiveVehicles: (statusCounts.INACTIVE || 0) + (statusCounts.DISPOSED || 0),
      averageAge: Math.round(averageAge),
      totalValue
    }
  }

  private static async getFuelEconomyData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const fuelEntries = await prisma.fuelEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate },
        mpg: { not: null }
      },
      include: { vehicle: true },
      orderBy: { date: 'asc' }
    })

    const vehicleData = fuelEntries.reduce((groups: any, entry) => {
      const vehicleName = entry.vehicle.name
      if (!groups[vehicleName]) {
        groups[vehicleName] = []
      }
      groups[vehicleName].push(entry)
      return groups
    }, {})

    return Object.entries(vehicleData).map(([vehicleName, entries]: [string, any]) => {
      const totalFuel = entries.reduce((sum: number, entry: any) => sum + entry.volume, 0)
      const totalDistance = entries.reduce((sum: number, entry: any) => sum + (entry.usage || 0), 0)
      const averageMPG = entries.reduce((sum: number, entry: any) => sum + (entry.mpg || 0), 0) / entries.length

      return {
        vehicleName,
        averageMPG: Math.round(averageMPG * 10) / 10,
        totalFuelConsumed: Math.round(totalFuel * 100) / 100,
        totalDistance: Math.round(totalDistance),
        fuelEfficiencyRating: averageMPG > 25 ? 'Excellent' : averageMPG > 20 ? 'Bon' : 'À améliorer'
      }
    })
  }

  private static async getReplacementAnalysisData(userId: string, config: ReportConfig) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId }
    })

    return vehicles.map(vehicle => {
      const currentAge = new Date().getFullYear() - vehicle.year
      const expectedLife = vehicle.estimatedServiceLifeMonths ? vehicle.estimatedServiceLifeMonths / 12 : 10
      const replacementYear = new Date().getFullYear() + Math.max(0, Math.ceil(expectedLife - currentAge))
      const estimatedCost = vehicle.purchasePrice || 25000

      return {
        vehicleName: vehicle.name,
        currentAge,
        expectedLife,
        replacementYear,
        estimatedCost,
        priority: currentAge > expectedLife ? 'Urgente' : currentAge > expectedLife - 2 ? 'Haute' : 'Normale'
      }
    })
  }

  private static async getCostsVsBudgetData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        fuelEntries: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        serviceEntries: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        expenses: {
          where: { date: { gte: startDate, lte: endDate } }
        }
      }
    })

    return vehicles.map(vehicle => {
      const actualAmount = [
        vehicle.fuelEntries.reduce((sum, entry) => sum + entry.cost, 0),
        vehicle.serviceEntries.reduce((sum, entry) => sum + entry.totalCost, 0),
        vehicle.expenses.reduce((sum, entry) => sum + entry.amount, 0)
      ].reduce((sum, cost) => sum + cost, 0)

      const budgetedAmount = (vehicle.purchasePrice || 25000) * 0.1 // 10% du prix d'achat comme budget annuel
      const variance = actualAmount - budgetedAmount
      const variancePercent = budgetedAmount > 0 ? ((variance / budgetedAmount) * 100).toFixed(1) : '0'

      return {
        vehicleName: vehicle.name,
        budgetedAmount,
        actualAmount,
        variance,
        variancePercent: variancePercent + '%',
        status: variance > 0 ? 'Dépassement' : 'Sous-budget'
      }
    })
  }

  // Méthodes pour les templates SERVICE
  private static async getMaintenanceCategorizationData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: {
        tasks: {
          include: { serviceTask: true }
        },
        parts: {
          include: { part: true }
        }
      }
    })

    // Regroupement par catégorie de tâche
    const categories = serviceEntries.reduce((groups: any, entry) => {
      entry.tasks.forEach(taskEntry => {
        const category = taskEntry.serviceTask?.categoryCode || 'Non catégorisé'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push({
          ...entry,
          taskCost: taskEntry.cost || 0
        })
      })
      return groups
    }, {})

    return Object.entries(categories).map(([category, entries]: [string, any]) => {
      const totalCost = entries.reduce((sum: number, entry: any) => sum + entry.taskCost, 0)
      return {
        category,
        totalCost,
        count: entries.length,
        averageCost: totalCost / entries.length,
        percentage: '0%' // À calculer
      }
    })
  }

  private static async getServiceEntriesSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        vendor: true 
      },
      orderBy: { date: 'desc' }
    })

    return serviceEntries.map(entry => ({
      vehicleName: entry.vehicle.name,
      serviceDate: entry.date,
      serviceType: entry.isWorkOrder ? 'Work Order' : 'Service',
      vendor: entry.vendor?.name || entry.vendorName || 'N/A',
      totalCost: entry.totalCost,
      status: entry.status
    }))
  }

  private static async getServiceHistoryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        vendor: true,
        tasks: {
          include: { serviceTask: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return serviceEntries.flatMap(entry => 
      entry.tasks.map(taskEntry => ({
        vehicleName: entry.vehicle.name,
        serviceDate: entry.date,
        task: taskEntry.serviceTask?.name || 'Tâche inconnue',
        cost: taskEntry.cost || 0,
        vendor: entry.vendor?.name || entry.vendorName || 'N/A',
        status: entry.status
      }))
    )
  }

  private static async getServiceComplianceData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const reminders = await prisma.serviceReminder.findMany({
      where: { 
        vehicle: { userId }
      },
      include: { 
        vehicle: true,
        serviceTask: true 
      }
    })

    return reminders.map(reminder => {
      const dueDate = reminder.nextDue
      const completionDate = reminder.lastServiceDate
      const isOnTime = completionDate && dueDate ? completionDate <= dueDate : false
      
      return {
        vehicleName: reminder.vehicle.name,
        task: reminder.serviceTask?.name || reminder.task || 'Tâche personnalisée',
        dueDate,
        completionDate,
        status: isOnTime ? 'À temps' : 'En retard',
        daysLate: completionDate && dueDate ? 
          Math.ceil((completionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      }
    })
  }

  private static async getServiceCostSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        parts: { include: { part: true } }
      }
    })

    // Regroupement par mois
    const monthlyData = serviceEntries.reduce((groups: any, entry) => {
      const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`
      if (!groups[monthKey]) {
        groups[monthKey] = {
          period: monthKey,
          laborCost: 0,
          partsCost: 0,
          totalCost: 0,
          serviceCount: 0
        }
      }
      
      const partsCost = entry.parts.reduce((sum, partEntry) => sum + partEntry.totalCost, 0)
      const laborCost = entry.totalCost - partsCost
      
      groups[monthKey].laborCost += laborCost
      groups[monthKey].partsCost += partsCost
      groups[monthKey].totalCost += entry.totalCost
      groups[monthKey].serviceCount += 1
      
      return groups
    }, {})

    return Object.values(monthlyData).map((data: any) => ({
      ...data,
      averageCost: data.serviceCount > 0 ? data.totalCost / data.serviceCount : 0
    }))
  }

  private static async getServiceProviderData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate },
        vendorId: { not: null }
      },
      include: { vendor: true }
    })

    const vendorGroups = serviceEntries.reduce((groups: any, entry) => {
      const vendorName = entry.vendor!.name
      if (!groups[vendorName]) {
        groups[vendorName] = []
      }
      groups[vendorName].push(entry)
      return groups
    }, {})

    return Object.entries(vendorGroups).map(([vendorName, entries]: [string, any]) => {
      const totalCost = entries.reduce((sum: number, entry: any) => sum + entry.totalCost, 0)
      const averageRating = 4.2 // Simulation - à remplacer par vraies données
      
      return {
        vendorName,
        totalServices: entries.length,
        totalCost,
        averageCost: totalCost / entries.length,
        averageRating,
        onTimePercentage: '85%' // Simulation
      }
    })
  }

  private static async getLaborVsPartsData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        parts: { include: { part: true } }
      }
    })

    // Regroupement par mois
    const monthlyData = serviceEntries.reduce((groups: any, entry) => {
      const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`
      if (!groups[monthKey]) {
        groups[monthKey] = {
          period: monthKey,
          laborCost: 0,
          partsCost: 0,
          totalCost: 0
        }
      }
      
      const partsCost = entry.parts.reduce((sum, partEntry) => sum + partEntry.totalCost, 0)
      const laborCost = entry.totalCost - partsCost
      
      groups[monthKey].laborCost += laborCost
      groups[monthKey].partsCost += partsCost
      groups[monthKey].totalCost += entry.totalCost
      
      return groups
    }, {})

    return Object.values(monthlyData).map((data: any) => {
      const laborPercentage = data.totalCost > 0 ? ((data.laborCost / data.totalCost) * 100).toFixed(1) : '0'
      const partsPercentage = data.totalCost > 0 ? ((data.partsCost / data.totalCost) * 100).toFixed(1) : '0'
      
      return {
        ...data,
        laborPercentage: laborPercentage + '%',
        partsPercentage: partsPercentage + '%'
      }
    })
  }

  private static async getWorkOrderSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const workOrders = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        isWorkOrder: true,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        assignedToContact: true 
      },
      orderBy: { date: 'desc' }
    })

    return workOrders.map(wo => ({
      workOrderNumber: `WO-${wo.id.slice(-6).toUpperCase()}`,
      vehicleName: wo.vehicle.name,
      priority: wo.priority || 'MEDIUM',
      status: wo.status,
      assignedTo: wo.assignedToContact ? 
        `${wo.assignedToContact.firstName} ${wo.assignedToContact.lastName}` : 'Non assigné',
      totalCost: wo.totalCost,
      completionDate: wo.status === 'COMPLETED' ? wo.updatedAt : null
    }))
  }

  // Méthodes pour les templates FUEL
  private static async getFuelEntriesData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const fuelEntries = await prisma.fuelEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        vendor: true,
        place: true 
      },
      orderBy: { date: 'desc' }
    })

    return fuelEntries.map(entry => ({
      vehicleName: entry.vehicle.name,
      date: entry.date,
      volume: entry.volume,
      cost: entry.cost,
      vendor: entry.vendor?.name || entry.vendorName || 'N/A',
      mpg: entry.mpg || 0,
      location: entry.place?.name || 'N/A'
    }))
  }

  private static async getFuelSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const fuelEntries = await prisma.fuelEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { vehicle: true }
    })

    const vehicleGroups = fuelEntries.reduce((groups: any, entry) => {
      const vehicleName = entry.vehicle.name
      if (!groups[vehicleName]) {
        groups[vehicleName] = []
      }
      groups[vehicleName].push(entry)
      return groups
    }, {})

    return Object.entries(vehicleGroups).map(([vehicleName, entries]: [string, any]) => {
      const totalVolume = entries.reduce((sum: number, entry: any) => sum + entry.volume, 0)
      const totalCost = entries.reduce((sum: number, entry: any) => sum + entry.cost, 0)
      const averageMPG = entries.reduce((sum: number, entry: any) => sum + (entry.mpg || 0), 0) / entries.length
      const averagePrice = totalVolume > 0 ? totalCost / totalVolume : 0

      return {
        vehicleName,
        totalVolume: Math.round(totalVolume * 100) / 100,
        totalCost,
        averageMPG: Math.round(averageMPG * 10) / 10,
        averagePrice: Math.round(averagePrice * 100) / 100,
        entryCount: entries.length
      }
    })
  }

  private static async getFuelByLocationData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const fuelEntries = await prisma.fuelEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate },
        placeId: { not: null }
      },
      include: { place: true }
    })

    const locationGroups = fuelEntries.reduce((groups: any, entry) => {
      const location = entry.place!.name
      if (!groups[location]) {
        groups[location] = []
      }
      groups[location].push(entry)
      return groups
    }, {})

    const totalVolume = fuelEntries.reduce((sum: number, entry: any) => sum + entry.volume, 0)

    return Object.entries(locationGroups).map(([location, entries]: [string, any]) => {
      const totalCost = entries.reduce((sum: number, entry: any) => sum + entry.cost, 0)
      const volume = entries.reduce((sum: number, entry: any) => sum + entry.volume, 0)
      const marketShare = totalVolume > 0 ? ((volume / totalVolume) * 100).toFixed(1) : '0'

      return {
        location,
        totalVolume: Math.round(volume * 100) / 100,
        totalCost,
        averagePrice: volume > 0 ? totalCost / volume : 0,
        entryCount: entries.length,
        marketShare: marketShare + '%'
      }
    })
  }

  // Méthodes pour les templates ISSUES
  private static async getFaultsSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const issues = await prisma.issue.findMany({
      where: { 
        userId,
        reportedDate: { gte: startDate, lte: endDate },
        labels: { has: 'fault' }
      },
      include: { vehicle: true }
    })

    // Simulation de codes de faute pour l'exemple
    const faultCodes = ['P0100', 'P0300', 'U0100', 'B0100', 'C0100']

    return issues.map(issue => ({
      faultCode: faultCodes[Math.floor(Math.random() * faultCodes.length)],
      description: issue.summary,
      vehicleName: issue.vehicle?.name || 'N/A',
      count: 1,
      severity: issue.priority.toLowerCase(),
      lastOccurrence: issue.reportedDate
    }))
  }

  private static async getIssuesListData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const issues = await prisma.issue.findMany({
      where: { 
        userId,
        reportedDate: { gte: startDate, lte: endDate }
      },
      include: { vehicle: true }
    })

    return issues.map(issue => ({
      vehicleName: issue.vehicle?.name || 'N/A',
      issueTitle: issue.summary,
      status: issue.status,
      priority: issue.priority,
      assignedTo: issue.assignedTo || 'Non assigné',
      reportedDate: issue.reportedDate
    }))
  }

  // Méthodes pour les templates INSPECTIONS
  private static async getInspectionFailuresData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const inspections = await prisma.inspection.findMany({
      where: { 
        userId,
        completedAt: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        items: {
          where: { status: 'FAILED' }
        }
      }
    })

    return inspections.flatMap(inspection =>
      inspection.items.map(item => ({
        vehicleName: inspection.vehicle.name,
        inspectionDate: inspection.completedAt || inspection.startedAt || inspection.createdAt,
        itemName: item.name,
        failureReason: item.notes || 'Non spécifié',
        inspector: inspection.inspectorName || 'N/A',
        location: inspection.location || 'N/A'
      }))
    )
  }

  private static async getInspectionSchedulesData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const inspections = await prisma.inspection.findMany({
      where: { 
        userId,
        scheduledDate: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        inspectionTemplate: true 
      }
    })

    return inspections.map(inspection => ({
      vehicleName: inspection.vehicle.name,
      templateName: inspection.inspectionTemplate.name,
      scheduledDate: inspection.scheduledDate,
      status: inspection.status,
      inspector: inspection.inspectorName || 'N/A',
      location: inspection.location || 'N/A'
    }))
  }

  private static async getInspectionSubmissionsData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const inspections = await prisma.inspection.findMany({
      where: { 
        userId,
        completedAt: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        inspectionTemplate: true 
      }
    })

    return inspections.map(inspection => ({
      vehicleName: inspection.vehicle.name,
      inspectionDate: inspection.completedAt || inspection.createdAt,
      templateName: inspection.inspectionTemplate.name,
      inspector: inspection.inspectorName || 'N/A',
      complianceStatus: inspection.complianceStatus,
      overallScore: inspection.overallScore || 0
    }))
  }

  private static async getInspectionSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const inspections = await prisma.inspection.findMany({
      where: { 
        userId,
        completedAt: { gte: startDate, lte: endDate }
      }
    })

    const totalInspections = inspections.length
    const passedInspections = inspections.filter(i => i.complianceStatus === 'COMPLIANT').length
    const failedInspections = totalInspections - passedInspections
    const complianceRate = totalInspections > 0 ? ((passedInspections / totalInspections) * 100).toFixed(1) : '0'
    const averageScore = totalInspections > 0 ? 
      inspections.reduce((sum, i) => sum + (i.overallScore || 0), 0) / totalInspections : 0

    return {
      totalInspections,
      passedInspections,
      failedInspections,
      complianceRate: complianceRate + '%',
      averageScore: Math.round(averageScore * 10) / 10
    }
  }

  // Méthodes pour les templates CONTACTS
  private static async getContactRenewalData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Simulation pour les rappels de renouvellement de contacts
    return [
      {
        contactName: 'John Doe',
        renewalType: 'Contract',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Due soon',
        daysRemaining: 30,
        priority: 'High'
      }
    ]
  }

  private static async getContactsListData(userId: string, config: ReportConfig) {
    const contacts = await prisma.contact.findMany({
      orderBy: { firstName: 'asc' }
    })

    return contacts.map(contact => ({
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      phone: contact.phone || 'N/A',
      company: contact.company || 'N/A',
      jobTitle: contact.jobTitle || 'N/A',
      status: contact.status,
      classification: contact.classifications.join(', ') || 'N/A'
    }))
  }

  // Méthodes pour les templates PARTS
  private static async getPartsByVehicleData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const serviceEntries = await prisma.serviceEntry.findMany({
      where: { 
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { 
        vehicle: true,
        parts: {
          include: { part: true }
        }
      }
    })

    return serviceEntries.flatMap(entry =>
      entry.parts.map(partEntry => ({
        vehicleName: entry.vehicle.name,
        partNumber: partEntry.part.number,
        description: partEntry.part.description,
        quantity: partEntry.quantity,
        unitCost: partEntry.unitCost,
        totalCost: partEntry.totalCost,
        serviceDate: entry.date
      }))
    )
  }

  // Méthodes pour les rapports personnalisés
  private static async getCustomData(config: any, userId: string): Promise<any> {
    const startDate = new Date(config.dateRange.start)
    const endDate = new Date(config.dateRange.end)

    // Combiner plusieurs sources de données selon les filtres
    const [vehicles, serviceEntries, fuelEntries, issues] = await Promise.all([
      prisma.vehicle.findMany({
        where: { userId, ...(config.vehicleIds && { id: { in: config.vehicleIds } }) }
      }),
      prisma.serviceEntry.findMany({
        where: { 
          userId,
          date: { gte: startDate, lte: endDate },
          ...(config.vehicleIds && { vehicleId: { in: config.vehicleIds } })
        }
      }),
      prisma.fuelEntry.findMany({
        where: { 
          userId,
          date: { gte: startDate, lte: endDate },
          ...(config.vehicleIds && { vehicleId: { in: config.vehicleIds } })
        }
      }),
      prisma.issue.findMany({
        where: { 
          userId,
          reportedDate: { gte: startDate, lte: endDate },
          ...(config.vehicleIds && { vehicleId: { in: config.vehicleIds } })
        }
      })
    ])

    return {
      vehicles,
      serviceEntries,
      fuelEntries,
      issues
    }
  }

  private static generateCharts(template: ReportTemplate, data: any): ChartData[] {
    return template.charts.map(chartConfig => {
      // Transformation des données selon la configuration du chart
      const transformedData = this.transformDataForChart(chartConfig, data)
      
      return {
        id: chartConfig.id,
        type: chartConfig.type,
        title: chartConfig.title,
        data: transformedData,
        config: chartConfig
      }
    })
  }

  private static generateTables(template: ReportTemplate, data: any): TableData[] {
    return template.tables.map(tableConfig => {
      const transformedData = this.transformDataForTable(tableConfig, data)
      
      return {
        id: tableConfig.id,
        title: tableConfig.title,
        headers: tableConfig.columns.map(col => col.title),
        rows: transformedData,
        totals: this.calculateTableTotals(tableConfig, transformedData)
      }
    })
  }

  private static generateSummary(template: ReportTemplate, data: any): Record<string, any> {
    // Génération d'un résumé basé sur le template et les données
    const summary: Record<string, any> = {}

    switch (template.template) {
      case 'vehicle-summary':
        if (Array.isArray(data)) {
          summary.totalVehicles = data.length
          summary.activeVehicles = data.filter((v: any) => v.status === 'ACTIVE').length
          summary.averageAge = data.length > 0 ? 
            data.reduce((sum: number, v: any) => sum + v.age, 0) / data.length : 0
        }
        break

      case 'fuel-summary':
        if (Array.isArray(data)) {
          summary.totalVolume = data.reduce((sum: number, v: any) => sum + v.totalVolume, 0)
          summary.totalCost = data.reduce((sum: number, v: any) => sum + v.totalCost, 0)
          summary.averageMPG = data.length > 0 ? 
            data.reduce((sum: number, v: any) => sum + v.averageMPG, 0) / data.length : 0
        }
        break

      case 'service-cost-summary':
        if (Array.isArray(data)) {
          summary.totalCost = data.reduce((sum: number, d: any) => sum + d.totalCost, 0)
          summary.totalServices = data.reduce((sum: number, d: any) => sum + d.serviceCount, 0)
          summary.averageCost = data.length > 0 ? 
            data.reduce((sum: number, d: any) => sum + d.averageCost, 0) / data.length : 0
        }
        break

      default:
        summary.totalRecords = this.getTotalRecords(data)
        break
    }

    return summary
  }

  private static generateCustomSummary(data: any): Record<string, any> {
    return {
      vehicles: data.vehicles?.length || 0,
      serviceEntries: data.serviceEntries?.length || 0,
      fuelEntries: data.fuelEntries?.length || 0,
      issues: data.issues?.length || 0,
      generatedAt: new Date().toISOString()
    }
  }

  private static generateCustomCharts(config: any, data: any): ChartData[] {
    // Charts personnalisés selon la configuration
    return []
  }

  private static generateCustomTables(config: any, data: any): TableData[] {
    // Tables personnalisées selon la configuration
    return []
  }

  // Méthodes utilitaires
  private static validateReportConfig(config: ReportConfig, userId: string): void {
    if (!userId) {
      throw new Error('User ID requis')
    }

    if (!config.dateRange?.start || !config.dateRange?.end) {
      throw new Error('Période de dates requise')
    }

    const startDate = new Date(config.dateRange.start)
    const endDate = new Date(config.dateRange.end)

    if (startDate >= endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin')
    }

    if (endDate > new Date()) {
      throw new Error('La date de fin ne peut pas être dans le futur')
    }
  }

  private static transformDataForChart(chartConfig: any, data: any): any[] {
    // Transformation des données pour les graphiques
    if (Array.isArray(data)) {
      return data.map(item => ({
        x: item[chartConfig.xField],
        y: item[chartConfig.yField],
        group: chartConfig.groupField ? item[chartConfig.groupField] : null
      }))
    }
    return []
  }

  private static transformDataForTable(tableConfig: any, data: any): any[][] {
    // Transformation des données pour les tableaux
    if (Array.isArray(data)) {
      return data.map(item => 
        tableConfig.columns.map(col => item[col.key])
      )
    }
    return []
  }

  private static calculateTableTotals(tableConfig: any, data: any[][]): Record<string, number> | undefined {
    // Calcul des totaux pour les colonnes numériques
    const totals: Record<string, number> = {}
    let hasNumeric = false

    tableConfig.columns.forEach((col: any, index: number) => {
      if (col.type === 'number' || col.type === 'currency') {
        hasNumeric = true
        totals[col.key] = data.reduce((sum, row) => sum + (parseFloat(row[index]) || 0), 0)
      }
    })

    return hasNumeric ? totals : undefined
  }

  private static getTotalRecords(data: any): number {
    if (Array.isArray(data)) {
      return data.length
    }
    if (typeof data === 'object' && data !== null) {
      return Object.keys(data).length
    }
    return 0
  }
}