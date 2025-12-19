"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, FileText, PenTool, RefreshCw,
    BarChart3, Settings, LayoutList, Lock, MoreHorizontal, Loader2, AlertCircle
} from 'lucide-react';
import { useVehicle } from '@/lib/hooks/useVehicles';

export default function VehicleDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('details');
    const { vehicle, loading, error, refresh } = useVehicle(params.id, true);

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

    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
        ${activeTab === id
                    ? 'bg-green-50 text-[#008751] border-r-2 border-[#008751]'
                    : 'text-gray-600 hover:bg-gray-50'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="border-b border-gray-100 py-3 last:border-0">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{value || '-'}</dd>
        </div>
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
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">
                                {vehicle.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{vehicle.type}</span>
                                    <span>•</span>
                                    <span>{vehicle.year}</span>
                                    <span>•</span>
                                    <span>{vehicle.make} {vehicle.model}</span>
                                    <span>•</span>
                                    {getStatusBadge(vehicle.status)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                            <MoreHorizontal size={20} />
                        </button>
                        <button
                            onClick={() => alert('Edit functionality to be implemented')}
                            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
                        >
                            Edit Vehicle
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 flex gap-8">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-2 overflow-hidden sticky top-28">
                        <TabButton id="details" label="Details" icon={FileText} />
                        <TabButton id="maintenance" label="Maintenance" icon={PenTool} />
                        <TabButton id="lifecycle" label="Lifecycle" icon={RefreshCw} />
                        <TabButton id="financial" label="Financial" icon={BarChart3} />
                        <TabButton id="specifications" label="Specifications" icon={LayoutList} />
                        <TabButton id="settings" label="Settings" icon={Settings} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Identification</div>
                            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                                <DetailRow label="VIN/SN" value={vehicle.vin} />
                                <DetailRow label="Vehicle Name" value={vehicle.name} />
                                <DetailRow label="Type" value={vehicle.type} />
                                <DetailRow label="Year" value={vehicle.year} />
                                <DetailRow label="Make" value={vehicle.make} />
                                <DetailRow label="Model" value={vehicle.model} />
                                <DetailRow label="Status" value={getStatusBadge(vehicle.status)} />
                                <DetailRow label="Ownership" value={vehicle.ownership} />
                                <DetailRow label="Group" value={vehicle.group} />
                                <DetailRow label="Current Operator" value={vehicle.operator} />
                                <DetailRow label="Meter Reading" value={
                                    vehicle.meterReading ? 
                                        `${vehicle.meterReading.toLocaleString()} ${vehicle.primaryMeter || 'mi'}` :
                                    vehicle.lastMeterReading ? 
                                        `${vehicle.lastMeterReading.toLocaleString()} ${vehicle.lastMeterUnit || 'mi'}` :
                                        '-'
                                } />
                                <DetailRow label="Recent Costs" value={
                                    vehicle.recentCosts ? 
                                        `${vehicle.recentCosts.toLocaleString()}` :
                                        '-'
                                } />
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Maintenance Schedule</div>
                            <div className="p-6">
                                <DetailRow label="Service Program" value={vehicle.serviceProgram || 'No Service Program assigned'} />
                            </div>
                        </div>
                    )}

                    {/* Lifecycle Tab */}
                    {activeTab === 'lifecycle' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">In-Service</div>
                                <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                                    <DetailRow label="Date" value={vehicle.inServiceDate} />
                                    <DetailRow label="Odometer" value={vehicle.inServiceOdometer?.toLocaleString()} />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Life Estimates</div>
                                <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                                    <DetailRow label="Estimated Service Life" value={vehicle.estimatedServiceLifeMonths ? `${vehicle.estimatedServiceLifeMonths} months` : '-'} />
                                    <DetailRow label="Estimated Resale Value" value={vehicle.estimatedResaleValue ? `Ar ${vehicle.estimatedResaleValue.toLocaleString()}` : '-'} />
                                </div>
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

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Vehicle Settings</div>
                            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                                <DetailRow label="Primary Meter" value={vehicle.primaryMeter} />
                                <DetailRow label="Fuel Unit" value={vehicle.fuelUnit} />
                                <DetailRow label="Measurement Units" value={vehicle.measurementUnits} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
                            <p>No specifications available.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
