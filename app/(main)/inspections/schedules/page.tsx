'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Calendar, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInspections from '@/lib/hooks/useInspections';
import type { InspectionFilters } from '@/lib/services/inspections-api';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { FilterCriterion } from '../components/filters/FilterCard';
import { INSPECTION_SCHEDULE_FIELDS } from '../components/filters/filter-definitions';

export default function InspectionSchedulesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

    const {
        inspections,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        fetchInspections,
        clearError
    } = useInspections();

    useEffect(() => {
        // Initial fetch for SCHEDULED inspections
        fetchInspections({
            status: 'SCHEDULED',
            page: 1,
            limit: 20,
            sortBy: 'scheduledDate',
            sortOrder: 'asc'
        });
    }, []);

    const handleAdd = () => {
        router.push('/inspections/history/create');
    };

    const handleRowClick = (id: string) => {
        router.push(`/inspections/history/${id}`);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const newFilters = { ...filters, search: query || undefined, page: 1, status: 'SCHEDULED' as any };
        setFilters(newFilters);
        fetchInspections(newFilters);
    };

    const handleApplyFilters = (criteria: FilterCriterion[]) => {
        setActiveCriteria(criteria);
        setIsFiltersOpen(false);

        const newFilters: any = {
            page: 1,
            limit: 20,
            status: 'SCHEDULED',
            sortBy: 'scheduledDate',
            sortOrder: 'asc'
        };
        if (searchQuery) newFilters.search = searchQuery;

        criteria.forEach(c => {
            // Mapping
            if (c.field === 'vehicleId') newFilters.vehicleId = c.value;
            if (c.field === 'inspectionTemplateId') newFilters.inspectionTemplateId = c.value;
        });

        fetchInspections(newFilters);
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle loading state
    if (loading && inspections.length === 0) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Chargement des planifications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1800px] mx-auto relative">
            <FiltersSidebar
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={activeCriteria}
                availableFields={INSPECTION_SCHEDULE_FIELDS}
            />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Calendrier des Inspections</h1>
                    <p className="text-gray-500 mt-1">Gérez les inspections à venir et leur planification</p>
                </div>
                <div className="flex gap-2">
                    <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button
                        onClick={handleAdd}
                        data-testid="planifier-inspection-button"
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Planifier une Inspection
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <div className="text-red-700">{error}</div>
                    <button
                        onClick={clearError}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        data-testid="inspection-search-input"
                        className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setIsFiltersOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
                >
                    <Filter size={16} /> Filtres
                    {activeCriteria.length > 0 && (
                        <span className="bg-[#008751] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {activeCriteria.length}
                        </span>
                    )}
                </button>

                <div className="flex-1 text-right text-sm text-gray-500">
                    {pagination ? `${pagination.page * pagination.limit - pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.totalCount)} sur ${pagination.totalCount}` : '0'}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {inspections.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune inspection programmée</h3>
                        <p className="text-gray-500 mb-6">Planifiez votre première inspection pour voir apparaître les éléments ici.</p>
                        <button
                            onClick={handleAdd}
                            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
                        >
                            <Plus size={20} /> Planifier
                        </button>
                    </div>
                ) : (
                    inspections
                        .map(inspection => (
                            <div
                                key={inspection.id}
                                data-testid="inspection-row"
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center"
                                onClick={() => handleRowClick(inspection.id)}
                            >
                                {/* Date Box */}
                                <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg p-3 min-w-[100px] border border-blue-100">
                                    <Calendar size={20} className="mb-1 hidden md:block" />
                                    <span className="font-bold text-lg md:text-xl">
                                        {inspection.scheduledDate ? new Date(inspection.scheduledDate).getDate() : '--'}
                                    </span>
                                    <span className="text-xs uppercase font-bold">
                                        {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString('fr-FR', { month: 'short' }) : '--'}
                                    </span>
                                    <span className="text-xs ml-2 md:ml-0">
                                        {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${inspection.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                            inspection.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                                inspection.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                                    inspection.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {inspection.status === 'SCHEDULED' ? 'PROGRAMMÉE' :
                                                inspection.status === 'DRAFT' ? 'BROUILLON' :
                                                    inspection.status === 'IN_PROGRESS' ? 'EN COURS' :
                                                        inspection.status === 'COMPLETED' ? 'TERMINEE' :
                                                            inspection.status}
                                        </span>
                                        <span className="text-gray-500 text-xs">• {inspection.inspectionTemplate?.name || 'Formulaire inconnu'}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{inspection.title}</h3>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-900">{inspection.vehicle?.name || 'N/A'}</span>
                                            <span className="bg-gray-100 px-1.5 rounded text-xs">{inspection.vehicle?.vin || 'VIN inconnu'}</span>
                                        </div>
                                        {inspection.inspectorName && (
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} />
                                                <span>{inspection.inspectorName}</span>
                                            </div>
                                        )}
                                        {inspection.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} />
                                                <span>{inspection.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Action */}
                                <div className="hidden md:flex items-center text-gray-400">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        ))
                )}
            </div>

            {/* Pagination Simple */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        disabled={!pagination.hasPrev}
                        onClick={() => {
                            const newFilters = { ...filters, page: (pagination.page || 1) - 1 };
                            setFilters(newFilters);
                            fetchInspections(newFilters);
                        }}
                    >
                        Précédent
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        disabled={!pagination.hasNext}
                        onClick={() => {
                            const newFilters = { ...filters, page: (pagination.page || 1) + 1 };
                            setFilters(newFilters);
                            fetchInspections(newFilters);
                        }}
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
