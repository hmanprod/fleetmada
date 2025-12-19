import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { InspectionStatus } from '@prisma/client';

// Types pour les données de réponse
interface InspectionMetrics {
  totalInspections: number;
  completedInspections: number;
  scheduledInspections: number;
  overdueInspections: number;
  cancelledInspections: number;
  inProgressInspections: number;
  complianceRate: number;
  averageCompletionTime: number;
  trend: {
    inspections: number;
    compliance: number;
  };
}

interface ComplianceData {
  period: string;
  complianceRate: number;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
}

interface UpcomingInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleVin?: string;
  vehicleImage?: string | null;
  scheduledDate: string;
  status: 'SCHEDULED' | 'OVERDUE' | 'IN_PROGRESS' | 'UPCOMING';
  inspectorName: string;
  templateName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string | null;
  complianceRisk?: 'low' | 'medium' | 'high';
}

interface DashboardInspectionsResponse {
  metrics: InspectionMetrics;
  complianceData: ComplianceData[];
  upcomingInspections: UpcomingInspection[];
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    inspectionId?: string;
  }>;
}

// Fonction utilitaire pour calculer les tendances
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// Fonction pour déterminer la priorité basée sur les données du véhicule
function determinePriority(vehicleId: string, lastInspectionDate?: Date): 'low' | 'medium' | 'high' | 'critical' {
  if (!lastInspectionDate) return 'high';
  
  const daysSinceLastInspection = Math.floor(
    (new Date().getTime() - lastInspectionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastInspection > 365) return 'critical';
  if (daysSinceLastInspection > 180) return 'high';
  if (daysSinceLastInspection > 90) return 'medium';
  return 'low';
}

// Fonction pour obtenir les données de conformité par période
async function getComplianceData(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ComplianceData[]> {
  const now = new Date();
  let startDate: Date;
  let format: string;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      format = 'day';
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      format = 'month';
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 15, 1);
      format = 'quarter';
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 2, 0, 1);
      format = 'year';
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      format = 'month';
  }

  const inspections = await prisma.inspection.findMany({
    where: {
      createdAt: {
        gte: startDate
      },
      status: 'COMPLETED'
    },
    select: {
      createdAt: true,
      overallScore: true,
      complianceStatus: true,
      status: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Grouper par période
  const groupedData = new Map<string, { total: number; passed: number; failed: number }>();
  
  inspections.forEach(inspection => {
    let key: string;
    const date = inspection.createdAt;
    
    switch (format) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groupedData.has(key)) {
      groupedData.set(key, { total: 0, passed: 0, failed: 0 });
    }
    
    const data = groupedData.get(key)!;
    data.total += 1;
    
    // Utiliser overallScore et complianceStatus pour déterminer la conformité
    if ((inspection.overallScore && inspection.overallScore >= 70) || 
        inspection.complianceStatus === 'COMPLIANT') {
      data.passed += 1;
    } else {
      data.failed += 1;
    }
  });

  return Array.from(groupedData.entries()).map(([period, data]) => ({
    period,
    complianceRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
    totalInspections: data.total,
    passedInspections: data.passed,
    failedInspections: data.failed
  }));
}

// Fonction pour obtenir les prochaines inspections
async function getUpcomingInspections(limit: number = 20): Promise<UpcomingInspection[]> {
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const inspections = await prisma.inspection.findMany({
    where: {
      OR: [
        { status: 'SCHEDULED' },
        { status: 'IN_PROGRESS' }
      ],
      scheduledDate: {
        lte: oneMonthFromNow
      }
    },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          vin: true,
          image: true
        }
      },
      inspectionTemplate: {
        select: {
          name: true
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      scheduledDate: 'asc'
    },
    take: limit
  });

  // Obtenir la date de dernière inspection pour chaque véhicule
  const lastInspections = await prisma.inspection.findMany({
    where: {
      vehicleId: { in: inspections.map(i => i.vehicleId) },
      status: 'COMPLETED'
    },
    select: {
      vehicleId: true,
      completedAt: true
    },
    orderBy: {
      completedAt: 'desc'
    }
  });

  const lastInspectionMap = new Map<string, Date>();
  lastInspections.forEach(inspection => {
    if (!lastInspectionMap.has(inspection.vehicleId)) {
      lastInspectionMap.set(inspection.vehicleId, inspection.completedAt!);
    }
  });

  return inspections.map(inspection => {
    // Déterminer le statut réel (OVERDUE si date dépassée)
    let actualStatus: 'SCHEDULED' | 'OVERDUE' | 'IN_PROGRESS' | 'UPCOMING';
    
    if (inspection.status === 'IN_PROGRESS') {
      actualStatus = 'IN_PROGRESS';
    } else if (inspection.status === 'SCHEDULED' && inspection.scheduledDate && new Date(inspection.scheduledDate) < now) {
      actualStatus = 'OVERDUE';
    } else if (inspection.status === 'SCHEDULED') {
      actualStatus = 'UPCOMING';
    } else {
      actualStatus = 'SCHEDULED';
    }

    return {
      id: inspection.id,
      vehicleId: inspection.vehicleId,
      vehicleName: inspection.vehicle.name,
      vehicleVin: inspection.vehicle.vin,
      vehicleImage: inspection.vehicle.image || undefined,
      scheduledDate: inspection.scheduledDate?.toISOString() || new Date().toISOString(),
      status: actualStatus,
      inspectorName: inspection.inspectorName || inspection.user.name,
      templateName: inspection.inspectionTemplate?.name || 'Template par défaut',
      priority: determinePriority(inspection.vehicleId, lastInspectionMap.get(inspection.vehicleId)),
      location: inspection.location || undefined,
      complianceRisk: 'medium' // À implémenter avec logique métier
    };
  });
}

// Fonction pour générer les alertes
function generateAlerts(metrics: InspectionMetrics, upcomingInspections: UpcomingInspection[]): Array<{
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}> {
  const alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }> = [];
  
  // Alerte inspections en retard
  if (metrics.overdueInspections > 0) {
    alerts.push({
      id: 'overdue-inspections',
      type: 'error',
      title: 'Inspections en retard',
      message: `${metrics.overdueInspections} inspection${metrics.overdueInspections > 1 ? 's' : ''} en retard nécessitent une attention immédiate.`,
      timestamp: new Date().toISOString()
    });
  }

  // Alerte taux de conformité faible
  if (metrics.complianceRate < 75 && metrics.completedInspections > 0) {
    alerts.push({
      id: 'low-compliance',
      type: 'warning',
      title: 'Taux de conformité faible',
      message: `Le taux de conformité actuel (${Math.round(metrics.complianceRate)}%) est en dessous de l'objectif de 85%.`,
      timestamp: new Date().toISOString()
    });
  }

  // Alerte inspections critiques aujourd'hui
  const criticalToday = upcomingInspections.filter(i => 
    i.priority === 'critical' && 
    new Date(i.scheduledDate).toDateString() === new Date().toDateString()
  ).length;

  if (criticalToday > 0) {
    alerts.push({
      id: 'critical-today',
      type: 'warning',
      title: 'Inspections critiques aujourd\'hui',
      message: `${criticalToday} inspection${criticalToday > 1 ? 's' : ''} critique${criticalToday > 1 ? 's' : ''} planifiée${criticalToday > 1 ? 's' : ''} aujourd'hui.`,
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
}

// GET /api/dashboard/inspections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year' || 'month';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Récupérer toutes les inspections avec relations
    const allInspections = await prisma.inspection.findMany({
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            vin: true,
            image: true
          }
        },
        inspectionTemplate: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Calculer les métriques principales
    const totalInspections = allInspections.length;
    const completedInspections = allInspections.filter(i => i.status === 'COMPLETED').length;
    const scheduledInspections = allInspections.filter(i => i.status === 'SCHEDULED').length;
    const overdueInspections = allInspections.filter(i => 
      (i.status === 'SCHEDULED' && i.scheduledDate && new Date(i.scheduledDate) < new Date())
    ).length;
    const cancelledInspections = allInspections.filter(i => i.status === 'CANCELLED').length;
    const inProgressInspections = allInspections.filter(i => i.status === 'IN_PROGRESS').length;

    // Calculer le taux de conformité
    const completedWithScore = allInspections.filter(i => 
      i.status === 'COMPLETED' && i.overallScore !== null
    );
    const complianceRate = completedWithScore.length > 0 
      ? completedWithScore.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedWithScore.length
      : 0;

    // Calculer le temps moyen de complétion
    const completedWithDuration = allInspections.filter(i => 
      i.status === 'COMPLETED' && i.startedAt && i.completedAt
    );
    const averageCompletionTime = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, i) => {
          const duration = (i.completedAt!.getTime() - i.startedAt!.getTime()) / (1000 * 60);
          return sum + duration;
        }, 0) / completedWithDuration.length
      : 0;

    // Calculer les tendances (comparaison avec la période précédente)
    const now = new Date();
    const currentPeriodStart = new Date();
    const previousPeriodStart = new Date();
    
    switch (period) {
      case 'week':
        currentPeriodStart.setDate(now.getDate() - 7);
        previousPeriodStart.setDate(now.getDate() - 14);
        break;
      case 'month':
        currentPeriodStart.setMonth(now.getMonth() - 1);
        previousPeriodStart.setMonth(now.getMonth() - 2);
        break;
      case 'quarter':
        currentPeriodStart.setMonth(now.getMonth() - 3);
        previousPeriodStart.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        currentPeriodStart.setFullYear(now.getFullYear() - 1);
        previousPeriodStart.setFullYear(now.getFullYear() - 2);
        break;
    }

    const currentPeriodInspections = allInspections.filter(i => 
      i.createdAt >= currentPeriodStart
    ).length;
    
    const previousPeriodInspections = allInspections.filter(i => 
      i.createdAt >= previousPeriodStart && i.createdAt < currentPeriodStart
    ).length;

    const currentComplianceRate = completedWithScore
      .filter(i => i.completedAt && i.completedAt >= currentPeriodStart)
      .reduce((sum, i, _, arr) => sum + (i.overallScore || 0) / arr.length, 0);

    const previousComplianceRate = completedWithScore
      .filter(i => i.completedAt && i.completedAt >= previousPeriodStart && i.completedAt < currentPeriodStart)
      .reduce((sum, i, _, arr) => sum + (i.overallScore || 0) / arr.length, 0);

    const metrics: InspectionMetrics = {
      totalInspections,
      completedInspections,
      scheduledInspections,
      overdueInspections,
      cancelledInspections,
      inProgressInspections,
      complianceRate,
      averageCompletionTime,
      trend: {
        inspections: calculateTrend(currentPeriodInspections, previousPeriodInspections),
        compliance: calculateTrend(currentComplianceRate, previousComplianceRate)
      }
    };

    // Récupérer les données de conformité
    const complianceData = await getComplianceData(period);

    // Récupérer les prochaines inspections
    const upcomingInspections = await getUpcomingInspections(limit);

    // Générer les alertes
    const alerts = generateAlerts(metrics, upcomingInspections);

    const response: DashboardInspectionsResponse = {
      metrics,
      complianceData,
      upcomingInspections,
      alerts
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache 5min
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques inspections:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: 'Impossible de récupérer les métriques des inspections'
      },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/inspections - Pour refresh manuel des données
export async function POST(request: NextRequest) {
  try {
    // Dans une implémentation réelle, on pourrait here déclencher un refresh des données
    // ou invalider les caches
    
    return NextResponse.json({
      success: true,
      message: 'Refresh des données demandé',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du refresh des données inspections:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du refresh',
        message: 'Impossible de rafraîchir les données'
      },
      { status: 500 }
    );
  }
}