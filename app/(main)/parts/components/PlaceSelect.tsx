'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Check, Loader2 } from 'lucide-react';
import { usePlaces } from '@/lib/hooks/usePlaces';
import { Place } from '@/types/geolocation';

interface PlaceSelectProps {
    onSelect: (place: Place) => void;
    className?: string;
    placeholder?: string;
    excludeIds?: string[];
}

export function PlaceSelect({
    onSelect,
    className,
    placeholder = "Sélectionner un site opérationnel...",
    excludeIds = []
}: PlaceSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { places, loading } = usePlaces({ limit: 100 });
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredPlaces = useMemo(() => {
        let result = places;
        if (excludeIds.length > 0) {
            result = result.filter(p => !excludeIds.includes(p.id));
        }
        if (!searchTerm) return result;
        const term = searchTerm.toLowerCase();
        return result.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.address?.toLowerCase().includes(term)
        );
    }, [places, searchTerm, excludeIds]);

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
                    <MapPin size={18} className="text-gray-400 shrink-0" />
                    <span className="truncate text-gray-500 font-medium">{placeholder}</span>
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
                                placeholder="Rechercher un site..."
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
                                {filteredPlaces.length > 0 ? (
                                    filteredPlaces.map(place => (
                                        <div
                                            key={place.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(place);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className="px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex flex-col border-b border-gray-50 last:border-0 group transition-colors"
                                        >
                                            <span className="font-medium text-gray-900 group-hover:text-[#008751] transition-colors">{place.name}</span>
                                            {place.address && <span className="text-[10px] text-gray-400 truncate">{place.address}</span>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 italic text-sm">
                                        Aucun site trouvé
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
