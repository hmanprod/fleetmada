'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Factory, ChevronDown, Check, Plus, Loader2, X } from 'lucide-react';
import { partsAPI, Manufacturer } from '@/lib/services/parts-api';

interface ManufacturerSelectProps {
    selectedManufacturerId?: string;
    onSelect: (manufacturerName: string) => void;
    className?: string;
    placeholder?: string;
}

export function ManufacturerSelect({
    selectedManufacturerId,
    onSelect,
    className,
    placeholder = "Sélectionner un fabricant..."
}: ManufacturerSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchManufacturers = async () => {
        setLoading(true);
        try {
            const response = await partsAPI.getManufacturers();
            if (response.success && response.data) {
                // S'assurer que response.data est bien un tableau, sinon extraire si c'est dans une propriété
                const manufacturerData = Array.isArray(response.data)
                    ? response.data
                    : (response.data as any).manufacturers || [];
                setManufacturers(manufacturerData);
            } else {
                setManufacturers([]);
            }
        } catch (error) {
            console.error("Failed to fetch manufacturers:", error);
            setManufacturers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchManufacturers();
        }
    }, [isOpen]);

    const filteredManufacturers = useMemo(() => {
        if (!Array.isArray(manufacturers)) return [];
        if (!searchTerm) return manufacturers;
        const term = searchTerm.toLowerCase();
        return manufacturers.filter(m =>
            m.name && m.name.toLowerCase().includes(term)
        );
    }, [manufacturers, searchTerm]);

    const selectedManufacturer = useMemo(() => {
        if (!Array.isArray(manufacturers)) return null;
        return manufacturers.find(m => m.id === selectedManufacturerId || m.name === selectedManufacturerId);
    }, [manufacturers, selectedManufacturerId]);

    const handleCreateNew = async () => {
        if (!searchTerm) return;
        setIsCreating(true);
        try {
            const response = await partsAPI.createManufacturer({ name: searchTerm });
            if (response.success) {
                setManufacturers(prev => [...prev, response.data]);
                onSelect(response.data.name);
                setSearchTerm('');
                setIsOpen(false);
            }
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer bg-white hover:border-gray-400 focus-within:ring-1 focus-within:ring-[#008751] focus-within:border-[#008751] transition-all shadow-sm"
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <Factory size={18} className="text-gray-400 shrink-0" />
                    {selectedManufacturer ? (
                        <span className="truncate text-gray-900 font-medium">
                            {selectedManufacturer.name}
                        </span>
                    ) : (
                        <span className="text-gray-400 font-medium">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden flex flex-col max-h-80 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-8 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none transition-all"
                                placeholder="Rechercher ou ajouter un fabricant..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="animate-spin text-[#008751] mx-auto" size={24} />
                            </div>
                        ) : (
                            <>
                                {filteredManufacturers.length > 0 ? (
                                    filteredManufacturers.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(m.name);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between group transition-colors ${selectedManufacturerId === m.id || selectedManufacturerId === m.name ? 'bg-green-50' : ''}`}
                                        >
                                            <span className="font-bold text-gray-900 group-hover:text-[#008751] transition-colors">{m.name}</span>
                                            {(selectedManufacturerId === m.id || selectedManufacturerId === m.name) && <Check size={16} className="text-[#008751]" />}
                                        </div>
                                    ))
                                ) : searchTerm && (
                                    <div className="p-4 text-center">
                                        <p className="text-sm text-gray-500 mb-3 font-medium">Aucun fabricant trouvé pour "{searchTerm}"</p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCreateNew();
                                            }}
                                            disabled={isCreating}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#008751] text-white rounded-xl font-bold hover:bg-[#007043] transition-all shadow-lg shadow-green-100"
                                        >
                                            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                            Ajouter "{searchTerm}"
                                        </button>
                                    </div>
                                )}
                                {!searchTerm && manufacturers.length === 0 && (
                                    <div className="p-8 text-center text-gray-400">
                                        <Factory size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-xs font-medium">Aucun fabricant enregistré</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
