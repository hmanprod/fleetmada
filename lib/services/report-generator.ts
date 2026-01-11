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
        totalMeters,
        averageDailyUsage: totalDays > 0 ? (totalMeters / totalDays).toFixed(2) : '0'
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
      include: {
        vehicle: {
          select: { name: true, make: true, model: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    return meterEntries.map(entry => ({
      date: entry.date,
      vehicleName: entry.vehicle.name,
      value: entry.value,
      type: entry.type,
      unit: entry.unit || '',
      source: entry.source || ''
    }))
  }

  private static async getVehicleListData(userId: string, config: ReportConfig) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    })

    return vehicles.map(vehicle => ({
      vehicleName: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      status: vehicle.status,
      vin: vehicle.vin,
      meterReading: vehicle.meterReading || 0
    }))
  }

  private static async getVehicleProfitabilityData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées pour l'exemple
    return [
      {
        vehicleName: 'Véhicule A',
        totalRevenue: 50000,
        totalCosts: 30000,
        profit: 20000,
        profitMargin: 40
      },
      {
        vehicleName: 'Véhicule B',
        totalRevenue: 75000,
        totalCosts: 55000,
        profit: 20000,
        profitMargin: 26.67
      }
    ]
  }

  private static async getVehicleSummaryData(userId: string, config: ReportConfig) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId }
    })

    const totalVehicles = vehicles.length
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length
    const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE').length

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      inactiveVehicles: totalVehicles - activeVehicles - maintenanceVehicles
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
      include: {
        vehicle: true
      }
    })

    return fuelEntries.map(entry => ({
      vehicleName: entry.vehicle.name,
      date: entry.date,
      mpg: entry.mpg || 0,
      cost: entry.cost,
      volume: entry.volume
    }))
  }

  private static async getReplacementAnalysisData(userId: string, config: ReportConfig) {
    // Analyse simulée pour l'exemple
    return [
      {
        vehicleName: 'Véhicule Ancien',
        currentValue: 15000,
        replacementCost: 35000,
        yearsRemaining: 2,
        recommendation: 'Remplacer dans 6 mois'
      }
    ]
  }

  private static async getCostsVsBudgetData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées pour l'exemple
    return [
      {
        category: 'Carburant',
        actualCost: 25000,
        budgetedCost: 30000,
        variance: -5000,
        variancePercent: -16.67
      },
      {
        category: 'Maintenance',
        actualCost: 15000,
        budgetedCost: 12000,
        variance: 3000,
        variancePercent: 25
      }
    ]
  }

  // Méthodes pour les templates de service
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
        vehicle: true
      }
    })

    return serviceEntries.map(entry => ({
      vehicleName: entry.vehicle.name,
      date: entry.date,
      type: entry.status,
      cost: entry.totalCost,
      category: 'Maintenance'
    }))
  }

  private static async getServiceEntriesSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const summary = await prisma.serviceEntry.aggregate({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      _sum: { totalCost: true }
    })

    return {
      totalEntries: summary._count.id || 0,
      totalCost: summary._sum.totalCost || 0
    }
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
        vehicle: true
      },
      orderBy: { date: 'desc' }
    })

    return serviceEntries.map(entry => ({
      vehicleName: entry.vehicle.name,
      date: entry.date,
      status: entry.status,
      cost: entry.totalCost,
      vendor: entry.vendorName || 'N/A'
    }))
  }

  private static async getServiceComplianceData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées
    return [
      {
        vehicleName: 'Véhicule A',
        complianceRate: 95,
        overdueServices: 1,
        upcomingServices: 3
      }
    ]
  }

  private static async getServiceCostSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const costs = await prisma.serviceEntry.groupBy({
      by: ['status'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      _sum: { totalCost: true },
      _count: { id: true }
    })

    return costs.map(cost => ({
      status: cost.status,
      totalCost: cost._sum.totalCost || 0,
      count: cost._count.id
    }))
  }

  private static async getServiceProviderData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const providers = await prisma.serviceEntry.groupBy({
      by: ['vendorName'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      _sum: { totalCost: true },
      _count: { id: true }
    })

    return providers.map(provider => ({
      vendorName: provider.vendorName || 'Non spécifié',
      totalCost: provider._sum.totalCost || 0,
      serviceCount: provider._count.id
    }))
  }

  private static async getLaborVsPartsData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées
    return [
      {
        category: 'Main d\'œuvre',
        amount: 15000,
        percentage: 60
      },
      {
        category: 'Pièces',
        amount: 10000,
        percentage: 40
      }
    ]
  }

  private static async getWorkOrderSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const workOrders = await prisma.serviceEntry.count({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        isWorkOrder: true
      }
    })

    return {
      totalWorkOrders: workOrders,
      completedWorkOrders: workOrders // Simplifié pour l'exemple
    }
  }

  // Méthodes pour les templates de carburant
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
        vehicle: true
      },
      orderBy: { date: 'desc' }
    })

    return fuelEntries.map(entry => ({
      vehicleName: entry.vehicle.name,
      date: entry.date,
      volume: entry.volume,
      cost: entry.cost,
      mpg: entry.mpg || 0,
      vendor: entry.vendorName || 'N/A'
    }))
  }

  private static async getFuelSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const summary = await prisma.fuelEntry.aggregate({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      _sum: { volume: true, cost: true },
      _avg: { mpg: true },
      _count: { id: true }
    })

    return {
      totalVolume: summary._sum.volume || 0,
      totalCost: summary._sum.cost || 0,
      averageMpg: summary._avg.mpg || 0,
      totalEntries: summary._count.id || 0
    }
  }

  private static async getFuelByLocationData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const fuelByLocation = await prisma.fuelEntry.groupBy({
      by: ['placeId'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      _sum: { volume: true, cost: true },
      _count: { id: true }
    })

    return fuelByLocation.map(location => ({
      locationId: location.placeId || 'Non spécifié',
      totalVolume: location._sum.volume || 0,
      totalCost: location._sum.cost || 0,
      entryCount: location._count.id
    }))
  }

  // Méthodes pour les templates de problèmes
  private static async getFaultsSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const issues = await prisma.issue.groupBy({
      by: ['status'],
      where: {
        userId,
        reportedDate: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    })

    return issues.map(issue => ({
      status: issue.status,
      count: issue._count.id
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
      include: {
        vehicle: {
          select: { name: true }
        }
      },
      orderBy: { reportedDate: 'desc' }
    })

    return issues.map(issue => ({
      summary: issue.summary,
      status: issue.status,
      priority: issue.priority,
      vehicleName: issue.vehicle?.name || 'N/A',
      reportedDate: issue.reportedDate
    }))
  }

  // Méthodes pour les templates d'inspection
  private static async getInspectionFailuresData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées
    return [
      {
        inspectionType: 'Contrôle technique',
        failureRate: 15,
        totalInspections: 100,
        failures: 15
      }
    ]
  }

  private static async getInspectionSchedulesData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées
    return [
      {
        vehicleName: 'Véhicule A',
        inspectionType: 'Contrôle technique',
        scheduledDate: new Date(),
        status: 'Programmé'
      }
    ]
  }

  private static async getInspectionSubmissionsData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées
    return [
      {
        submissionDate: new Date(),
        inspectionType: 'Contrôle technique',
        result: 'Réussi',
        vehicleName: 'Véhicule A'
      }
    ]
  }

  private static async getInspectionSummaryData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    return {
      totalInspections: 50,
      passedInspections: 45,
      failedInspections: 5,
      successRate: 90
    }
  }

  // Méthodes pour les templates de contacts
  private static async getContactRenewalData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    // Données simulées
    return [
      {
        contactName: 'John Doe',
        renewalType: 'Permis de conduire',
        renewalDate: new Date(),
        daysUntilRenewal: 30
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
      status: contact.status,
      group: contact.groupId || 'N/A'
    }))
  }

  // Méthodes pour les templates de pièces
  private static async getPartsByVehicleData(
    startDate: Date,
    endDate: Date,
    userId: string,
    config: ReportConfig
  ) {
    const parts = await prisma.serviceEntryPart.findMany({
      where: {
        serviceEntry: {
          userId,
          date: { gte: startDate, lte: endDate }
        }
      },
      include: {
        part: true,
        serviceEntry: {
          include: {
            vehicle: true
          }
        }
      }
    })

    return parts.map(part => ({
      vehicleName: part.serviceEntry.vehicle.name,
      partNumber: part.part.number,
      partDescription: part.part.description,
      quantity: part.quantity,
      totalCost: part.totalCost
    }))
  }

  // Méthodes pour les rapports personnalisés
  private static async getCustomData(config: any, userId: string) {
    // Pour les rapports personnalisés, combiner plusieurs sources
    const [vehicles, serviceEntries, fuelEntries, issues] = await Promise.all([
      prisma.vehicle.findMany({ where: { userId } }),
      prisma.serviceEntry.findMany({ where: { userId } }),
      prisma.fuelEntry.findMany({ where: { userId } }),
      prisma.issue.findMany({ where: { userId } })
    ])

    return {
      vehicles,
      serviceEntries,
      fuelEntries,
      issues
    }
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
}