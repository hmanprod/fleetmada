'use client';

import React, { useState, useEffect } from 'react';
import { X, FileJson, Search, Loader2, Plus, Info } from 'lucide-react';
import inspectionsAPI, { JsonTemplateMetadata } from '@/lib/services/inspections-api';

interface TemplateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (filename: string) => Promise<void>;
}

export function TemplateSelectionModal({ isOpen, onClose, onSelect }: TemplateSelectionModalProps) {
    const [templates, setTemplates] = useState<JsonTemplateMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selecting, setSelecting] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await inspectionsAPI.getJsonTemplates();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (filename: string) => {
        setSelecting(filename);
        try {
            await onSelect(filename);
            onClose();
        } catch (err) {
            console.error('Failed to select template:', err);
        } finally {
            setSelecting(null);
        }
    };

    if (!isOpen) return null;

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">Copier depuis un Template</h2>
                        <p className="text-sm text-gray-500 mt-1">Sélectionnez un modèle standard pour commencer rapidement</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un template..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="font-medium">Chargement des modèles...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={fetchTemplates}
                                className="mt-4 text-[#008751] font-bold underline underline-offset-4"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FileJson size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Aucun modèle trouvé</p>
                        </div>
                    ) : (
                        filteredTemplates.map((template) => (
                            <div
                                key={template.filename}
                                className="group p-4 border border-gray-100 rounded-xl hover:border-[#008751] hover:bg-emerald-50/30 transition-all flex items-start gap-4 cursor-pointer"
                                onClick={() => handleSelect(template.filename)}
                            >
                                <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm group-hover:scale-110 group-hover:bg-emerald-50 group-hover:border-[#008751]/30 transition-all text-gray-400 group-hover:text-[#008751]">
                                    <FileJson size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 truncate">{template.title}</h3>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wider font-bold rounded-md whitespace-nowrap">
                                            {template.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                        {template.description || "Aucune description disponible pour ce modèle."}
                                    </p>
                                </div>
                                <button
                                    className="self-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-400 group-hover:text-white group-hover:bg-[#008751] group-hover:border-[#008751] transition-all disabled:opacity-50"
                                    disabled={selecting === template.filename}
                                >
                                    {selecting === template.filename ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <Plus size={20} />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                    <Info size={16} className="text-[#008751] flex-shrink-0" />
                    <p className="text-[11px] text-gray-500 leading-tight">
                        La copie d'un template créera un nouveau formulaire modifiable basé sur la structure sélectionnée.
                    </p>
                </div>
            </div>
        </div>
    );
}
