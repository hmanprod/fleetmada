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
import { VehicleRenewals } from './components/VehicleRenewals';
import { VehicleIssues } from './components/VehicleIssues';
import { VehicleAssignments } from './components/VehicleAssignments';
import { VehicleServiceReminders } from './components/VehicleServiceReminders';
import { VehicleMeterHistory } from './components/VehicleMeterHistory';
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
                switch (activeTab) {
                    case 'service-history':
                        const serviceData = await api.getServiceHistory(vehicle.id);
                        setDataStates(prev => ({ ...prev, serviceHistory: serviceData }));
                        break;
                    case 'work-orders':
                        const workOrdersData = await api.getWorkOrders(vehicle.id);
                        setDataStates(prev => ({ ...prev, workOrders: workOrdersData }));
                        break;
                    case 'inspection-history':
                        const inspectionsData = await api.getInspections(vehicle.id);
                        setDataStates(prev => ({ ...prev, inspections: inspectionsData }));
                        break;
                    case 'service-reminders':
                        const remindersData = await api.getServiceReminders(vehicle.id);
                        setDataStates(prev => ({ ...prev, reminders: remindersData }));
                        break;
                    case 'renewal-reminders':
                        const renewalsData = await api.getRenewals(vehicle.id);
                        setDataStates(prev => ({ ...prev, renewals: renewalsData }));
                        break;
                    case 'issues':
                        const issuesData = await api.getIssues(vehicle.id);
                        setDataStates(prev => ({ ...prev, issues: issuesData }));
                        break;
                    case 'meter-history':
                        const meterData = await api.getMeterHistory(vehicle.id);
                        setDataStates(prev => ({ ...prev, meterHistory: meterData }));
                        break;
                    case 'fuel-history':
                        const fuelData = await api.getFuelEntries(vehicle.id);
                        setDataStates(prev => ({ ...prev, fuelEntries: fuelData }));
                        break;
                    case 'assignment-history':
                        const assignmentsData = await api.getAssignments(vehicle.id);
                        setDataStates(prev => ({ ...prev, assignments: assignmentsData }));
                        break;
                    case 'expense-history':
                        const expensesData = await api.getExpenses(vehicle.id);
                        setDataStates(prev => ({ ...prev, expenses: expensesData }));
                        break;
                    case 'parts-history':
                        const partsData = await api.getPartsHistory(vehicle.id);
                        setDataStates(prev => ({ ...prev, partsHistory: partsData }));
                        break;
                    default:
                        break;
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
            case 'inspection-history':
                return (
                    <DataTable
                        title="inspection history"
                        columns={['Inspection', 'Form', 'Date', 'Meter', 'Status', 'Failed Items', 'Submitted By']}
                        data={dataStates.inspections || []}
                        renderRow={(inspection) => (
                            <tr key={inspection.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-[#008751]">#{inspection.id.slice(-6)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{inspection.form || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(inspection.date || inspection.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{inspection.meter?.toLocaleString() || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${inspection.status === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {inspection.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{inspection.failedItems || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{inspection.submittedBy || '-'}</td>
                            </tr>
                        )}
                    />
                );
            case 'service-reminders':
                return <VehicleServiceReminders vehicleId={params.id} data={dataStates.reminders || []} />;
            case 'renewal-reminders':
                return <VehicleRenewals vehicleId={params.id} data={dataStates.renewals || []} />;
            case 'issues':
                return <VehicleIssues vehicleId={params.id} data={dataStates.issues || []} />;
            case 'meter-history':
                return <VehicleMeterHistory vehicleId={params.id} data={dataStates.meterHistory || []} />;
            case 'fuel-history':
                return (
                    <DataTable
                        title="fuel history"
                        columns={['Date', 'Quantity', 'Cost', 'Price/Unit', 'Odometer', 'Vendor']}
                        data={dataStates.fuelEntries || []}
                        renderRow={(entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{entry.quantity?.toLocaleString()} L</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.cost?.toLocaleString()} Ar</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.pricePerUnit?.toLocaleString()} Ar/L</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.odometer?.toLocaleString() || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.vendor?.name || '-'}</td>
                            </tr>
                        )}
                    />
                );
            case 'assignment-history':
                return <VehicleAssignments vehicleId={params.id} data={dataStates.assignments || []} />;
            case 'expense-history':
                return (
                    <DataTable
                        title="expense history"
                        columns={['Date', 'Type', 'Amount', 'Vendor', 'Reference', 'Notes']}
                        data={dataStates.expenses || []}
                        renderRow={(expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{expense.type || expense.category || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{expense.amount?.toLocaleString()} Ar</td>
                                <td className="px-6 py-4 whitespace-nowrap">{expense.vendor?.name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{expense.reference || '-'}</td>
                                <td className="px-6 py-4">{expense.notes || '-'}</td>
                            </tr>
                        )}
                    />
                );
            case 'location-history':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Location tracking requires GPS integration.</p>
                        <p className="text-sm text-gray-400 mt-1">Connect a GPS device to view location history.</p>
                    </div>
                );
            case 'parts-history':
                return (
                    <DataTable
                        title="parts history"
                        columns={['Date', 'Part Name', 'Part Number', 'Quantity', 'Unit Cost', 'Total', 'Work Order']}
                        data={dataStates.partsHistory || []}
                        renderRow={(part) => (
                            <tr key={part.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(part.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{part.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{part.partNumber || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{part.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{part.unitCost?.toLocaleString() || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{part.totalCost?.toLocaleString() || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-[#008751]">#{part.workOrderId?.slice(-6) || '-'}</td>
                            </tr>
                        )}
                    />
                );
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
