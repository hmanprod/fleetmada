'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, Plus, X, ChevronDown, Check, User, Truck, AlertTriangle, FileText, MapPin, Wrench, Droplets, Clipboard, Calendar } from 'lucide-react';

const CATEGORIES = [
  'Tout',
  'Véhicules',
  'Contacts',
  'Entrées d\'entretien',
  'Fournisseurs',
  'Pièces',
  'Problèmes',
  'Entrées de carburant',
  'Inspections',
  'Ordres de travail',
  'Rappels d\'entretien',
  'Renouvellements véhicules',
  'Renouvellements contacts',
  'Lieux',
  'Documents'
];

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  details?: string;
}

const MOCK_DATA: SearchResult[] = [
  { id: '1', type: 'Contacts', title: 'Allison Curtis', subtitle: 'acurtis@example.com · Georgia / Atlanta · Employé, Opérateur' },
  { id: '2', type: 'Renouvellements contacts', title: 'Allison Curtis', subtitle: 'Dû le 20 Fév 2026', details: 'Email: acurtis@example.com' },
  { id: '3', type: 'Renouvellements contacts', title: 'Allison Curtis', subtitle: 'Dû le 7 Avr 2026', details: 'Email: acurtis@example.com' },
  { id: '4', type: 'Véhicules', title: '2018 Ford F-150', subtitle: 'AC101 · Assigné à Allison Curtis' },
  { id: '5', type: 'Problèmes', title: 'Entretien des freins', subtitle: 'Signalé par Allison Curtis' },
  { id: '6', type: 'Entrées d\'entretien', title: 'Vidange d\'huile', subtitle: 'Fournisseur: Jiffy Lube · Coût: 120 $' },
  { id: '7', type: 'Pièces', title: 'Filtre à huile', subtitle: 'Pièce #12345' },
  { id: '8', type: 'Fournisseurs', title: 'AutoZone', subtitle: 'Atlanta, GA' },
  { id: '9', type: 'Entrées de carburant', title: 'Plein - AC101', subtitle: '12/12/2025 · 15.2 gal' },
];

const TopBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [filteredData, setFilteredData] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Basic search filtering logic
    if (!searchTerm) {
      setFilteredData([]);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const results = MOCK_DATA.filter(item => {
      // Category filter
      if (selectedCategory !== 'Tout' && item.type !== selectedCategory) {
        return false;
      }
      // Text match
      return item.title.toLowerCase().includes(lowerTerm) || 
             item.subtitle?.toLowerCase().includes(lowerTerm) || 
             item.details?.toLowerCase().includes(lowerTerm);
    });
    setFilteredData(results);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === '/' && !isFocused && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            event.preventDefault();
            inputRef.current?.focus();
        }
        if (event.key === 'Escape') {
            setIsFocused(false);
            setShowFilterMenu(false);
            inputRef.current?.blur();
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocused]);

  // Group results by type
  const groupedResults = filteredData.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim() || !text) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-blue-200 text-gray-900 rounded-[1px]">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        {/* Search Component */}
        <div ref={searchRef} className="relative w-full max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input 
              ref={inputRef}
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={selectedCategory === 'Tout' ? "Rechercher dans FleetMada" : `Rechercher dans ${selectedCategory}`}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b9a59] focus:border-transparent text-sm transition-shadow"
            />
            <div className="absolute right-2 flex items-center gap-1">
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                )}
                {/* Filter Trigger */}
                <div ref={filterRef} className="relative">
                    <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors ${showFilterMenu ? 'bg-gray-100 text-gray-800' : ''}`}
                    >
                        <ChevronDown size={16} />
                    </button>

                    {/* Filter Menu Dropdown */}
                    {showFilterMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 max-h-[80vh] overflow-y-auto">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setShowFilterMenu(false);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <span>{category}</span>
                                    {selectedCategory === category && (
                                        <Check size={16} className="text-[#008751]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {isFocused && searchTerm && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto z-40">
                {Object.keys(groupedResults).length > 0 ? (
                    <>
                        <div className="py-2">
                            {Object.entries(groupedResults).map(([type, results]) => (
                                <div key={type}>
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 border-t first:border-t-0">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{type.toUpperCase()}</h3>
                                    </div>
                                    <ul>
                                        {results.map(result => (
                                            <li key={result.id} className="px-4 py-3 hover:bg-[#f0fcf6] cursor-pointer border-b border-gray-50 last:border-0 group">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 group-hover:text-[#008751]">
                                                        <HighlightedText text={result.title} highlight={searchTerm} />
                                                    </span>
                                                    {result.subtitle && (
                                                        <span className="text-xs text-gray-500 mt-0.5">
                                                            <HighlightedText text={result.subtitle} highlight={searchTerm} />
                                                        </span>
                                                    )}
                                                    {result.details && (
                                                        <span className="text-xs text-gray-400 mt-0.5 block">
                                                            <HighlightedText text={result.details} highlight={searchTerm} />
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-1">
                            Utilisez <span className="border border-gray-300 rounded px-1 bg-white">↑</span> <span className="border border-gray-300 rounded px-1 bg-white">↓</span> pour naviguer, <span className="border border-gray-300 rounded px-1 bg-white font-mono">Entrée</span> pour sélectionner, <span className="border border-gray-300 rounded px-1 bg-white font-mono">Échap</span> pour fermer, et <span className="border border-gray-300 rounded px-1 bg-white font-mono">/</span> pour rechercher.
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Aucun résultat pour "{searchTerm}" dans {selectedCategory}.
                    </div>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:block px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
          Désactiver données démo
        </button>
        
        <button className="text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        
        <button className="text-gray-500 hover:text-gray-700">
          <HelpCircle size={20} />
        </button>

        <button className="text-gray-500 hover:text-gray-700">
          <Plus size={20} />
        </button>

        <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium text-sm cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500">
          HR
        </div>
      </div>
    </div>
  );
};

export default TopBar;