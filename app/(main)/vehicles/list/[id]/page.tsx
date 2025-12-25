"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, MoreHorizontal, Loader2, AlertCircle,
    CheckCircle, Wrench, Fuel, History, Archive, X, ChevronDown,
    Calendar, AlertTriangle, Activity, MapPin, Package, DollarSign, Settings, Search, Filter,
    MessageSquare, Image, FileText, Upload, Grid, List, ExternalLink
} from 'lucide-react';
import { useVehicle } from '@/lib/hooks/useVehicles';
import { VehiclesAPIService, type Vehicle } from '@/lib/services/vehicles-api';

export default function VehicleDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const { vehicle, loading, error, refresh } = useVehicle(params.id, true);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    // État pour la popup de confirmation d'archivage
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    // États pour les modals de gestion
    const [isInspectionFormsModalOpen, setIsInspectionFormsModalOpen] = useState(false);
    const [isServiceProgramsModalOpen, setIsServiceProgramsModalOpen] = useState(false);

    // Right sidebar state
    const [activeSidebarPanel, setActiveSidebarPanel] = useState<'comments' | 'photos' | 'documents'>('comments');
    const [newComment, setNewComment] = useState('');

    // Visible tabs (first 7)
    const visibleTabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specs' },
        { id: 'financial', label: 'Financial' },
        { id: 'service-history', label: 'Service History' },
        { id: 'inspection-history', label: 'Inspection History' },
        { id: 'work-orders', label: 'Work Orders' },
        { id: 'service-reminders', label: 'Service Reminders' },
    ];

    // Tabs in More dropdown
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

    // Mapper les statuts API vers les statuts UI
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

    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="border-b border-gray-100 py-3 last:border-0">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{value || '-'}</dd>
        </div>
    );

    // Gestion de l'archivage
    const handleArchiveClick = () => {
        setIsArchiveModalOpen(true);
    };

    const handleConfirmArchive = async () => {
        if (!vehicle) return;

        setIsArchiving(true);
        try {
            const apiService = new VehiclesAPIService();
            await apiService.archiveVehicle(vehicle.id);

            // Rediriger vers la liste des véhicules
            router.push('/vehicles/list');
        } catch (error) {
            console.error('Erreur lors de l\'archivage:', error);
            alert('Erreur lors de l\'archivage du véhicule. Veuillez réessayer.');
        } finally {
            setIsArchiving(false);
        }
    };

    const handleCancelArchive = () => {
        setIsArchiveModalOpen(false);
    };

    // Empty State placeholder for list tabs
    const EmptyState = ({ title }: { title: string }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No {title} found.</p>
        </div>
    );

    // Table Header for list tabs
    const TableHeader = ({ columns }: { columns: string[] }) => (
        <thead className="bg-gray-50">
            <tr>
                {columns.map((col, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
            </tr>
        </thead>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/vehicles/list')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold overflow-hidden">
                                {vehicle.image ? (
                                    <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                                ) : (
                                    vehicle.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{vehicle.type}</span>
                                    <span>•</span>
                                    <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                                    <span>•</span>
                                    <span className="text-[#008751] underline">{vehicle.lastMeterReading?.toLocaleString() || '0'} {vehicle.lastMeterUnit || 'mi'}</span>
                                    <span>•</span>
                                    {getStatusBadge(vehicle.status)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative group">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                                <MoreHorizontal size={20} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-0 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 hidden group-hover:block">
                                <button
                                    onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/list/${params.id}/edit`); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <Settings size={14} /> Edit Vehicle Settings
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsInspectionFormsModalOpen(true); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <CheckCircle size={14} /> Manage Inspection Forms
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsServiceProgramsModalOpen(true); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <Wrench size={14} /> Manage Service Programs
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <Fuel size={14} /> Recalculate Fuel Entries
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <History size={14} /> View Record History
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleArchiveClick(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Archive size={14} /> Archive
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push(`/vehicles/list/${params.id}/edit`)}
                            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
                        >
                            Edit Vehicle
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-8">
                <div className="max-w-7xl mx-auto flex items-center">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            data-testid={`tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-[#008751] text-[#008751]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="relative">
                        <button
                            data-testid="more-tabs-button"
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            className={`py-4 px-4 flex items-center gap-1 border-b-2 font-medium text-sm transition-colors ${moreTabs.some(t => t.id === activeTab)
                                ? 'border-[#008751] text-[#008751]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            More <ChevronDown size={14} />
                        </button>
                        {isMoreMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMoreMenuOpen(false)}
                                />
                                <div className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                                    {moreTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setIsMoreMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${activeTab === tab.id
                                                ? 'bg-green-50 text-[#008751]'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <tab.icon size={14} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area with Right Sidebar */}
            <div className="max-w-full mx-auto px-8 py-8 flex gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Details</div>
                                <div className="px-6 py-2 border-b border-gray-100 text-sm text-gray-500">All Fields</div>
                                <div className="p-6 space-y-0">
                                    <DetailRow label="Name" value={vehicle.name} />
                                    <DetailRow label="Meter" value={
                                        vehicle.meterReading ?
                                            `${vehicle.meterReading.toLocaleString()} ${vehicle.primaryMeter || 'mi'}` :
                                            vehicle.lastMeterReading ?
                                                `${vehicle.lastMeterReading.toLocaleString()} ${vehicle.lastMeterUnit || 'hr'}` :
                                                '-'
                                    } />
                                    <DetailRow label="Status" value={getStatusBadge(vehicle.status)} />
                                    <DetailRow label="Group" value={vehicle.group} />
                                    <DetailRow label="Operator" value={vehicle.operator || 'Unassigned'} />
                                    <DetailRow label="Type" value={vehicle.type} />
                                    <DetailRow label="Fuel Type" value={vehicle.fuelUnit || '-'} />
                                    <DetailRow label="VIN/SN" value={vehicle.vin} />
                                    <DetailRow label="License Plate" value="-" />
                                    <DetailRow label="Year" value={vehicle.year} />
                                    <DetailRow label="Make" value={vehicle.make} />
                                    <DetailRow label="Model" value={vehicle.model} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specs Tab */}
                    {activeTab === 'specs' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Specifications</div>
                            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                                <DetailRow label="Body Type" value={vehicle.bodyType} />
                                <DetailRow label="Body Subtype" value={vehicle.bodySubtype} />
                                <DetailRow label="MSRP" value={vehicle.msrp} />
                                <DetailRow label="Width" value={vehicle.width} />
                                <DetailRow label="Height" value={vehicle.height} />
                                <DetailRow label="Length" value={vehicle.length} />
                                <DetailRow label="Interior Volume" value={vehicle.interiorVolume} />
                                <DetailRow label="Passenger Volume" value={vehicle.passengerVolume} />
                                <DetailRow label="Ground Clearance" value={vehicle.groundClearance} />
                                <DetailRow label="Bed Length" value={vehicle.bedLength} />
                            </div>
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'financial' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Purchase & Financial</div>
                            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                                <DetailRow label="Vendor" value={vehicle.purchaseVendor} />
                                <DetailRow label="Purchase Date" value={vehicle.purchaseDate} />
                                <DetailRow label="Purchase Price" value={vehicle.purchasePrice ? `Ar ${vehicle.purchasePrice.toLocaleString()}` : '-'} />
                                <DetailRow label="Loan/Lease" value={vehicle.loanLeaseType} />
                                <div className="col-span-2">
                                    <DetailRow label="Notes" value={vehicle.purchaseNotes} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service History Tab */}
                    {activeTab === 'service-history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                    <Filter size={16} /> Completion Date
                                </button>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <TableHeader columns={['Work Order', 'Actual Completion Date', 'Meter', 'Service Tasks', 'Issues', 'Vendor', 'Labels', 'Total']} />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No results to show.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Inspection History Tab */}
                    {activeTab === 'inspection-history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                    <Filter size={16} /> Inspection Submitted
                                </button>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <TableHeader columns={['Submitted', 'Duration', 'Inspection Form', 'User', 'Location Exception', 'Failed Items']} />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No results to show.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Work Orders Tab */}
                    {activeTab === 'work-orders' && (
                        <EmptyState title="work orders" />
                    )}

                    {/* Service Reminders Tab */}
                    {activeTab === 'service-reminders' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                    <Filter size={16} /> Service Task
                                </button>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <TableHeader columns={['Service Task', 'Status', 'Next Due', 'Incomplete Work Order', 'Service Program', 'Last Completed', 'Compliance']} />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No results to show.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Renewal Reminders Tab */}
                    {activeTab === 'renewal-reminders' && (
                        <EmptyState title="renewal reminders" />
                    )}

                    {/* Issues Tab */}
                    {activeTab === 'issues' && (
                        <EmptyState title="issues" />
                    )}

                    {/* Meter History Tab */}
                    {activeTab === 'meter-history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                                        Meter Date
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                                        Meter Type
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                                        Void Status
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <TableHeader columns={['Meter Date', 'Meter Value', 'Meter Type', 'Void', 'Auto-Void Reason', 'Void Status', 'Source']} />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No meter entries found.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Fuel History Tab */}
                    {activeTab === 'fuel-history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                                        Date
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                                        Vendor
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <TableHeader columns={['Date', 'Vendor', 'Alerts', 'Meter Entry', 'Usage', 'Volume', 'Total', 'Fuel Economy', 'Cost per Meter']} />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">No fuel entries found.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Assignment History Tab */}
                    {activeTab === 'assignment-history' && (
                        <EmptyState title="assignment history" />
                    )}

                    {/* Expense History Tab */}
                    {activeTab === 'expense-history' && (
                        <EmptyState title="expense history" />
                    )}

                    {/* Location History Tab */}
                    {activeTab === 'location-history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                    <Filter size={16} /> Location Entry Date
                                </button>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-96 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p>No location data available</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parts History Tab */}
                    {activeTab === 'parts-history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                    <Filter size={16} /> Service Task
                                </button>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <TableHeader columns={['Part Number', 'Work Order', 'Date', 'Service Task', 'Part Location', 'Unit Cost', 'Quantity', 'Subtotal', 'Created On']} />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">No results to show.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-80 flex-shrink-0" data-testid="right-sidebar">
                    {/* Sidebar Toggle Icons */}
                    <div className="flex items-center justify-end gap-1 mb-4">
                        <button
                            data-testid="sidebar-comments-btn"
                            onClick={() => setActiveSidebarPanel('comments')}
                            className={`p-2 rounded relative ${activeSidebarPanel === 'comments' ? 'bg-[#008751] text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                            title="Comments"
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button
                            data-testid="sidebar-photos-btn"
                            onClick={() => setActiveSidebarPanel('photos')}
                            className={`p-2 rounded ${activeSidebarPanel === 'photos' ? 'bg-[#008751] text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                            title="Photos"
                        >
                            <Image size={18} />
                        </button>
                        <button
                            data-testid="sidebar-documents-btn"
                            onClick={() => setActiveSidebarPanel('documents')}
                            className={`p-2 rounded ${activeSidebarPanel === 'documents' ? 'bg-[#008751] text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                            title="Documents"
                        >
                            <FileText size={18} />
                        </button>
                    </div>

                    {/* Comments Panel */}
                    {activeSidebarPanel === 'comments' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 font-bold text-gray-900">
                                Comments
                            </div>
                            <div className="p-4 min-h-[300px] flex flex-col">
                                {/* Empty state */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare size={28} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 max-w-48">
                                        Start a conversation or @mention someone to ask a question in the comment box below.
                                    </p>
                                </div>
                            </div>
                            {/* Comment input */}
                            <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#008751] flex items-center justify-center text-white text-sm font-bold">
                                    HR
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add a Comment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#008751] focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Photos Panel */}
                    {activeSidebarPanel === 'photos' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">Photos</span>
                                    <a href="#" className="text-gray-400 hover:text-gray-600">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                            <div className="p-4">
                                {/* Search and filters */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1">
                                        <Search size={14} className="text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search filename or description"
                                            className="bg-transparent border-none focus:ring-0 text-xs w-full"
                                        />
                                    </div>
                                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                                        <Grid size={14} />
                                    </button>
                                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                                        <List size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                                        Location Type <ChevronDown size={12} />
                                    </button>
                                </div>

                                {/* Empty photos state */}
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <Image size={28} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">No photos found</p>
                                </div>
                            </div>
                            {/* Upload area */}
                            <div className="px-4 py-4 border-t border-gray-200">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#008751] transition-colors cursor-pointer">
                                    <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Drag and drop files to upload</p>
                                    <p className="text-xs text-gray-500">or click to pick files</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Panel */}
                    {activeSidebarPanel === 'documents' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">Documents</span>
                                    <a href="#" className="text-gray-400 hover:text-gray-600">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                            <div className="p-4">
                                {/* Search and filters */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1">
                                        <Search size={14} className="text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search filename or description"
                                            className="bg-transparent border-none focus:ring-0 text-xs w-full"
                                        />
                                    </div>
                                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                                        <Grid size={14} />
                                    </button>
                                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                                        <List size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                                        Location Type <ChevronDown size={12} />
                                    </button>
                                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                                        Labels <ChevronDown size={12} />
                                    </button>
                                </div>

                                {/* Empty documents state */}
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <FileText size={28} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">No documents found</p>
                                </div>
                            </div>
                            {/* Upload area */}
                            <div className="px-4 py-4 border-t border-gray-200">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#008751] transition-colors cursor-pointer">
                                    <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Drag and drop files to upload</p>
                                    <p className="text-xs text-gray-500">or click to pick files</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Popup de confirmation d'archivage */}
            {isArchiveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Confirmer l'archivage</h3>
                            <button
                                onClick={handleCancelArchive}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isArchiving}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Êtes-vous sûr de vouloir archiver le véhicule <strong>{vehicle?.name}</strong> ?
                            </p>
                            <p className="text-sm text-gray-500">
                                Cette action peut être annulée ultérieurement. Le véhicule ne sera plus visible dans la liste active.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                onClick={handleCancelArchive}
                                disabled={isArchiving}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmArchive}
                                disabled={isArchiving}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isArchiving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Archivage...
                                    </>
                                ) : (
                                    <>
                                        <Archive size={16} />
                                        Archiver
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Inspection Forms Modal */}
            {isInspectionFormsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Inspection Forms</h3>
                            <button
                                onClick={() => setIsInspectionFormsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* Search and filter */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1">
                                    <Search size={18} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by Form Name"
                                        className="bg-transparent border-none focus:ring-0 text-sm w-full"
                                    />
                                </div>
                            </div>

                            {/* Forms table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 px-4 py-3">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Form Name</th>
                                            <th className="w-12 px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                    Disabled
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">Basic Form</td>
                                            <td className="px-4 py-3">
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 text-right">
                                <a href="#" className="text-[#008751] hover:underline text-sm font-medium">
                                    View Submissions →
                                </a>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                onClick={() => setIsInspectionFormsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Service Programs Modal */}
            {isServiceProgramsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Service Programs</h3>
                            <button
                                onClick={() => setIsServiceProgramsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 text-center">
                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={32} className="text-[#008751]" />
                            </div>

                            <h4 className="text-xl font-bold text-gray-900 mb-6">
                                Efficiently schedule and manage service needs for multiple vehicles
                            </h4>

                            <div className="text-left space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-[#008751] flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">Automate your service schedules and stay in compliance</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-[#008751] flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">Add, edit or remove service reminders for multiple vehicles at once</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-[#008751] flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">Group multiple service tasks that share the same schedule</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-[#008751] flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">Tailor service programs to the unique needs of your assets</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/service/programs/create')}
                                className="px-6 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Create Service Program
                            </button>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                onClick={() => setIsServiceProgramsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
