'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Info, HelpCircle } from 'lucide-react';

const data = [
    { year: 1, cost: 0.85, depreciation: 0.95, total: 1.05 },
    { year: 2, cost: 0.82, depreciation: 0.92, total: 1.02 },
    { year: 3, cost: 0.80, depreciation: 0.90, total: 1.00 },
    { year: 4, cost: 0.78, depreciation: 0.88, total: 0.98 },
    { year: 5, cost: 0.76, depreciation: 0.86, total: 0.96 },
    { year: 6, cost: 0.75, depreciation: 0.85, total: 0.95 },
    { year: 7, cost: 0.76, depreciation: 0.84, total: 0.95 }, // Optimal point roughly
    { year: 8, cost: 0.78, depreciation: 0.83, total: 0.97 },
];

export default function ReplacementAnalysisPage() {
    const [lifecycle, setLifecycle] = useState({
        life: 96,
        usage: 20000,
        efficiency: 15
    });

    const [acquisition, setAcquisition] = useState({
        price: 50000
    });

    const [disposal, setDisposal] = useState({
        cost: 1000,
        salvageValue: 20,
        method: 'Dégressif double'
    });

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Analyse de remplacement des véhicules</h1>

            {/* Chart Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-center font-bold text-gray-900 mb-4">Analyse de remplacement des véhicules</h2>
                <div className="h-[400px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                label={{ value: 'Âge du véhicule', position: 'bottom', offset: 0, fill: '#374151', fontWeight: 600 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `Ar${value.toFixed(2)}/km`}
                                label={{ value: 'Coût annuel par kilomètre', angle: -90, position: 'insideLeft', fill: '#374151', fontWeight: 600 }}
                                domain={[0, 1.25]}
                            />
                            <Tooltip
                                formatter={(value: number) => [`Ar${value.toFixed(2)}/km`, 'Coût']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />

                            {/* Using Areas to mimic the layered look roughly */}
                            <Area type="monotone" dataKey="total" stackId="1" stroke="#008751" fill="#008751" fillOpacity={0.1} strokeWidth={3} />
                            <Area type="monotone" dataKey="depreciation" stackId="2" stroke="none" fill="#10B981" fillOpacity={0.2} />
                            <Area type="monotone" dataKey="cost" stackId="3" stroke="none" fill="#34D399" fillOpacity={0.3} />

                            {/* Optimal Replacement Line */}
                            <ReferenceLine x={7} stroke="#D97706" strokeDasharray="3 3" label={{ position: 'top', value: 'Remplacement optimal', fill: '#D97706', fontSize: 12 }} />

                            {/* Estimated Replacement Line */}
                            <ReferenceLine x={8} stroke="#9CA3AF" strokeDasharray="3 3" label={{ position: 'right', value: 'Remplacement estimé', angle: -90, fill: '#9CA3AF', fontSize: 12 }} />

                            {/* Minimum Cost Line */}
                            <ReferenceLine y={0.95} stroke="#059669" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Coût minimum de propriété', fill: '#059669', fontSize: 10 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Estimates */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
                    {/* Lifecycle Estimates */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Estimations du cycle de vie</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="w-1/2 text-sm font-medium text-gray-700 text-right">Durée de vie estimée</label>
                                <div className="w-1/2 relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right pr-16 focus:ring-[#008751] focus:border-[#008751]"
                                        value={lifecycle.life}
                                        onChange={(e) => setLifecycle({ ...lifecycle, life: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mois</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="w-1/2 text-sm font-medium text-gray-700 text-right">Utilisation annuelle estimée</label>
                                <div className="w-1/2 relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right pr-20 focus:ring-[#008751] focus:border-[#008751]"
                                        value={lifecycle.usage}
                                        onChange={(e) => setLifecycle({ ...lifecycle, usage: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">kilomètres</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="w-1/2 text-sm font-medium text-gray-700 text-right">Efficacité énergétique estimée</label>
                                <div className="w-1/2 relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right pr-16 focus:ring-[#008751] focus:border-[#008751]"
                                        value={lifecycle.efficiency}
                                        onChange={(e) => setLifecycle({ ...lifecycle, efficiency: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mpg (US)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acquisition */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Acquisition</h3>
                        <div className="flex items-center gap-4">
                            <label className="w-1/2 text-sm font-medium text-gray-700 text-right">Prix d'achat</label>
                            <div className="w-1/2 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Ar</span>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-left pl-8 focus:ring-[#008751] focus:border-[#008751]"
                                    value={acquisition.price}
                                    onChange={(e) => setAcquisition({ ...acquisition, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Disposal */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Cession</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="w-1/2 text-sm font-medium text-gray-700 text-right flex items-center justify-end gap-1">
                                    Coût de cession estimé <HelpCircle size={14} className="text-gray-400" />
                                </label>
                                <div className="w-1/2 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Ar</span>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-left pl-8 focus:ring-[#008751] focus:border-[#008751]"
                                        value={disposal.cost}
                                        onChange={(e) => setDisposal({ ...disposal, cost: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="w-1/2 text-sm font-medium text-gray-700 text-right flex items-center justify-end gap-1">
                                    Valeur de récupération estimée <HelpCircle size={14} className="text-gray-400" />
                                </label>
                                <div className="w-1/2 relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-left focus:ring-[#008751] focus:border-[#008751]"
                                        value={disposal.salvageValue}
                                        onChange={(e) => setDisposal({ ...disposal, salvageValue: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">% du prix d'achat</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="w-1/2 text-sm font-medium text-gray-700 text-right">Méthode d'amortissement</label>
                                <div className="w-1/2 flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="depreciation"
                                            className="text-[#008751] focus:ring-[#008751]"
                                            checked={disposal.method === 'Dégressif double'}
                                            onChange={() => setDisposal({ ...disposal, method: 'Dégressif double' })}
                                        />
                                        <span className="text-sm text-gray-700">Dégressif double</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="depreciation"
                                            className="text-[#008751] focus:ring-[#008751]"
                                            checked={disposal.method === 'Somme des années'}
                                            onChange={() => setDisposal({ ...disposal, method: 'Somme des années' })}
                                        />
                                        <span className="text-sm text-gray-700">Somme des années</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Yearly Estimates */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Service Cost Estimates */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Estimations des coûts de service</h3>
                            <div className="space-y-3">
                                {[1500, 1500, 1500, 300, 1350, 2500, 2000, 10000].map((cost, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <label className="w-12 text-sm font-medium text-gray-700 text-right">An {idx + 1}</label>
                                        <div className="flex-1 relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Ar</span>
                                            <input
                                                type="number"
                                                defaultValue={cost}
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm pl-6 focus:ring-[#008751] focus:border-[#008751]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fuel Cost Estimates */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Estimations des coûts de carburant</h3>
                            <div className="space-y-3">
                                {[1.5, 1.6, 1.75, 1.9, 2, 2.1, 2.3, 2.5].map((cost, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <label className="w-12 text-sm font-medium text-gray-700 text-right">An {idx + 1}</label>
                                        <div className="flex-1 relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Ar</span>
                                            <input
                                                type="number"
                                                defaultValue={cost}
                                                step="0.1"
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm pl-6 pr-10 focus:ring-[#008751] focus:border-[#008751]"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">/litres</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
