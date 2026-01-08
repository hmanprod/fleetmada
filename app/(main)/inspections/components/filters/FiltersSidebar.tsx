"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, ChevronDown, Trash2 } from 'lucide-react';
import { FilterCard, type FilterCriterion } from './FilterCard';
import { ALL_FILTER_FIELDS, type FilterField, type FilterCategory } from './filter-definitions';

interface FiltersSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterCriterion[]) => void;
    initialFilters?: FilterCriterion[];
    availableFields?: FilterField[];
}

export function FiltersSidebar({
    isOpen,
    onClose,
    onApply,
    initialFilters = [],
    availableFields = ALL_FILTER_FIELDS
}: FiltersSidebarProps) {
    const [activeFilters, setActiveFilters] = useState<FilterCriterion[]>(initialFilters);
    const [isSelectingField, setIsSelectingField] = useState(false);
    const [fieldSearchTerm, setFieldSearchTerm] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    // Sync state when initialFilters changes or when sidebar opens
    useEffect(() => {
        if (isOpen) {
            setActiveFilters(initialFilters);
            setIsSelectingField(false);
            setFieldSearchTerm('');
        }
    }, [isOpen, initialFilters]);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsSelectingField(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addFilter = (field: FilterField) => {
        const newFilter: FilterCriterion = {
            id: Math.random().toString(36).substr(2, 9),
            field: field.id,
            label: field.label,
            operator: field.type === 'enum' ? 'is' : (field.type === 'number' || field.type === 'date' ? 'is' : 'contains'),
            value: field.type === 'enum' ? [] : '',
        };

        setActiveFilters([...activeFilters, newFilter]);
        setIsSelectingField(false);
        setFieldSearchTerm('');
    };

    const removeFilter = (id: string) => {
        setActiveFilters(activeFilters.filter(f => f.id !== id));
    };

    const updateFilter = (id: string, updates: Partial<FilterCriterion>) => {
        setActiveFilters(activeFilters.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const clearAll = () => {
        setActiveFilters([]);
    };

    const handleApply = () => {
        onApply(activeFilters);
    };

    const filteredFields = availableFields.filter(f =>
        f.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(fieldSearchTerm.toLowerCase())
    );

    const groupedFields = filteredFields.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {} as Record<FilterCategory, FilterField[]>);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <X className="cursor-pointer hover:text-gray-600" size={24} onClick={onClose} /> Filtres
                    </h2>
                </div>
                {activeFilters.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
                    >
                        Tout effacer
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                    {activeFilters.map((criterion) => (
                        <FilterCard
                            key={criterion.id}
                            criterion={criterion}
                            onRemove={removeFilter}
                            onUpdate={updateFilter}
                            options={availableFields.find(f => f.id === criterion.field)?.options}
                        />
                    ))}
                </div>

                <div className="relative mt-6" ref={menuRef}>
                    <button
                        onClick={() => setIsSelectingField(!isSelectingField)}
                        className="text-[#008751] hover:text-[#007043] font-bold py-2 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} /> Ajouter un filtre
                    </button>

                    {isSelectingField && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col max-h-[400px] animate-in fade-in zoom-in duration-200">
                            <div className="p-4 border-b border-gray-100 bg-white">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-900">Nouveau Filtre</span>
                                    <button onClick={() => setIsSelectingField(false)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Sélectionner un champ"
                                        className="w-full pl-10 pr-10 py-2 text-sm border border-[#008751] rounded-md focus:ring-1 focus:ring-[#008751] outline-none"
                                        value={fieldSearchTerm}
                                        onChange={(e) => setFieldSearchTerm(e.target.value)}
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                {Object.entries(groupedFields).map(([category, fields]) => (
                                    <div key={category} className="mb-4 last:mb-0">
                                        <h3 className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white">
                                            {category}
                                        </h3>
                                        <div className="mt-1 space-y-0.5">
                                            {fields.map((field) => (
                                                <button
                                                    key={field.id}
                                                    onClick={() => addFilter(field)}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex justify-between items-center group"
                                                >
                                                    <span>{field.label}</span>
                                                    <Plus size={14} className="text-gray-300 group-hover:text-[#008751] opacity-0 group-hover:opacity-100 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(groupedFields).length === 0 && (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        Aucun champ trouvé
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {activeFilters.length === 0 && !isSelectingField && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Aucun filtre appliqué.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleApply}
                    className="w-full bg-[#008751] hover:bg-[#007043] text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                    Appliquer les filtres
                </button>
            </div>
        </div>
    );
}
