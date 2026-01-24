'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Grid, ChevronDown, Check, Loader2 } from 'lucide-react';
import { partsAPI, Category } from '@/lib/services/parts-api';

interface CategorySelectProps {
    selectedCategory?: string;
    onSelect: (categoryName: string) => void;
    className?: string;
    placeholder?: string;
}

export function CategorySelect({
    selectedCategory,
    onSelect,
    className,
    placeholder = "Sélectionner une catégorie..."
}: CategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await partsAPI.getCategories();
            if (response.success && response.data) {
                // S'assurer que response.data est bien un tableau, sinon extraire si c'est dans une propriété
                const categoryData = Array.isArray(response.data)
                    ? response.data
                    : (response.data as any).categories || [];
                setCategories(categoryData);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const filteredCategories = useMemo(() => {
        if (!Array.isArray(categories)) return [];
        if (!searchTerm) return categories;
        const term = searchTerm.toLowerCase();
        return categories.filter(c =>
            c.name && c.name.toLowerCase().includes(term)
        );
    }, [categories, searchTerm]);

    const currentCategory = useMemo(() => {
        if (!Array.isArray(categories)) return null;
        return categories.find(c => c.name === selectedCategory);
    }, [categories, selectedCategory]);

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
                    <Grid size={18} className="text-gray-400 shrink-0" />
                    {currentCategory ? (
                        <span className="truncate text-gray-900 font-medium">
                            {currentCategory.name}
                        </span>
                    ) : (
                        <span className="truncate text-gray-900 font-medium">
                            {selectedCategory || <span className="text-gray-400 font-medium">{placeholder}</span>}
                        </span>
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
                                placeholder="Rechercher une catégorie..."
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
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(c.name);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between group transition-colors ${selectedCategory === c.name ? 'bg-green-50' : ''}`}
                                        >
                                            <span className="font-bold text-gray-900 group-hover:text-[#008751] transition-colors">{c.name}</span>
                                            {selectedCategory === c.name && <Check size={16} className="text-[#008751]" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-500">
                                        <p className="text-sm font-medium">Aucune catégorie trouvée</p>
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
