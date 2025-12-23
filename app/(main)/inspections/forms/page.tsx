'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, MoreHorizontal, FileText,
    Settings, AlertCircle, ChevronRight, LayoutGrid,
    CheckCircle2, XCircle, Copy, Trash2, Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';

export default function InspectionFormsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const {
        templates,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        fetchTemplates,
        deleteTemplate,
        duplicateTemplate,
        toggleTemplateStatus,
        clearError
    } = useInspectionTemplates();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = () => {
        router.push('/inspections/forms/create');
    };

    const handleEdit = (id: string) => {
        router.push(`/inspections/forms/${id}/edit`);
    };

    const handleDuplicate = async (id: string, name: string) => {
        try {
            await duplicateTemplate(id, `${name} (Copie)`);
        } catch (err) {
            console.error('Failed to duplicate template:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
            try {
                await deleteTemplate(id);
            } catch (err) {
                console.error('Failed to delete template:', err);
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleTemplateStatus(id, !currentStatus);
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    if (loading && templates.length === 0) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751] mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Chargement des formulaires...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1800px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Formulaires d'Inspection</h1>
                    <p className="text-gray-500 mt-1">Gérez vos formulaires et critères de vérification</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                    <Plus size={20} /> Nouveau Formulaire
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                    <div className="flex-1">
                        <p className="text-red-800 font-semibold">Une erreur est survenue</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un formulaire par nom ou catégorie..."
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                        <Filter size={16} /> Catégories
                    </button>
                    <button className="flex-1 md:flex-none bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                        <LayoutGrid size={16} /> Vue
                    </button>
                </div>
            </div>

            {/* Grid of Templates */}
            {templates.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun formulaire trouvé</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Commencez par créer votre premier formulaire d'inspection pour standardiser vos vérifications.</p>
                    <button
                        onClick={handleCreate}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <Plus size={20} /> Créer le premier formulaire
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#008751]/30 transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${template.category === 'Sécurité' ? 'bg-orange-100 text-orange-700' :
                                        template.category === 'Mécanique' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {template.category}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDuplicate(template.id, template.name)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Dupliquer"><Copy size={16} /></button>
                                        <button onClick={() => handleDelete(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{template.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{template.description || 'Aucune description fournie.'}</p>

                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <LayoutGrid size={14} className="text-[#008751]" />
                                        <span>{template._count?.items || 0} éléments</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ClipboardCheck size={14} className="text-[#008751]" />
                                        <span>{template._count?.inspections || 0} utilisations</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={() => handleToggleStatus(template.id, template.isActive)}
                                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${template.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {template.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    {template.isActive ? 'Actif' : 'Inactif'}
                                </button>

                                <button
                                    onClick={() => handleEdit(template.id)}
                                    className="p-2 text-[#008751] hover:bg-[#008751]/10 rounded-lg transition-colors border border-transparent hover:border-[#008751]/20"
                                >
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination (Summary) */}
            {pagination && (
                <div className="mt-8 flex justify-between items-center text-sm font-medium text-gray-500 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p>
                        Affichage de <span className="text-gray-900 font-bold">{templates.length}</span> formulaires sur <span className="text-gray-900 font-bold">{pagination.totalCount}</span>
                    </p>
                    <div className="flex gap-2">
                        <button disabled={!pagination.hasPrev} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronRight className="rotate-180" size={16} /></button>
                        <button disabled={!pagination.hasNext} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple icons not provided by lucide-react but used in mockups
function ClipboardCheck({ size = 16, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <path d="m9 14 2 2 4-4"></path>
        </svg>
    );
}
