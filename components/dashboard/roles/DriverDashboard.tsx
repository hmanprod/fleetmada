"use client";

import React from 'react';
import { Car, ClipboardCheck, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import MetricCard from '../MetricCard';
import Link from 'next/link';

interface DriverDashboardProps {
    metrics: any;
    vehicles: any[];
    inspections: any[];
    reminders: any[];
    issues: any[];
    loading: boolean;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({
    metrics,
    vehicles,
    inspections,
    reminders,
    issues,
    loading
}) => {
    return (
        <div className="space-y-6">
            {/* Mes Véhicules Affectés */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Car className="h-5 w-5 text-[#008751]" />
                        Mes Véhicules Affectés
                    </h2>
                    <Link href="/vehicles/list" className="text-sm font-medium text-[#008751] hover:underline flex items-center gap-1">
                        Voir tout <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)
                    ) : vehicles.length > 0 ? (
                        vehicles.map(vehicle => (
                            <div key={vehicle.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{vehicle.name}</h3>
                                        <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} - {vehicle.licensePlate}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {vehicle.meterReading?.toLocaleString()} km
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                            <p className="text-gray-500">Aucun véhicule ne vous est actuellement affecté.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inspections à faire */}
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-blue-500" />
                            Inspections à réaliser
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg"></div>)
                        ) : inspections.length > 0 ? (
                            inspections.map(inspection => (
                                <div key={inspection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">{inspection.title}</p>
                                        <p className="text-xs text-gray-500">Prévu le {new Date(inspection.scheduledDate).toLocaleDateString()}</p>
                                    </div>
                                    <Link href={`/inspections/${inspection.id}`} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">
                                        Démarrer
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Félicitations ! Aucune inspection en attente.</p>
                        )}
                    </div>
                </section>

                {/* Problèmes signalés */}
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Mes Problèmes en cours
                        </h2>
                        <Link href="/issues/create" className="text-xs font-bold text-orange-600 hover:underline">+ Signaler</Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg"></div>)
                        ) : issues.length > 0 ? (
                            issues.map(issue => (
                                <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="max-w-[70%]">
                                        <p className="font-medium text-gray-900 truncate">{issue.summary}</p>
                                        <p className="text-xs text-gray-500">{issue.vehicle?.name || 'Véhicule inconnu'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {issue.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Aucun problème actif signalé.</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Rappels de maintenance (Reminders) */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Rappels de maintenance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>)
                    ) : reminders.length > 0 ? (
                        reminders.map(reminder => (
                            <div key={reminder.id} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <div className="bg-yellow-200 p-2 rounded-full">
                                    <Clock className="h-4 w-4 text-yellow-700" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{reminder.task}</p>
                                    <p className="text-xs text-gray-600">Pour {reminder.vehicleName} - Échéance : {new Date(reminder.nextDue).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-sm text-gray-500 text-center py-4">Pas de rappels proches.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DriverDashboard;
