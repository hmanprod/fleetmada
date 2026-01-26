"use client";

import React from 'react';
import { Hammer, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TechDashboardProps {
    metrics: any;
    workOrders: any[];
    issues: any[];
    loading: boolean;
}

const TechDashboard: React.FC<TechDashboardProps> = ({
    metrics,
    workOrders,
    issues,
    loading
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Demandes en cours</h3>
                        <Hammer className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{workOrders.length}</span>
                        <span className="text-sm text-gray-500">interventions</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Problèmes assignés</h3>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{issues.length}</span>
                        <span className="text-sm text-gray-500">à résoudre</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Performance</h3>
                        <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">92%</span>
                        <span className="text-sm text-gray-500">Taux complétion</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Entretien à faire (Work Orders) */}
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Hammer className="h-5 w-5 text-blue-500" />
                            Mes Interventions (Work Orders)
                        </h2>
                        <Link href="/service/work-orders" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                            Tout voir <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>)
                        ) : workOrders.length > 0 ? (
                            workOrders.map(order => (
                                <div key={order.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-900">WO-{order.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-sm text-gray-600">{order.vehicle?.name || 'Véhicule inconnu'}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${order.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-500">Aucune intervention active assignée.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Problèmes en cours */}
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Problèmes à Traiter
                        </h2>
                        <Link href="/issues" className="text-sm font-medium text-orange-600 hover:underline flex items-center gap-1">
                            Tout voir <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>)
                        ) : issues.length > 0 ? (
                            issues.map(issue => (
                                <div key={issue.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="max-w-[75%]">
                                            <p className="font-bold text-gray-900 truncate">{issue.summary}</p>
                                            <p className="text-sm text-gray-600">{issue.vehicle?.name || 'Véhicule inconnu'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${issue.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {issue.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{issue.status}</span>
                                        <span>Assigné le {new Date(issue.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-500">Aucun problème en attente.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TechDashboard;
