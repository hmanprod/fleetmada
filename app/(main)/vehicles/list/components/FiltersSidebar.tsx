"use client";

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FilterCard, type FilterCriterion } from './FilterCard';

interface FiltersSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterCriterion[]) => void;
    initialFilters?: FilterCriterion[];
}

const AVAILABLE_FILTERS = [
    {
        field: 'status', label: 'Vehicle Status', type: 'enum', options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'MAINTENANCE', label: 'In Shop' },
            { value: 'DISPOSED', label: 'Out of Service' },
        ]
    },
    { field: 'type', label: 'Vehicle Type', type: 'text' },
    { field: 'group', label: 'Vehicle Group', type: 'text' },
    { field: 'operator', label: 'Operator', type: 'text' },
    { field: 'purchaseVendor', label: 'Vehicle Acquisition Vendor', type: 'text' },
    { field: 'make', label: 'Make', type: 'text' },
    { field: 'model', label: 'Model', type: 'text' },
    { field: 'year', label: 'Year', type: 'text' },
    {
        field: 'ownership', label: 'Ownership', type: 'enum', options: [
            { value: 'Owned', label: 'Owned' },
            { value: 'Leased', label: 'Leased' },
            { value: 'Rented', label: 'Rented' },
            { value: 'Customer', label: 'Customer' },
        ]
    },
];

const POPULAR_FILTERS = [
    { field: 'status', label: 'Vehicle Status' },
    { field: 'group', label: 'Vehicle Group' },
];

export function FiltersSidebar({ isOpen, onClose, onApply, initialFilters = [] }: FiltersSidebarProps) {
    const [activeFilters, setActiveFilters] = useState<FilterCriterion[]>(initialFilters);

    // Sync state when initialFilters changes or when sidebar opens
    React.useEffect(() => {
        if (isOpen) {
            setActiveFilters(initialFilters);
        }
    }, [isOpen, initialFilters]);

    const addFilter = (fieldKey: string) => {
        const filterDef = AVAILABLE_FILTERS.find(f => f.field === fieldKey);
        if (!filterDef) return;

        const newFilter: FilterCriterion = {
            id: Math.random().toString(36).substr(2, 9),
            field: filterDef.field,
            label: filterDef.label,
            operator: 'is',
            value: filterDef.type === 'enum' ? [] : '',
        };

        setActiveFilters([...activeFilters, newFilter]);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <X className="cursor-pointer" size={24} onClick={onClose} /> Filters
                    </h2>
                </div>
                {activeFilters.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {activeFilters.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-6">No filters applied.</p>
                        <button
                            onClick={() => addFilter('status')}
                            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-6 rounded-md flex items-center gap-2 mx-auto transition-all shadow-sm"
                        >
                            <Plus size={20} /> Add Filter
                        </button>

                        <div className="mt-12 text-left">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Popular Filters</h3>
                            <div className="space-y-3">
                                {POPULAR_FILTERS.map((f) => (
                                    <button
                                        key={f.field}
                                        onClick={() => addFilter(f.field)}
                                        className="block text-[#008751] hover:underline text-sm font-medium"
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {activeFilters.map((criterion) => (
                            <FilterCard
                                key={criterion.id}
                                criterion={criterion}
                                onRemove={removeFilter}
                                onUpdate={updateFilter}
                                options={AVAILABLE_FILTERS.find(f => f.field === criterion.field)?.options}
                            />
                        ))}

                        <button
                            onClick={() => addFilter('status')}
                            className="text-[#008751] hover:text-[#007043] font-bold py-2 flex items-center gap-2 transition-colors mt-4"
                        >
                            <Plus size={20} /> Add Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleApply}
                    className="w-full bg-[#008751] hover:bg-[#007043] text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}
