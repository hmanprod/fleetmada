import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Package, ChevronDown, Check, Plus } from 'lucide-react';
import { type Part } from '@/lib/services/parts-api';

interface PartSelectProps {
    parts: Part[];
    selectedPartId?: string;
    onSelect: (partId: string, partName: string, partCost?: number) => void;
    className?: string;
    loading?: boolean;
    placeholder?: string;
}

export function PartSelect({
    parts,
    selectedPartId,
    onSelect,
    className,
    loading,
    placeholder = "Rechercher des pièces..."
}: PartSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedPart = useMemo(() =>
        parts.find(p => p.id === selectedPartId),
        [parts, selectedPartId]
    );

    const filteredParts = useMemo(() => {
        if (!searchTerm) return parts;
        const term = searchTerm.toLowerCase();
        return parts.filter(p =>
            (p.number && p.number.toLowerCase().includes(term)) ||
            (p.description && p.description.toLowerCase().includes(term))
        );
    }, [parts, searchTerm]);

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
                className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer bg-white hover:border-gray-400 focus-within:ring-1 focus-within:ring-[#008751] focus-within:border-[#008751] h-[42px] transition-all shadow-sm"
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <Search size={18} className="text-gray-400 shrink-0" />
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#008751] rounded-full animate-spin"></div>
                            <span className="text-gray-400 text-xs">Chargement...</span>
                        </div>
                    ) : selectedPart ? (
                        <span className="truncate text-gray-900 font-medium">
                            {selectedPart.number} - {selectedPart.description}
                        </span>
                    ) : (
                        <span className="text-gray-400 font-medium">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded shadow-lg overflow-hidden flex flex-col max-h-64 animate-fade-in">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
                                placeholder="Rechercher une pièce..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredParts.length > 0 ? (
                            filteredParts.map(part => (
                                <div
                                    key={part.id}
                                    onClick={() => {
                                        onSelect(part.id, `${part.number} - ${part.description}`, part.cost);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 ${selectedPartId === part.id ? 'bg-green-50' : ''}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                            <Package size={14} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium text-gray-900 truncate">
                                                {part.number} - {part.description}
                                            </span>
                                            <span className="text-[11px] text-gray-500 truncate">
                                                Stock: {part.quantity} {part.measurementUnit} | Prix: {part.cost?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                            </span>
                                        </div>
                                    </div>
                                    {selectedPartId === part.id && <Check size={14} className="text-[#008751] shrink-0" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                Aucune pièce trouvée pour "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
