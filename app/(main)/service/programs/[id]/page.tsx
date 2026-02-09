'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit, Plus, Wrench, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceProgramDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('vehicles');
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleBack = () => {
        router.push('/service/programs');
    };

    const handleEdit = () => {
        router.push(`/service/programs/${params.id}/edit`);
    };

    const handleAddVehicles = () => {
        router.push(`/service/programs/${params.id}/vehicles/add`);
    };

    return (
            <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mr-2">
                        Programmes d'entretien <ArrowLeft size={16} className="rotate-180" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Edit size={16} /> Modifier
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} /> Ajouter <span className="text-xs">▼</span>
                        </button>
                        {showAddMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between">
                                        <span className="text-gray-900 font-medium">Ajouter un calendrier d'entretien</span>
                                        <Wrench size={16} className="text-gray-500" />
                                    </button>
                                    <button
                                        onClick={handleAddVehicles}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                                    >
                                        <span className="text-gray-900 font-medium">Ajouter des véhicules</span>
                                        <Car size={16} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-gray-400 text-white text-xs font-bold px-1.5 py-0.5 rounded">BAS</span>
                    <h1 className="text-3xl font-bold text-gray-900">Entretien véhicule (basique)</h1>
                </div>

                <div className="flex gap-8 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'vehicles' ? 'border-[#008751] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Véhicules <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs ml-1">1</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'schedules' ? 'border-[#008751] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Calendriers d'entretien <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs ml-1">3</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
                    {activeTab === 'vehicles' && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Véhicule</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Groupe</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Compteur actuel (km)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <img src="https://source.unsplash.com/random/30x30/?truck" className="w-8 h-8 rounded object-cover" alt="" />
                                            <div>
                                                <div className="font-bold text-[#008751] hover:underline">AC101</div>
                                                <div className="text-xs text-gray-500">2018 Ford F-150</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        —
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Actif
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        35,421
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                    {activeTab === 'schedules' && (
                        <div className="p-8 text-center text-gray-500">
                            La liste des calendriers d'entretien apparaîtra ici.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
