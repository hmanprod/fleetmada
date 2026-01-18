"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, MoreHorizontal, Settings, CheckCircle, Wrench, Fuel, History, Archive
} from 'lucide-react';
import type { Vehicle } from '@/lib/services/vehicles-api';

interface VehicleHeaderProps {
    vehicle: Vehicle;
    params: { id: string };
    getStatusBadge: (status: string) => React.ReactNode;
    onArchiveClick: () => void;
    onInspectionFormsClick: () => void;
    onServiceProgramsClick: () => void;
}

export function VehicleHeader({
    vehicle,
    params,
    getStatusBadge,
    onArchiveClick,
    onInspectionFormsClick,
    onServiceProgramsClick
}: VehicleHeaderProps) {
    const router = useRouter();

    return (
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
                                {vehicle.licensePlate && (
                                    <>
                                        <span>•</span>
                                        <span className="font-medium text-gray-700">{vehicle.licensePlate}</span>
                                    </>
                                )}
                                <span>•</span>
                                <span className="text-[#008751] underline">{(vehicle.meterReading || vehicle.lastMeterReading || 0).toLocaleString()} {vehicle.primaryMeter || vehicle.lastMeterUnit || 'mi'}</span>
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
                                <Settings size={14} /> Modifier les paramètres du véhicule
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onInspectionFormsClick(); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <CheckCircle size={14} /> Gérer les formulaires d'inspection
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onServiceProgramsClick(); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <Wrench size={14} /> Gérer les programmes de service
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <Fuel size={14} /> Recalculer les entrées de carburant
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <History size={14} /> Voir l'historique des enregistrements
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onArchiveClick(); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Archive size={14} /> Archiver
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/vehicles/list/${params.id}/edit`)}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
                    >
                        Modifier le véhicule
                    </button>
                </div>
            </div>
        </div>
    );
}