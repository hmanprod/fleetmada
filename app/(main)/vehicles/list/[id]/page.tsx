"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useVehicle } from '@/lib/hooks/useVehicles';
import { VehiclesAPIService } from '@/lib/services/vehicles-api';
import { VehicleHeader } from './components/VehicleHeader';
import { VehicleTabs } from './components/VehicleTabs';
import { VehicleOverview } from './components/VehicleOverview';
import { VehicleSpecs } from './components/VehicleSpecs';
import { VehicleFinancial } from './components/VehicleFinancial';
import { DataTable } from './components/DataTable';
import { ArchiveModal, InspectionFormsModal, ServiceProgramsModal } from './components/Modals';
import { RightSidebar } from './components/RightSidebar';
import {
    Calendar, AlertTriangle, Activity, Fuel, History, DollarSign, MapPin, Package
} from 'lucide-react';

export default function VehicleDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const { vehicle, loading, error, refresh } = useVehicle(params.id, true);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    // Modal states
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isInspectionFormsModalOpen, setIsInspectionFormsModalOpen] = useState(false);
    const [isServiceProgramsModalOpen, setIsServiceProgramsModalOpen] = useState(false);

    // Right sidebar state
    const [activeSidebarPanel, setActiveSidebarPanel] = useState<'comments' | 'photos' | 'documents' | null>('comments');
    const [newComment, setNewComment] = useState('');

    // Data states
    const [dataStates, setDataStates] = useState<Record<string, any[]>>({
        workOrders: [],
        renewals: [],
        issues: [],
        fuelEntries: [],
        partsHistory: [],
        inspections: [],
        reminders: [],
        meterHistory: [],
        assignments: [],
        expenses: [],
        serviceHistory: []
    });
    const [dataLoading, setDataLoading] = useState(false);

    // Tabs configuration
    const visibleTabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specs' },
        { id: 'financial', label: 'Financial' },
        { id: 'service-history', label: 'Service History' },
        { id: 'inspection-history', label: 'Inspection History' },
        { id: 'work-orders', label: 'Work Orders' },
        { id: 'service-reminders', label: 'Service Reminders' },
    ];

    const moreTabs = [
        { id: 'renewal-reminders', label: 'Renewal Reminders', icon: Calendar },
        { id: 'issues', label: 'Issues', icon: AlertTriangle },
        { id: 'meter-history', label: 'Meter History', icon: Activity },
        { id: 'fuel-history', label: 'Fuel History', icon: Fuel },
        { id: 'assignment-history', label: 'Assignment History', icon: History },
        { id: 'expense-history', label: 'Expense History', icon: DollarSign },
        { id: 'location-history', label: 'Location History', icon: MapPin },
        { id: 'parts-history', label: 'Parts History', icon: Package },
    ];

    // Fetch data based on active tab
    useEffect(() => {
        if (!vehicle) return;

        const fetchData = async () => {
            setDataLoading(true);
            const api = new VehiclesAPIService();
            try {
                const dataMap: Record<string, { setter: keyof typeof dataStates; method: keyof VehiclesAPIService }> = {
                    'work-orders': { setter: 'workOrders', method: 'getWorkOrders' },
                    'renewal-reminders': { setter: 'renewals', method: 'getRenewals' },
                    'issues': { setter: 'issues', method: 'getIssues' },
                    'fuel-history': { setter: 'fuelEntries', method: 'getFuelEntries' },
                    'parts-history': { setter: 'partsHistory', method: 'getPartsHistory' },
                    'inspection-history': { setter: 'inspections', method: 'getInspections' },
                    'service-reminders': { setter: 'reminders', method: 'getServiceReminders' },
                    'meter-history': { setter: 'meterHistory', method: 'getMeterHistory' },
                    'assignment-history': { setter: 'assignments', method: 'getAssignments' },
                    'expense-history': { setter: 'expenses', method: 'getExpenses' },
                    'service-history': { setter: 'serviceHistory', method: 'getServiceHistory' },
                };

                const config = dataMap[activeTab as keyof typeof dataMap];
                if (config) {
                    // Simplified approach - just use the specific methods
                    if (activeTab === 'service-history') {
                        const data = await api.getServiceHistory(vehicle.id);
                        setDataStates(prev => ({ ...prev, serviceHistory: data }));
                    } else if (activeTab === 'work-orders') {
                        const data = await api.getWorkOrders(vehicle.id);
                        setDataStates(prev => ({ ...prev, workOrders: data }));
                    }
                    // Add other specific methods as needed
                }
            } catch (err) {
                console.error("Error fetching tab data", err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [activeTab, vehicle]);

    // Status badge mapper
    const getStatusBadge = (status: string) => {
        const statusMap = {
            'ACTIVE': { label: 'Active', class: 'bg-green-100 text-green-800' },
            'INACTIVE': { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
            'MAINTENANCE': { label: 'En maintenance', class: 'bg-yellow-100 text-yellow-800' },
            'DISPOSED': { label: 'Retiré du service', class: 'bg-red-100 text-red-800' }
        };

        const config = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>
                {config.label}
            </span>
        );
    };

    // Archive handlers
    const handleArchiveClick = () => setIsArchiveModalOpen(true);
    const handleConfirmArchive = async () => {
        if (!vehicle) return;
        setIsArchiving(true);
        try {
            const apiService = new VehiclesAPIService();
            await apiService.archiveVehicle(vehicle.id);
            router.push('/vehicles/list');
        } catch (error) {
            console.error('Erreur lors de l\'archivage:', error);
            alert('Erreur lors de l\'archivage du véhicule. Veuillez réessayer.');
        } finally {
            setIsArchiving(false);
        }
    };
    const handleCancelArchive = () => setIsArchiveModalOpen(false);

    // Comment handlers
    const handleAddComment = () => {
        setNewComment('');
    };

    // Render tab content
    const renderTabContent = () => {
        if (!vehicle) return null;

        const data = dataStates[activeTab.replace('-', '') as keyof typeof dataStates] || [];

        switch (activeTab) {
            case 'overview':
                return <VehicleOverview vehicle={vehicle} getStatusBadge={getStatusBadge} />;
            case 'specs':
                return <VehicleSpecs vehicle={vehicle} />;
            case 'financial':
                return <VehicleFinancial vehicle={vehicle} />;
            case 'service-history':
                return (
                    <DataTable
                        title="historique de service"
                        columns={['Work Order', 'Actual Completion Date', 'Meter', 'Service Tasks', 'Issues', 'Vendor', 'Labels', 'Total']}
                        data={dataStates.serviceHistory}
                        renderRow={(entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-[#008751]">#{entry.id.slice(-6)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.meter?.toLocaleString()}</td>
                                <td className="px-6 py-4">{entry.tasks?.length || 0} tasks</td>
                                <td className="px-6 py-4">{entry.issues?.length || 0} issues</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.vendor?.name || '-'}</td>
                                <td className="px-6 py-4 flex gap-1">
                                    {entry.labels?.map((label: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{label}</span>
                                    ))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{(entry.totalCost || 0).toLocaleString()}</td>
                            </tr>
                        )}
                    />
                );
            case 'work-orders':
                return (
                    <DataTable
                        title="work orders"
                        columns={['ID', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Description']}
                        data={dataStates.workOrders}
                        renderRow={(workOrder) => (
                            <tr key={workOrder.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-[#008751]">#{workOrder.id.slice(-6)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{workOrder.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{workOrder.priority}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{workOrder.assignedTo || 'Unassigned'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-4">{workOrder.description}</td>
                            </tr>
                        )}
                    />
                );
            // Add more tab cases as needed
            default:
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Onglet en cours de développement</p>
                    </div>
                );
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-[#008751]" size={48} />
                    <p className="text-gray-600">Chargement du véhicule...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h1 className="text-xl font-bold text-red-900 mb-2">Erreur de chargement</h1>
                    <p className="text-red-700 mb-4">{error}</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => router.push('/vehicles/list')}
                            className="px-4 py-2 text-red-700 hover:text-red-900 font-medium"
                        >
                            Retour à la liste
                        </button>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Vehicle not found
    if (!vehicle) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Véhicule non trouvé</h1>
                <p className="text-gray-600 mb-4">Le véhicule demandé n'existe pas ou vous n'avez pas les permissions pour y accéder.</p>
                <button
                    onClick={() => router.push('/vehicles/list')}
                    className="text-[#008751] hover:underline"
                >
                    Retour à la liste des véhicules
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <VehicleHeader
                vehicle={vehicle}
                params={params}
                getStatusBadge={getStatusBadge}
                onArchiveClick={handleArchiveClick}
                onInspectionFormsClick={() => setIsInspectionFormsModalOpen(true)}
                onServiceProgramsClick={() => setIsServiceProgramsModalOpen(true)}
            />

            <VehicleTabs
                visibleTabs={visibleTabs}
                moreTabs={moreTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isMoreMenuOpen={isMoreMenuOpen}
                onMoreMenuToggle={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            />

            {/* Content Area with Right Sidebar */}
            <div className="max-w-full mx-auto px-8 py-8 flex gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-6">
                    {renderTabContent()}
                </div>

                {/* Right Sidebar */}
                <RightSidebar
                    activePanel={activeSidebarPanel}
                    onPanelChange={setActiveSidebarPanel}
                    vehicleId={params.id}
                />
            </div>

            {/* Modals */}
            <ArchiveModal
                isOpen={isArchiveModalOpen}
                isArchiving={isArchiving}
                onConfirm={handleConfirmArchive}
                onCancel={handleCancelArchive}
            />

            <InspectionFormsModal
                isOpen={isInspectionFormsModalOpen}
                onClose={() => setIsInspectionFormsModalOpen(false)}
            />

            <ServiceProgramsModal
                isOpen={isServiceProgramsModalOpen}
                onClose={() => setIsServiceProgramsModalOpen(false)}
            />
        </div>
    );
}
