// Types pour le système de rapports FleetMada

export interface ReportConfig {
  dateRange: { start: string; end: string };
  filters: Record<string, any>;
  groupBy?: string;
  sortBy?: string;
  includeCharts?: boolean;
  includeSummary?: boolean;
  period?: '7d' | '30d' | '90d' | '1y' | 'custom';
  categories?: string[];
  vehicleIds?: string[];
  vendorIds?: string[];
}

export interface ReportData {
  summary: Record<string, any>;
  charts: ChartData[];
  tables: TableData[];
  metadata: {
    generatedAt: string;
    totalRecords: number;
    dateRange: string;
    template: string;
  };
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  config?: any;
}

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: any[][];
  totals?: Record<string, number>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string; // Nom du template (ex: "vehicle-cost-summary")
  config: ReportConfig;
  charts: ChartConfig[];
  tables: TableConfig[];
  icon?: string;
  color?: string;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  xField: string;
  yField: string;
  groupField?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
}

export interface TableConfig {
  id: string;
  title: string;
  columns: {
    key: string;
    title: string;
    type: 'string' | 'number' | 'date' | 'currency';
    sortable?: boolean;
    format?: string;
  }[];
  groupBy?: string;
  sortBy?: string;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  label: string;
}

export interface CustomReportConfig extends ReportConfig {
  name: string;
  description: string;
  template: 'custom';
  customCharts: ChartConfig[];
  customTables: TableConfig[];
  customFilters: ReportFilter[];
}

// API Response Types
export interface ReportsListResponse {
  success: boolean;
  data: {
    reports: Report[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      totalPages: number;
    };
  };
}

export interface ReportResponse {
  success: boolean;
  data: Report;
}

export interface GenerateReportResponse {
  success: boolean;
  data: ReportData;
}

export interface ExportReportResponse {
  success: boolean;
  data: {
    fileName: string;
    contentType: string;
    content: string | Buffer; // Base64 encoded file content
  };
}

// Report Database Model
export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'STANDARD' | 'CUSTOM' | 'TEMPLATE' | 'SCHEDULED';
  category: string;
  template: string;
  config: ReportConfig;
  data?: ReportData;
  isPublic: boolean;
  isFavorite: boolean;
  isSaved: boolean;
  ownerId: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  owner?: User;
  company?: Company;
  shares?: ReportShare[];
  schedules?: ReportSchedule[];
}

export interface ReportShare {
  id: string;
  reportId: string;
  sharedWith: string; // User ID ou email
  permission: 'view' | 'edit';
  createdAt: string;
  report?: Report;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  report?: Report;
}

// User et Company (référencés dans les relations)
export interface User {
  id: string;
  name: string;
  email: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Template prédéfinis pour les 22 rapports
export const REPORT_TEMPLATES: ReportTemplate[] = [
  // VEHICLES (13 rapports)
  {
    id: 'cost-comparison',
    name: 'Cost Comparison by Year in Service',
    category: 'Vehicles',
    description: 'Analysis of total vehicle costs per meter (mile/kilometer/hour) based on when in the vehicle\'s life costs occurred.',
    template: 'vehicle-cost-comparison',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'cost-trend',
        type: 'line',
        title: 'Cost per Meter Trend',
        xField: 'year',
        yField: 'costPerMeter',
        aggregation: 'avg'
      }
    ],
    tables: [
      {
        id: 'vehicle-costs',
        title: 'Vehicle Cost Analysis',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'yearInService', title: 'Year in Service', type: 'number' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'costPerMeter', title: 'Cost per Meter', type: 'currency' },
          { key: 'totalMeters', title: 'Total Meters', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'cost-meter-trend',
    name: 'Cost/Meter Trend',
    category: 'Vehicles',
    description: 'Analysis of total vehicle costs per meter (mile/kilometer/hour) over time.',
    template: 'vehicle-cost-meter-trend',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'cost-trend',
        type: 'line',
        title: 'Cost per Meter Over Time',
        xField: 'date',
        yField: 'costPerMeter',
        aggregation: 'avg'
      }
    ],
    tables: [
      {
        id: 'meter-costs',
        title: 'Meter Cost Trends',
        columns: [
          { key: 'date', title: 'Date', type: 'date' },
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'costPerMeter', title: 'Cost per Meter', type: 'currency' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'metersDriven', title: 'Meters Driven', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'expense-summary',
    name: 'Expense Summary',
    category: 'Vehicles',
    description: 'Aggregate expense costs grouped by expense type or vehicle group.',
    template: 'vehicle-expense-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      groupBy: 'type',
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'expense-breakdown',
        type: 'pie',
        title: 'Expense Breakdown by Type',
        xField: 'type',
        yField: 'total',
        aggregation: 'sum'
      }
    ],
    tables: [
      {
        id: 'expense-summary',
        title: 'Expense Summary by Type',
        columns: [
          { key: 'expenseType', title: 'Expense Type', type: 'string' },
          { key: 'totalAmount', title: 'Total Amount', type: 'currency' },
          { key: 'count', title: 'Count', type: 'number' },
          { key: 'averageAmount', title: 'Average Amount', type: 'currency' }
        ]
      }
    ]
  },
  {
    id: 'expenses-vehicle',
    name: 'Expenses by Vehicle',
    category: 'Vehicles',
    description: 'Listing of all expense entries by vehicle.',
    template: 'vehicle-expenses-vehicle',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'vehicle-expenses',
        title: 'Expenses by Vehicle',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'date', title: 'Date', type: 'date' },
          { key: 'type', title: 'Type', type: 'string' },
          { key: 'vendor', title: 'Vendor', type: 'string' },
          { key: 'amount', title: 'Amount', type: 'currency' },
          { key: 'notes', title: 'Notes', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'group-changes',
    name: 'Group Changes',
    category: 'Vehicles',
    description: 'List updates to every vehicle\'s group.',
    template: 'vehicle-group-changes',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: false
    },
    charts: [],
    tables: [
      {
        id: 'group-changes',
        title: 'Vehicle Group Changes',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'changeDate', title: 'Change Date', type: 'date' },
          { key: 'oldGroup', title: 'Old Group', type: 'string' },
          { key: 'newGroup', title: 'New Group', type: 'string' },
          { key: 'reason', title: 'Reason', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'status-changes',
    name: 'Status Changes',
    category: 'Vehicles',
    description: 'List updates to every vehicle\'s status.',
    template: 'vehicle-status-changes',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: false
    },
    charts: [],
    tables: [
      {
        id: 'status-changes',
        title: 'Vehicle Status Changes',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'changeDate', title: 'Change Date', type: 'date' },
          { key: 'oldStatus', title: 'Old Status', type: 'string' },
          { key: 'newStatus', title: 'New Status', type: 'string' },
          { key: 'reason', title: 'Reason', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'utilization-summary',
    name: 'Utilization Summary',
    category: 'Vehicles',
    description: 'Summary of vehicle utilization metrics.',
    template: 'vehicle-utilization-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'utilization-rate',
        type: 'bar',
        title: 'Vehicle Utilization Rate',
        xField: 'vehicleName',
        yField: 'utilizationRate',
        aggregation: 'avg'
      }
    ],
    tables: [
      {
        id: 'utilization-metrics',
        title: 'Vehicle Utilization Metrics',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'totalDays', title: 'Total Days', type: 'number' },
          { key: 'activeDays', title: 'Active Days', type: 'number' },
          { key: 'utilizationRate', title: 'Utilization Rate', type: 'string' },
          { key: 'totalMeters', title: 'Total Meters', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'meter-history',
    name: 'Meter History Summary',
    category: 'Vehicles',
    description: 'Summary of meter reading history for vehicles.',
    template: 'vehicle-meter-history',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'meter-trend',
        type: 'line',
        title: 'Meter Reading Trends',
        xField: 'date',
        yField: 'meterReading',
        aggregation: 'max'
      }
    ],
    tables: [
      {
        id: 'meter-history',
        title: 'Meter Reading History',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'date', title: 'Date', type: 'date' },
          { key: 'meterReading', title: 'Meter Reading', type: 'number' },
          { key: 'metersDriven', title: 'Meters Driven', type: 'number' },
          { key: 'source', title: 'Source', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'vehicle-list',
    name: 'Vehicle List',
    category: 'Vehicles',
    description: 'Complete list of all vehicles with key information.',
    template: 'vehicle-list',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'vehicle-inventory',
        title: 'Vehicle Inventory',
        columns: [
          { key: 'name', title: 'Vehicle Name', type: 'string' },
          { key: 'make', title: 'Make', type: 'string' },
          { key: 'model', title: 'Model', type: 'string' },
          { key: 'year', title: 'Year', type: 'number' },
          { key: 'vin', title: 'VIN', type: 'string' },
          { key: 'type', title: 'Type', type: 'string' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'meterReading', title: 'Current Meter', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'vehicle-profitability',
    name: 'Vehicle Profitability',
    category: 'Vehicles',
    description: 'Analysis of vehicle profitability and ROI.',
    template: 'vehicle-profitability',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'profitability',
        type: 'bar',
        title: 'Vehicle Profitability',
        xField: 'vehicleName',
        yField: 'profitability',
        aggregation: 'sum'
      }
    ],
    tables: [
      {
        id: 'profitability-analysis',
        title: 'Vehicle Profitability Analysis',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'purchasePrice', title: 'Purchase Price', type: 'currency' },
          { key: 'totalRevenue', title: 'Total Revenue', type: 'currency' },
          { key: 'totalCosts', title: 'Total Costs', type: 'currency' },
          { key: 'profitability', title: 'Profitability', type: 'currency' },
          { key: 'roi', title: 'ROI %', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'vehicle-summary',
    name: 'Vehicle Summary',
    category: 'Vehicles',
    description: 'Overall summary of all vehicles in the fleet.',
    template: 'vehicle-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'vehicle-status',
        type: 'pie',
        title: 'Vehicle Status Distribution',
        xField: 'status',
        yField: 'count',
        aggregation: 'count'
      }
    ],
    tables: [
      {
        id: 'vehicle-overview',
        title: 'Vehicle Fleet Overview',
        columns: [
          { key: 'totalVehicles', title: 'Total Vehicles', type: 'number' },
          { key: 'activeVehicles', title: 'Active Vehicles', type: 'number' },
          { key: 'maintenanceVehicles', title: 'In Maintenance', type: 'number' },
          { key: 'inactiveVehicles', title: 'Inactive Vehicles', type: 'number' },
          { key: 'averageAge', title: 'Average Age (Years)', type: 'number' },
          { key: 'totalValue', title: 'Total Fleet Value', type: 'currency' }
        ]
      }
    ]
  },
  {
    id: 'fuel-economy',
    name: 'Fuel Economy Summary',
    category: 'Vehicles',
    description: 'Summary of fuel economy metrics for vehicles.',
    template: 'vehicle-fuel-economy',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'fuel-efficiency',
        type: 'bar',
        title: 'Fuel Efficiency by Vehicle',
        xField: 'vehicleName',
        yField: 'mpg',
        aggregation: 'avg'
      }
    ],
    tables: [
      {
        id: 'fuel-economy',
        title: 'Fuel Economy Analysis',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'averageMPG', title: 'Average MPG', type: 'number' },
          { key: 'totalFuelConsumed', title: 'Total Fuel', type: 'number' },
          { key: 'totalDistance', title: 'Total Distance', type: 'number' },
          { key: 'fuelEfficiencyRating', title: 'Efficiency Rating', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'replacement-analysis',
    name: 'Replacement Analysis',
    category: 'Vehicles',
    description: 'Analysis of vehicle replacement needs and timing.',
    template: 'vehicle-replacement-analysis',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'replacement-timeline',
        type: 'bar',
        title: 'Vehicles Needing Replacement',
        xField: 'replacementYear',
        yField: 'vehicleCount',
        aggregation: 'count'
      }
    ],
    tables: [
      {
        id: 'replacement-needs',
        title: 'Vehicle Replacement Analysis',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'currentAge', title: 'Current Age', type: 'number' },
          { key: 'expectedLife', title: 'Expected Life', type: 'number' },
          { key: 'replacementYear', title: 'Replacement Year', type: 'number' },
          { key: 'estimatedCost', title: 'Estimated Cost', type: 'currency' },
          { key: 'priority', title: 'Priority', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'vehicle-costs-budget',
    name: 'Vehicle Costs vs Budget',
    category: 'Vehicles',
    description: 'Comparison of actual vehicle costs against budget.',
    template: 'vehicle-costs-vs-budget',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'budget-comparison',
        type: 'bar',
        title: 'Actual vs Budget Costs',
        xField: 'vehicleName',
        yField: 'cost',
        groupField: 'type'
      }
    ],
    tables: [
      {
        id: 'budget-analysis',
        title: 'Budget vs Actual Analysis',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'budgetedAmount', title: 'Budget', type: 'currency' },
          { key: 'actualAmount', title: 'Actual', type: 'currency' },
          { key: 'variance', title: 'Variance', type: 'currency' },
          { key: 'variancePercent', title: 'Variance %', type: 'string' },
          { key: 'status', title: 'Status', type: 'string' }
        ]
      }
    ]
  },

  // SERVICE (8 rapports)
  {
    id: 'maintenance-cat',
    name: 'Maintenance Categorization Summary',
    category: 'Service',
    description: 'Aggregate service data grouped by VMRS Category, System, or Reason for Repair Codes.',
    template: 'service-maintenance-categorization',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      groupBy: 'category',
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'maintenance-breakdown',
        type: 'pie',
        title: 'Maintenance by Category',
        xField: 'category',
        yField: 'total',
        aggregation: 'sum'
      }
    ],
    tables: [
      {
        id: 'maintenance-categories',
        title: 'Maintenance Categories',
        columns: [
          { key: 'category', title: 'Category', type: 'string' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'count', title: 'Count', type: 'number' },
          { key: 'averageCost', title: 'Average Cost', type: 'currency' },
          { key: 'percentage', title: 'Percentage', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'service-entries',
    name: 'Service Entries Summary',
    category: 'Service',
    description: 'Listing of summarized service history for vehicles.',
    template: 'service-entries-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'service-summary',
        title: 'Service Entries Summary',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'serviceDate', title: 'Service Date', type: 'date' },
          { key: 'serviceType', title: 'Service Type', type: 'string' },
          { key: 'vendor', title: 'Vendor', type: 'string' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'status', title: 'Status', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'service-history',
    name: 'Service History by Vehicle',
    category: 'Service',
    description: 'Listing of all service by vehicle grouped by entry or task.',
    template: 'service-history-by-vehicle',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: false
    },
    charts: [],
    tables: [
      {
        id: 'vehicle-service-history',
        title: 'Service History by Vehicle',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'serviceDate', title: 'Service Date', type: 'date' },
          { key: 'task', title: 'Task', type: 'string' },
          { key: 'cost', title: 'Cost', type: 'currency' },
          { key: 'vendor', title: 'Vendor', type: 'string' },
          { key: 'status', title: 'Status', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'service-compliance',
    name: 'Service Reminder Compliance',
    category: 'Service',
    description: 'Shows history of completed Service Reminders as On Time/Late.',
    template: 'service-reminder-compliance',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'compliance-rate',
        type: 'bar',
        title: 'Service Compliance Rate',
        xField: 'period',
        yField: 'complianceRate',
        aggregation: 'avg'
      }
    ],
    tables: [
      {
        id: 'compliance-analysis',
        title: 'Service Compliance Analysis',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'task', title: 'Task', type: 'string' },
          { key: 'dueDate', title: 'Due Date', type: 'date' },
          { key: 'completionDate', title: 'Completion Date', type: 'date' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'daysLate', title: 'Days Late', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'service-cost-summary',
    name: 'Service Cost Summary',
    category: 'Service',
    description: 'Summary of service costs by category and period.',
    template: 'service-cost-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      groupBy: 'category',
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'cost-trend',
        type: 'line',
        title: 'Service Cost Trend',
        xField: 'date',
        yField: 'totalCost',
        aggregation: 'sum'
      }
    ],
    tables: [
      {
        id: 'service-costs',
        title: 'Service Cost Summary',
        columns: [
          { key: 'period', title: 'Period', type: 'string' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'laborCost', title: 'Labor Cost', type: 'currency' },
          { key: 'partsCost', title: 'Parts Cost', type: 'currency' },
          { key: 'serviceCount', title: 'Service Count', type: 'number' },
          { key: 'averageCost', title: 'Average Cost', type: 'currency' }
        ]
      }
    ]
  },
  {
    id: 'service-provider-performance',
    name: 'Service Provider Performance',
    category: 'Service',
    description: 'Performance metrics for service providers and vendors.',
    template: 'service-provider-performance',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'provider-rating',
        type: 'bar',
        title: 'Service Provider Performance',
        xField: 'vendorName',
        yField: 'averageRating',
        aggregation: 'avg'
      }
    ],
    tables: [
      {
        id: 'provider-metrics',
        title: 'Service Provider Performance Metrics',
        columns: [
          { key: 'vendorName', title: 'Vendor', type: 'string' },
          { key: 'totalServices', title: 'Total Services', type: 'number' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'averageCost', title: 'Average Cost', type: 'currency' },
          { key: 'averageRating', title: 'Average Rating', type: 'number' },
          { key: 'onTimePercentage', title: 'On Time %', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'labor-vs-parts',
    name: 'Labor vs Parts Summary',
    category: 'Service',
    description: 'Analysis of labor costs versus parts costs in service.',
    template: 'service-labor-vs-parts',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'labor-parts-ratio',
        type: 'bar',
        title: 'Labor vs Parts Costs',
        xField: 'period',
        yField: 'cost',
        groupField: 'type'
      }
    ],
    tables: [
      {
        id: 'labor-parts-analysis',
        title: 'Labor vs Parts Analysis',
        columns: [
          { key: 'period', title: 'Period', type: 'string' },
          { key: 'laborCost', title: 'Labor Cost', type: 'currency' },
          { key: 'partsCost', title: 'Parts Cost', type: 'currency' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'laborPercentage', title: 'Labor %', type: 'string' },
          { key: 'partsPercentage', title: 'Parts %', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'work-order-summary',
    name: 'Work Order Summary',
    category: 'Service',
    description: 'Summary of work orders and their completion status.',
    template: 'service-work-order-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'work-order-status',
        type: 'pie',
        title: 'Work Order Status Distribution',
        xField: 'status',
        yField: 'count',
        aggregation: 'count'
      }
    ],
    tables: [
      {
        id: 'work-orders',
        title: 'Work Order Summary',
        columns: [
          { key: 'workOrderNumber', title: 'WO Number', type: 'string' },
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'priority', title: 'Priority', type: 'string' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'assignedTo', title: 'Assigned To', type: 'string' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'completionDate', title: 'Completion Date', type: 'date' }
        ]
      }
    ]
  },

  // FUEL (3 rapports)
  {
    id: 'fuel-entries-vehicle',
    name: 'Fuel Entries by Vehicle',
    category: 'Fuel',
    description: 'Listing of fuel entries by vehicle.',
    template: 'fuel-entries-by-vehicle',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'vehicle-fuel-entries',
        title: 'Fuel Entries by Vehicle',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'date', title: 'Date', type: 'date' },
          { key: 'volume', title: 'Volume', type: 'number' },
          { key: 'cost', title: 'Cost', type: 'currency' },
          { key: 'vendor', title: 'Vendor', type: 'string' },
          { key: 'mpg', title: 'MPG', type: 'number' },
          { key: 'location', title: 'Location', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'fuel-summary',
    name: 'Fuel Summary',
    category: 'Fuel',
    description: 'Listing of summarized fuel metrics by vehicles.',
    template: 'fuel-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'fuel-consumption',
        type: 'bar',
        title: 'Fuel Consumption by Vehicle',
        xField: 'vehicleName',
        yField: 'totalVolume',
        aggregation: 'sum'
      }
    ],
    tables: [
      {
        id: 'fuel-metrics',
        title: 'Fuel Summary Metrics',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'totalVolume', title: 'Total Volume', type: 'number' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'averageMPG', title: 'Average MPG', type: 'number' },
          { key: 'averagePrice', title: 'Average Price', type: 'currency' },
          { key: 'entryCount', title: 'Entry Count', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'fuel-summary-location',
    name: 'Fuel Summary by Location',
    category: 'Fuel',
    description: 'Aggregate fuel volume and price data grouped by location and fuel type.',
    template: 'fuel-summary-by-location',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      groupBy: 'location',
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'fuel-by-location',
        type: 'pie',
        title: 'Fuel Consumption by Location',
        xField: 'location',
        yField: 'totalVolume',
        aggregation: 'sum'
      }
    ],
    tables: [
      {
        id: 'location-fuel-summary',
        title: 'Fuel Summary by Location',
        columns: [
          { key: 'location', title: 'Location', type: 'string' },
          { key: 'totalVolume', title: 'Total Volume', type: 'number' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'averagePrice', title: 'Average Price', type: 'currency' },
          { key: 'entryCount', title: 'Entry Count', type: 'number' },
          { key: 'marketShare', title: 'Market Share', type: 'string' }
        ]
      }
    ]
  },

  // ISSUES (2 rapports)
  {
    id: 'faults-summary',
    name: 'Faults Summary',
    category: 'Issues',
    description: 'Listing of summarized fault metrics for particular fault codes and vehicles.',
    template: 'issues-faults-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      groupBy: 'faultCode',
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'fault-frequency',
        type: 'bar',
        title: 'Fault Frequency by Code',
        xField: 'faultCode',
        yField: 'count',
        aggregation: 'count'
      }
    ],
    tables: [
      {
        id: 'faults-analysis',
        title: 'Faults Summary Analysis',
        columns: [
          { key: 'faultCode', title: 'Fault Code', type: 'string' },
          { key: 'description', title: 'Description', type: 'string' },
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'count', title: 'Occurrences', type: 'number' },
          { key: 'severity', title: 'Severity', type: 'string' },
          { key: 'lastOccurrence', title: 'Last Occurrence', type: 'date' }
        ]
      }
    ]
  },
  {
    id: 'issues-list',
    name: 'Issues List',
    category: 'Issues',
    description: 'Lists basic details of all vehicle-related issues.',
    template: 'issues-list',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'vehicle-issues',
        title: 'Vehicle Issues List',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'issueTitle', title: 'Issue Title', type: 'string' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'priority', title: 'Priority', type: 'string' },
          { key: 'assignedTo', title: 'Assigned To', type: 'string' },
          { key: 'reportedDate', title: 'Reported Date', type: 'date' }
        ]
      }
    ]
  },

  // INSPECTIONS (4 rapports)
  {
    id: 'inspection-failures',
    name: 'Inspection Failures List',
    category: 'Inspections',
    description: 'Listing of all failed inspection items.',
    template: 'inspection-failures',
    config: {
      dateRange: { start: '', end: '' },
      filters: { status: 'FAILED' },
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'inspection-failures',
        title: 'Inspection Failures',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'inspectionDate', title: 'Inspection Date', type: 'date' },
          { key: 'itemName', title: 'Failed Item', type: 'string' },
          { key: 'failureReason', title: 'Failure Reason', type: 'string' },
          { key: 'inspector', title: 'Inspector', type: 'string' },
          { key: 'location', title: 'Location', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'inspection-schedules',
    name: 'Inspection Schedules',
    category: 'Inspections',
    description: 'Listing of all inspection schedules.',
    template: 'inspection-schedules',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'inspection-schedule',
        title: 'Inspection Schedules',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'templateName', title: 'Inspection Template', type: 'string' },
          { key: 'scheduledDate', title: 'Scheduled Date', type: 'date' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'inspector', title: 'Inspector', type: 'string' },
          { key: 'location', title: 'Location', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'inspection-submission',
    name: 'Inspection Submission List',
    category: 'Inspections',
    description: 'Listing of all inspection submissions.',
    template: 'inspection-submissions',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'inspection-submissions',
        title: 'Inspection Submissions',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'inspectionDate', title: 'Inspection Date', type: 'date' },
          { key: 'templateName', title: 'Template', type: 'string' },
          { key: 'inspector', title: 'Inspector', type: 'string' },
          { key: 'complianceStatus', title: 'Compliance', type: 'string' },
          { key: 'overallScore', title: 'Score', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'inspection-summary',
    name: 'Inspection Summary',
    category: 'Inspections',
    description: 'Summary of inspection results and compliance.',
    template: 'inspection-summary',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    charts: [
      {
        id: 'compliance-rate',
        type: 'pie',
        title: 'Compliance Rate',
        xField: 'complianceStatus',
        yField: 'count',
        aggregation: 'count'
      }
    ],
    tables: [
      {
        id: 'inspection-metrics',
        title: 'Inspection Summary Metrics',
        columns: [
          { key: 'totalInspections', title: 'Total Inspections', type: 'number' },
          { key: 'passedInspections', title: 'Passed', type: 'number' },
          { key: 'failedInspections', title: 'Failed', type: 'number' },
          { key: 'complianceRate', title: 'Compliance Rate', type: 'string' },
          { key: 'averageScore', title: 'Average Score', type: 'number' }
        ]
      }
    ]
  },

  // CONTACTS (2 rapports)
  {
    id: 'contact-renewal',
    name: 'Contact Renewal Reminders',
    category: 'Contacts',
    description: 'Lists all date based reminders for contacts.',
    template: 'contact-renewal-reminders',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'renewal-reminders',
        title: 'Contact Renewal Reminders',
        columns: [
          { key: 'contactName', title: 'Contact', type: 'string' },
          { key: 'renewalType', title: 'Renewal Type', type: 'string' },
          { key: 'dueDate', title: 'Due Date', type: 'date' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'daysRemaining', title: 'Days Remaining', type: 'number' },
          { key: 'priority', title: 'Priority', type: 'string' }
        ]
      }
    ]
  },
  {
    id: 'contacts-list',
    name: 'Contacts List',
    category: 'Contacts',
    description: 'List of all basic contacts information.',
    template: 'contacts-list',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'contacts-directory',
        title: 'Contacts Directory',
        columns: [
          { key: 'name', title: 'Name', type: 'string' },
          { key: 'email', title: 'Email', type: 'string' },
          { key: 'phone', title: 'Phone', type: 'string' },
          { key: 'company', title: 'Company', type: 'string' },
          { key: 'jobTitle', title: 'Job Title', type: 'string' },
          { key: 'status', title: 'Status', type: 'string' },
          { key: 'classification', title: 'Classification', type: 'string' }
        ]
      }
    ]
  },

  // PARTS (1 rapport)
  {
    id: 'parts-vehicle',
    name: 'Parts by Vehicle',
    category: 'Parts',
    description: 'Listing of all parts used on each vehicle.',
    template: 'parts-by-vehicle',
    config: {
      dateRange: { start: '', end: '' },
      filters: {},
      includeCharts: false,
      includeSummary: true
    },
    charts: [],
    tables: [
      {
        id: 'vehicle-parts-usage',
        title: 'Parts Usage by Vehicle',
        columns: [
          { key: 'vehicleName', title: 'Vehicle', type: 'string' },
          { key: 'partNumber', title: 'Part Number', type: 'string' },
          { key: 'description', title: 'Description', type: 'string' },
          { key: 'quantity', title: 'Quantity', type: 'number' },
          { key: 'unitCost', title: 'Unit Cost', type: 'currency' },
          { key: 'totalCost', title: 'Total Cost', type: 'currency' },
          { key: 'serviceDate', title: 'Service Date', type: 'date' }
        ]
      }
    ]
  }
];