'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Search,
    Car,
    AlertCircle,
    CheckCircle,
    CheckSquare,
    Square,
    EyeOff,
    Clock,
    Play,
    RefreshCw,
    X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { vehiclesAPI, VehicleAssignment } from '@/lib/services/vehicles-api';

type TabType = 'ACTIVE' | 'MISSED' | 'IGNORED';

interface ScheduledInspection {
    scheduleId: string;
    templateId: string;
    templateName: string;
    templateCategory: string;
    templateColor?: string;
    vehicleId: string;
    vehicleName: string;
    vehicleVin: string;
    dueDate: string; // Calculated due date
    frequencyType: string | null;
    frequencyInterval: number | null;
    ruleType: string;
    isIgnored?: boolean;
    hasCompleted?: boolean;
}

export default function InspectionSchedulesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { token } = useAuthToken();
    const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');
    const [searchQuery, setSearchQuery] = useState('');
    const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
    const [schedules, setSchedules] = useState<ScheduledInspection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Fetch data
    const fetchData = async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);

        try {
            // Fetch expanded schedules from new API
            const schedulesRes = await fetch('/api/inspection-schedules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!schedulesRes.ok) {
                throw new Error(`Failed to fetch schedules: ${schedulesRes.status}`);
            }

            const schedulesData = await schedulesRes.json();
            if (schedulesData.success) {
                setSchedules(schedulesData.data || []);
            } else {
                throw new Error(schedulesData.error || 'Unknown error');
            }

            // Fetch assignments for driver filtering
            try {
                const assignmentsData = await vehiclesAPI.getAllAssignments();
                setAssignments(assignmentsData || []);
            } catch (e) {
                console.warn('Could not load assignments:', e);
            }

        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Clear selection when tab changes
    useEffect(() => {
        setSelectedItems(new Set());
    }, [activeTab]);

    const tabCounts = useMemo(() => {
        const counts = { ACTIVE: 0, MISSED: 0, IGNORED: 0 };
        if (!schedules.length) return counts;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Sort out relevant vehicle IDs once
        let relevantVehicleIds: Set<string> | null = null;
        const userName = user ? `${user.firstName} ${user.lastName}` : '';
        const userAssignments = assignments.filter(a => a.operator === userName && a.isActive);
        if (userAssignments.length > 0) {
            relevantVehicleIds = new Set(userAssignments.map(a => a.vehicleId));
        }

        schedules.forEach(schedule => {
            if (relevantVehicleIds && !relevantVehicleIds.has(schedule.vehicleId)) return;

            const isIgnored = !!schedule.isIgnored;
            const isCompleted = !!schedule.hasCompleted;

            if (isIgnored) {
                counts.IGNORED++;
                return;
            }
            if (isCompleted) return;

            if (!schedule.dueDate) {
                counts.ACTIVE++;
                return;
            }

            const dueDateObj = new Date(schedule.dueDate);
            dueDateObj.setHours(0, 0, 0, 0);

            if (dueDateObj >= today && dueDateObj <= nextWeek) {
                counts.ACTIVE++;
            } else if (dueDateObj < today) {
                counts.MISSED++;
            }
        });

        return counts;
    }, [schedules, assignments, user]);

    // Process and filter data
    const processedData = useMemo(() => {
        if (!schedules.length) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Driver filtering
        let relevantVehicleIds: Set<string> | null = null;
        const userName = user ? `${user.firstName} ${user.lastName}` : '';
        const userAssignments = assignments.filter(a =>
            a.operator === userName && a.isActive
        );
        if (userAssignments.length > 0) {
            relevantVehicleIds = new Set(userAssignments.map(a => a.vehicleId));
        }

        // Filter schedules
        const filteredSchedules = schedules.filter(schedule => {
            // Driver filter
            if (relevantVehicleIds && !relevantVehicleIds.has(schedule.vehicleId)) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!schedule.vehicleName.toLowerCase().includes(query) &&
                    !schedule.vehicleVin.toLowerCase().includes(query) &&
                    !schedule.templateName.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // Status filter (from API)
            const isIgnored = !!schedule.isIgnored;
            const isCompleted = !!schedule.hasCompleted;

            if (activeTab === 'IGNORED') return isIgnored;
            if (isIgnored || isCompleted) return false;

            if (!schedule.dueDate) {
                return activeTab === 'ACTIVE';
            }

            const dueDateObj = new Date(schedule.dueDate);
            dueDateObj.setHours(0, 0, 0, 0);

            if (activeTab === 'ACTIVE') {
                return dueDateObj >= today && dueDateObj <= nextWeek;
            }

            if (activeTab === 'MISSED') {
                return dueDateObj < today;
            }

            return false;
        });

        // Sort by date (already sorted from API, but ensure after filtering)
        filteredSchedules.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return filteredSchedules;
    }, [schedules, assignments, user, activeTab, searchQuery]);

    const handleIgnore = async (e: React.MouseEvent, schedule: ScheduledInspection) => {
        e.stopPropagation();
        try {
            const res = await fetch('/api/inspection-schedules', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vehicleId: schedule.vehicleId,
                    templateId: schedule.templateId,
                    dueDate: schedule.dueDate,
                    templateName: schedule.templateName,
                    action: 'IGNORE'
                })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Failed to ignore schedule:', err);
        }
    };

    const handleRestore = async (e: React.MouseEvent, schedule: ScheduledInspection) => {
        e.stopPropagation();
        try {
            const res = await fetch('/api/inspection-schedules', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vehicleId: schedule.vehicleId,
                    templateId: schedule.templateId,
                    dueDate: schedule.dueDate,
                    action: 'RESTORE'
                })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Failed to restore schedule:', err);
        }
    };

    const handleLaunch = (e: React.MouseEvent, schedule: ScheduledInspection) => {
        e.stopPropagation();
        // Navigate to start page with the template ID
        router.push(`/inspections/forms/${schedule.templateId}/start`);
    };

    // Selection handlers
    const toggleSelection = (uniqueKey: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(uniqueKey)) {
            newSelected.delete(uniqueKey);
        } else {
            newSelected.add(uniqueKey);
        }
        setSelectedItems(newSelected);
    };

    const selectAll = () => {
        if (!processedData) return;
        const allKeys = processedData.map(item =>
            `${item.scheduleId}-${item.vehicleId}-${item.dueDate}`
        );
        setSelectedItems(new Set(allKeys));
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
    };

    const markSelectedAsIgnored = async () => {
        if (selectedItems.size === 0) return;

        try {
            const itemsToIgnore = Array.from(selectedItems).map(key => {
                const item = schedules.find(s => `${s.scheduleId}-${s.vehicleId}-${s.dueDate}` === key);
                return item;
            }).filter(Boolean);

            if (itemsToIgnore.length === 0) return;

            const res = await fetch('/api/inspection-schedules', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'IGNORE',
                    items: itemsToIgnore.map(item => ({
                        vehicleId: item!.vehicleId,
                        templateId: item!.templateId,
                        dueDate: item!.dueDate,
                        templateName: item!.templateName
                    }))
                })
            });

            if (res.ok) {
                setSelectedItems(new Set());
                fetchData();
            } else {
                const errorData = await res.json();
                console.error('Failed bulk ignore:', errorData.error);
            }
        } catch (err) {
            console.error('Failed bulk ignore:', err);
        }
    };

    const formatFrequency = (type: string | null, interval: number | null) => {
        if (!type) return 'Non configuré';
        const freq = interval && interval > 1 ? `${interval} ` : '';
        switch (type) {
            case 'DAILY': return `${freq}jour${interval && interval > 1 ? 's' : ''}`;
            case 'WEEKLY': return `${freq}semaine${interval && interval > 1 ? 's' : ''}`;
            case 'MONTHLY': return `${freq}mois`;
            case 'MILEAGE': return `${interval || ''} km`;
            default: return type;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto mb-4"></div>
                    <p className="text-gray-500">Chargement des planifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1200px] mx-auto min-h-screen bg-[#f9fafb]">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier des Inspections</h1>
                <p className="text-gray-500">
                    Suivez les inspections planifiées pour vos véhicules et lancez-les directement.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par véhicule ou type d'inspection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-2">
                {(['ACTIVE', 'MISSED', 'IGNORED'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab
                                ? 'border-[#008751] text-[#008751]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        {tab === 'ACTIVE' && <CheckCircle size={16} />}
                        {tab === 'MISSED' && <AlertCircle size={16} />}
                        {tab === 'IGNORED' && <EyeOff size={16} />}
                        <span>
                            {tab === 'ACTIVE' ? 'Actif (7 jours)' :
                                tab === 'MISSED' ? 'Loupé' : 'Ignorée'}
                        </span>
                        {tabCounts[tab] > 0 && (
                            <span className={`
                                ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full
                                ${tab === 'MISSED'
                                    ? 'bg-red-100 text-red-600'
                                    : activeTab === tab
                                        ? 'bg-[#e6f3ee] text-[#008751]'
                                        : 'bg-gray-100 text-gray-500'}
                            `}>
                                {tabCounts[tab]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Selection Bar (for MISSED tab) */}
            {activeTab === 'MISSED' && processedData && processedData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={selectedItems.size === processedData.length ? clearSelection : selectAll}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            {selectedItems.size === processedData.length ? (
                                <CheckSquare size={18} className="text-[#008751]" />
                            ) : (
                                <Square size={18} />
                            )}
                            <span>
                                {selectedItems.size > 0
                                    ? `${selectedItems.size} sélectionné${selectedItems.size > 1 ? 's' : ''}`
                                    : 'Tout sélectionner'}
                            </span>
                        </button>
                        {selectedItems.size > 0 && (
                            <button
                                onClick={clearSelection}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <X size={14} />
                                Désélectionner
                            </button>
                        )}
                    </div>
                    {selectedItems.size > 0 && (
                        <button
                            onClick={markSelectedAsIgnored}
                            className="px-4 py-2 text-sm font-bold text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all"
                        >
                            <EyeOff size={16} />
                            Marquer comme ignoré ({selectedItems.size})
                        </button>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="space-y-3">
                {!processedData || processedData.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200 border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune planification trouvée</h3>
                        <p className="text-gray-500">
                            {activeTab === 'ACTIVE' ? 'Aucune inspection prévue pour les 7 prochains jours.' :
                                activeTab === 'MISSED' ? 'Aucune inspection en retard.' :
                                    'Aucune inspection ignorée.'}
                        </p>
                        {schedules.length === 0 && (
                            <p className="text-gray-400 text-sm mt-2">
                                Assurez-vous d&apos;avoir configuré des planifications dans vos formulaires d&apos;inspection.
                            </p>
                        )}
                    </div>
                ) : (
                    processedData.map((item) => {
                        const uniqueKey = `${item.scheduleId}-${item.vehicleId}-${item.dueDate}`;
                        const dueDate = new Date(item.dueDate);
                        const isToday = dueDate.toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={uniqueKey}
                                className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedItems.has(uniqueKey) ? 'border-[#008751] ring-1 ring-[#008751]' : 'border-gray-200'
                                    }`}
                            >
                                {/* Checkbox (MISSED only) */}
                                {activeTab === 'MISSED' && (
                                    <button
                                        onClick={() => toggleSelection(uniqueKey)}
                                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                                    >
                                        {selectedItems.has(uniqueKey) ? (
                                            <CheckSquare size={20} className="text-[#008751]" />
                                        ) : (
                                            <Square size={20} className="text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                )}

                                {/* Date Badge */}
                                <div className={`
                                    flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-center rounded-lg p-3 min-w-[90px] border
                                    ${activeTab === 'MISSED'
                                        ? 'bg-red-50 text-red-700 border-red-100'
                                        : isToday
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'}
                                `}>
                                    <Calendar size={18} className="mb-1 hidden md:block" />
                                    <span className="font-bold text-lg md:text-xl">
                                        {dueDate.getDate()}
                                    </span>
                                    <span className="text-xs uppercase font-bold ml-2 md:ml-0">
                                        {dueDate.toLocaleDateString('fr-FR', { month: 'short' })}
                                    </span>
                                    {isToday && (
                                        <span className="text-[10px] mt-1 font-medium hidden md:block">Aujourd&apos;hui</span>
                                    )}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                            {item.templateCategory}
                                        </span>
                                        <span className="text-xs text-gray-300">•</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <RefreshCw size={10} />
                                            {formatFrequency(item.frequencyType, item.frequencyInterval)}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-lg truncate">
                                        {item.templateName}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                        <Car size={14} className="text-gray-400" />
                                        <span className="font-medium">{item.vehicleName}</span>
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-500">
                                            {item.vehicleVin}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                                    {activeTab === 'IGNORED' ? (
                                        <button
                                            onClick={(e) => handleRestore(e, item)}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            Restaurer
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => handleIgnore(e, item)}
                                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Ignorer
                                            </button>
                                            <button
                                                onClick={(e) => handleLaunch(e, item)}
                                                className="px-4 py-2 text-sm font-bold text-white bg-[#008751] hover:bg-[#007043] rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all"
                                            >
                                                <Play size={16} />
                                                Lancer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
