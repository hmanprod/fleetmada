'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Calendar, Download, FileText, Eye,
    ChevronDown, ChevronLeft, ChevronRight, Settings,
    MoreHorizontal, AlertCircle, CheckCircle, Clock,
    TrendingUp, BarChart3, User, MapPin, Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInspections from '@/lib/hooks/useInspections';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import type { InspectionFilters } from '@/lib/services/inspections-api';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { FilterCriterion } from '../components/filters/FilterCard';
import { INSPECTION_HISTORY_FIELDS } from '../components/filters/filter-definitions';

export default function InspectionHistoryPage() {
    const router = useRouter();

    // Hooks
    const {
        inspections,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        fetchInspections,
        getStatistics
    } = useInspections();
    const { vehicles } = useVehicles();
    const { templates } = useInspectionTemplates();

    // États locaux
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCompliance, setSelectedCompliance] = useState('');
    const [scoreRange, setScoreRange] = useState({ min: '', max: '' });

    // Advanced Filters State
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

    const [activeTab, setActiveTab] = useState<'all' | 'failed'>('all');

    // Mettre à jour les filtres combinés
    const applyAllFilters = (criteria: FilterCriterion[] = activeCriteria) => {
        const newFilters: InspectionFilters = {
            status: activeTab === 'failed' ? 'COMPLETED' : 'COMPLETED',
            page: 1,
            limit: 20,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        };

        if (searchQuery) newFilters.search = searchQuery;
        if (selectedVehicle) newFilters.vehicleId = selectedVehicle;
        if (selectedTemplate) newFilters.inspectionTemplateId = selectedTemplate;
        if (selectedStatus) newFilters.status = selectedStatus as any;

        // Apply advanced filters from criteria
        criteria.forEach(c => {
            // Map advanced filters to API params
            if (c.field === 'status' && !selectedStatus) {
                newFilters.status = (Array.isArray(c.value) ? c.value[0] : c.value) as any;
            }
            if (c.field === 'vehicleId' && !selectedVehicle) {
                newFilters.vehicleId = c.value as string;
            }
            if (c.field === 'inspectionTemplateId' && !selectedTemplate) {
                newFilters.inspectionTemplateId = c.value as string;
            }
            // For dates and scores, if API handles them:
            // if (c.field === 'scheduledDate') ...
        });

        fetchInspections(newFilters);
    };

    // Effect for Quick Filters & Tab changes
    useEffect(() => {
        applyAllFilters(activeCriteria);
    }, [searchQuery, selectedVehicle, selectedTemplate, selectedStatus, selectedCompliance, activeTab]);

    // Handle Advanced Filters Apply
    const handleApplyFilters = (criteria: FilterCriterion[]) => {
        setActiveCriteria(criteria);
        setIsFiltersOpen(false);
        applyAllFilters(criteria);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const handleScoreRangeChange = (field: 'min' | 'max', value: string) => {
        setScoreRange(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        // TODO: Implémenter l'export des données
        console.log('Export des données d\'historique');
    };

    const handleViewDetails = (id: string) => {
        router.push(`/inspections/history/${id}`);
    };

    const handleViewVehicle = (vehicleId: string) => {
        router.push(`/vehicles/list/${vehicleId}`);
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getComplianceColor = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return 'text-green-600 bg-green-50';
            case 'NON_COMPLIANT': return 'text-red-600 bg-red-50';
            case 'PENDING_REVIEW': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDateRange({ start: '', end: '' });
        setSelectedVehicle('');
        setSelectedTemplate('');
        setSelectedStatus('');
        setSelectedCompliance('');
        setScoreRange({ min: '', max: '' });
        setActiveCriteria([]);

        // Reset fetch to default
        const defaultFilters: InspectionFilters = {
            status: activeTab === 'failed' ? 'COMPLETED' : 'COMPLETED',
            page: 1,
            limit: 20
        };
        fetchInspections(defaultFilters);
    };

    // Statistiques
    const statistics = getStatistics();
    const completedInspections = inspections.filter(i => i.status === 'COMPLETED');
    const failedInspections = completedInspections.filter(i => i.complianceStatus === 'NON_COMPLIANT');

    if (loading) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Chargement de l'historique...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => fetchInspections()}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        Réessayer
                    </button>
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
                availableFields={INSPECTION_HISTORY_FIELDS}
            />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Historique des Inspections</h1>
                    <span className="text-sm text-gray-500">
                        {completedInspections.length} inspections complétées
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Download size={20} /> Exporter
                    </button>
                    <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50">
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={() => router.push('/inspections/history/create')}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <FileText size={20} /> Planifier Inspection
                    </button>
                </div>
            </div>

            {/* Onglets */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 border-b-2 font-medium text-sm ${activeTab === 'all'
                        ? 'border-[#008751] text-[#008751]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Toutes les Inspections ({completedInspections.length})
                </button>
                <button
                    onClick={() => setActiveTab('failed')}
                    className={`pb-3 border-b-2 font-medium text-sm ${activeTab === 'failed'
                        ? 'border-[#008751] text-[#008751]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Échecs de Conformité ({failedInspections.length})
                </button>
            </div>

            {/* Barre de filtres */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Recherche */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher par titre, véhicule, inspecteur..."
                                    data-testid="inspection-search-input"
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* Filtres rapides */}
                            <select
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                            >
                                <option value="">Tous les véhicules</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.name} - {vehicle.make} {vehicle.model}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                                data-testid="status-filter"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                <option value="DRAFT">Brouillon</option>
                                <option value="SCHEDULED">Programmé</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="COMPLETED">Terminé</option>
                                <option value="CANCELLED">Annulé</option>
                            </select>

                            <select
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                            >
                                <option value="">Tous les modèles</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                                value={selectedCompliance}
                                onChange={(e) => setSelectedCompliance(e.target.value)}
                            >
                                <option value="">Toutes conformités</option>
                                <option value="COMPLIANT">Conforme</option>
                                <option value="NON_COMPLIANT">Non-conforme</option>
                                <option value="PENDING_REVIEW">En attente</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setIsFiltersOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded border border-gray-300"
                        >
                            <Filter size={16} /> Filtres Avancés
                            {activeCriteria.length > 0 && (
                                <span className="bg-[#008751] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeCriteria.length}
                                </span>
                            )}
                        </button>

                        {(searchQuery || selectedVehicle || selectedTemplate || selectedCompliance || activeCriteria.length > 0) && (
                            <button
                                onClick={clearFilters}
                                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Effacer
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Véhicule</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Modèle</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Titre</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Inspecteur</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Date de Fin</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Durée</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Score</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Conformité</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Lieu</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {completedInspections.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <div className="h-12 w-12 rounded-full border-2 border-[#008751] flex items-center justify-center mb-4 text-[#008751]">
                                            <FileText size={24} />
                                        </div>
                                        <p className="mb-1">Aucun historique d'inspection trouvé</p>
                                        <p className="text-xs max-w-md mx-auto mb-6">
                                            {activeTab === 'failed'
                                                ? 'Aucune inspection avec des échecs de conformité trouvée.'
                                                : 'Commencez par créer et compléter votre première inspection.'}
                                        </p>
                                        <button
                                            onClick={() => router.push('/inspections/history/create')}
                                            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                                        >
                                            <FileText size={20} /> Créer une Inspection
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            completedInspections
                                .filter(inspection =>
                                    activeTab === 'failed'
                                        ? inspection.complianceStatus === 'NON_COMPLIANT'
                                        : true
                                )
                                .map(inspection => (
                                    <tr key={inspection.id} data-testid="inspection-row" className="hover:bg-gray-50">
                                        <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`https://source.unsplash.com/random/50x50/?truck&sig=${inspection.vehicle?.id}`}
                                                        className="w-full h-full object-cover"
                                                        alt="Vehicle"
                                                    />
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => handleViewVehicle(inspection.vehicleId)}
                                                        className="text-[#008751] font-medium hover:underline cursor-pointer text-sm"
                                                    >
                                                        {inspection.vehicle ? `${inspection.vehicle.make} ${inspection.vehicle.model}` : 'N/A'}
                                                    </button>
                                                    <div className="text-xs text-gray-500">{inspection.vehicle?.vin || 'No VIN'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">
                                            {inspection.inspectionTemplate?.name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewDetails(inspection.id)}
                                                className="text-gray-900 font-medium hover:underline cursor-pointer text-sm"
                                            >
                                                {inspection.title}
                                            </button>
                                            {inspection.description && (
                                                <div className="text-xs text-gray-500 mt-1">{inspection.description}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-900">{inspection.inspectorName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {inspection.completedAt ? formatDate(inspection.completedAt) : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {inspection.startedAt && inspection.completedAt ?
                                                `${Math.round((new Date(inspection.completedAt).getTime() - new Date(inspection.startedAt).getTime()) / (1000 * 60))} min`
                                                : '—'
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <BarChart3 size={14} className="text-gray-400" />
                                                <span className={`text-sm font-bold ${getScoreColor(inspection.overallScore || 0)}`}>
                                                    {inspection.overallScore ? `${inspection.overallScore}%` : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getComplianceColor(inspection.complianceStatus)}`}>
                                                {inspection.complianceStatus === 'COMPLIANT' ? 'Conforme' :
                                                    inspection.complianceStatus === 'NON_COMPLIANT' ? 'Non-conforme' : 'En attente'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-500">{inspection.location || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(inspection.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Voir les détails"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                                {/* <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal size={16} />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {pagination.page * pagination.limit - pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} sur {pagination.totalCount} résultats
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                disabled={!pagination.hasPrev}
                                onClick={() => {
                                    const newFilters = { ...filters, page: (pagination.page || 1) - 1 };
                                    setFilters(newFilters);
                                    fetchInspections(newFilters);
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {pagination.page} sur {pagination.totalPages}
                            </span>
                            <button
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                disabled={!pagination.hasNext}
                                onClick={() => {
                                    const newFilters = { ...filters, page: (pagination.page || 1) + 1 };
                                    setFilters(newFilters);
                                    fetchInspections(newFilters);
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Résumé des statistiques */}
            {completedInspections.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                <FileText size={16} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">{completedInspections.length}</div>
                                <div className="text-sm text-gray-500">Inspections complétées</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center">
                                <CheckCircle size={16} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">
                                    {completedInspections.filter(i => i.complianceStatus === 'COMPLIANT').length}
                                </div>
                                <div className="text-sm text-gray-500">Conformes</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center">
                                <AlertCircle size={16} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">
                                    {failedInspections.length}
                                </div>
                                <div className="text-sm text-gray-500">Non-conformes</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded flex items-center justify-center">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">
                                    {completedInspections.length > 0
                                        ? Math.round(completedInspections.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInspections.length)
                                        : 0}%
                                </div>
                                <div className="text-sm text-gray-500">Score moyen</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
