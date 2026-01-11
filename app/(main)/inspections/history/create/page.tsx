'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ClipboardList, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';

export default function NewInspectionSelectionPage() {
    const router = useRouter();
    const { templates, loading, fetchTemplates } = useInspectionTemplates();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectTemplate = (templateId: string) => {
        router.push(`/inspections/forms/${templateId}/start`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} /> Retour
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Planifier une Inspection</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">

                {/* Search Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Quel type d'inspection souhaitez-vous réaliser ?
                        </h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un formulaire (ex: Contrôle technique, Maintenance...)"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all text-gray-900 placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008751]"></div>
                        <p className="mt-4 text-gray-500 font-medium">Chargement des formulaires...</p>
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Aucun formulaire trouvé</h3>
                        <p className="text-gray-500 mt-1">Essayez de modifier votre recherche ou contactez l'administrateur.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
                            >
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${template.category ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <ClipboardList size={24} />
                                        </div>
                                        {template.category && (
                                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                                                {template.category}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#008751] transition-colors mb-2">
                                        {template.name}
                                    </h3>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                        {template.description || "Aucune description disponible"}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleSelectTemplate(template.id)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-lg transition-colors shadow-sm hover:shadow"
                                        >
                                            <Layout size={18} />
                                            Commencer une inspection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

