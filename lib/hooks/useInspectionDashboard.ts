"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuthToken, authenticatedFetch } from './useAuthToken';

export interface InspectionMetrics {
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

export interface ComplianceData {
    period: string;
    complianceRate: number;
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
}

export interface UpcomingInspection {
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

export interface InspectionDashboardResponse {
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

export function useInspectionDashboard() {
    const [data, setData] = useState<InspectionDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuthToken();

    const fetchDashboardData = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);
            const response = await authenticatedFetch('/api/dashboard/inspections', token);

            if (response && (response.metrics || response.upcomingInspections)) {
                setData(response);
            } else if (response && response.error) {
                throw new Error(response.error);
            } else {
                // Handle case where response might be the data directly if success: true is not wrapped
                setData(response);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement du tableau de bord');
            console.error('Error fetching inspection dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token, fetchDashboardData]);

    return {
        data,
        loading,
        error,
        refresh: fetchDashboardData
    };
}
