'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, X, AlertCircle, Calendar, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServicePrograms } from '@/lib/hooks/useServicePrograms';
import { ServiceProgram } from '@/lib/services/service-api';

export default function ServiceProgramsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [showBanner, setShowBanner] = useState(true);
    const [filters, setFilters] = useState({
        active: undefined as boolean | undefined,
        category: ''
    });

    // Hook pour les programmes de service
    const {
        programs,
        loading,
        error,
        pagination,
        fetchPrograms,
        createProgram,
        updateProgram,
        deleteProgram,
        totalPrograms,
        activePrograms,
        upcomingDuePrograms,
        totalVehiclesInPrograms,
        refresh
    } = useServicePrograms({
        search: searchTerm,
        active: filters.active
    });

    const handleAddProgram = () => {
        router.push('/service/programs/create');
    };

    const handleProgramClick = (id: string) => {
        router.push(`/service/programs/${id}`);
    };

    const handleCreateProgram = async () => {
        const newProgram = await createProgram({
            name: 'Nouveau Programme',
            description: 'Description du programme',
            frequency: 'monthly',
            active: true
        });

        if (newProgram) {
            router.push(`/service/programs/${newProgram.id}/edit`);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        fetchPrograms({ search: value });
    };

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
        fetchPrograms(newFilters);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStatusBadge = (program: ServiceProgram) => {
        if (!program.active) {
            return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Inactif</span>;
        }

        if (program.nextDue && new Date(program.nextDue) < new Date()) {
            return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">En retard</span>;
        }

        if (program.nextDue && new Date(program.nextDue) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
            return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Bientôt dû</span>;
        }

        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Actif</span>;
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Service Programs</h1>
                    <button className="text-[#008751] hover:underline text-sm font-medium flex items-center gap-1">
                        Learn More <span className="transform -rotate-45">➜</span>
                    </button>
                </div>
                <button
                    onClick={handleAddProgram}
                    data-testid="add-program-button"
                    className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <Plus size={20} /> Add Service Program
                </button>
            </div>

            {showBanner && (
                <div className="relative mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-[#0B3B32] to-[#115E50] text-white p-8 flex items-center shadow-md">
                    <button
                        onClick={() => setShowBanner(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <div className="z-10 relative max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Preventative Maintenance for Transportation</h2>
                        <ul className="space-y-2 text-sm text-white/90">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Keep PMs on schedule w/ proactive maintenance alerts
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Identify issues before they become major breakdowns
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Prevent costly vehicle downtime
                            </li>
                        </ul>
                    </div>
                    {/* Abstract Background Shapes - Simplified representation */}
                    <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 bg-[url('https://source.unsplash.com/random/800x200/?trucks')] bg-cover bg-center mix-blend-overlay"></div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        data-testid="search-input"
                        className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </button>
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </button>
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        OEM Service Program <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                    </button>
                    <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter size={14} /> Filters
                    </button>
                </div>
                <div className="flex-1 text-right text-sm text-gray-500">
                    1 - 1 of 1
                </div>
                <div className="flex gap-1">
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-700 bg-white ml-2"><MoreHorizontal size={16} /></button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                                Service Program <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-gray-900"></div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Vehicles</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Schedules</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Primary Meter</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Secondary Meter</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Statistiques */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded">
                                        <Wrench className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Programmes</p>
                                        <p className="text-xl font-bold text-gray-900">{totalPrograms}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Programmes Actifs</p>
                                        <p className="text-xl font-bold text-gray-900">{activePrograms}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Échéances Proches</p>
                                        <p className="text-xl font-bold text-gray-900">{upcomingDuePrograms}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded">
                                        <ChevronRight className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Véhicules Total</p>
                                        <p className="text-xl font-bold text-gray-900">{totalVehiclesInPrograms}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <p className="text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {programs.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Wrench className="w-12 h-12 text-gray-400" />
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun programme de service</h3>
                                            <p className="text-gray-600 mb-4">Commencez par créer votre premier programme de maintenance.</p>
                                            <button
                                                onClick={handleCreateProgram}
                                                className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                                            >
                                                <Plus size={20} /> Créer un programme
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            programs.map((program) => (
                                <tr
                                    key={program.id}
                                    data-testid={`program-row-${program.id}`}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleProgramClick(program.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[#008751] text-white text-xs font-bold px-2 py-1 rounded">
                                                        {program.name.substring(0, 3).toUpperCase()}
                                                    </span>
                                                    {getStatusBadge(program)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 mt-1">{program.name}</span>
                                                {program.description && (
                                                    <span className="text-xs text-gray-500 mt-1">{program.description}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium hover:underline">
                                        {program.vehicleCount || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium hover:underline">
                                        {program.taskCount || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {program.frequency || 'Non défini'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {program.nextDue ? (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(program.nextDue)}
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}

                        {/* Indicateur de chargement */}
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                                        <span className="text-gray-600">Chargement des programmes...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {/* Empty rows to simulate full table look */}
                        {[...Array(5)].map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="px-6 py-8"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
