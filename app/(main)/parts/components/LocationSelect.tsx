'use client';

import React from 'react';
import { MapPin, Home, Trash2 } from 'lucide-react';
import { Place } from '@/types/geolocation';
import { PlaceSelect } from './PlaceSelect';

interface PartLocationEntry {
    placeId: string;
    placeName: string;
    aisle?: string;
    row?: string;
    bin?: string;
    quantity: number;
}

interface LocationSelectProps {
    locations: PartLocationEntry[];
    onChange: (locations: PartLocationEntry[]) => void;
    className?: string;
}

export function LocationSelect({
    locations,
    onChange,
    className
}: LocationSelectProps) {
    const handleAddLocation = (place: Place) => {
        if (locations.some(l => l.placeId === place.id)) {
            return;
        }

        const newEntry: PartLocationEntry = {
            placeId: place.id,
            placeName: place.name,
            quantity: 0
        };

        onChange([...locations, newEntry]);
    };

    const handleRemoveLocation = (index: number) => {
        const newLocations = [...locations];
        newLocations.splice(index, 1);
        onChange(newLocations);
    };

    const handleUpdateLocation = (index: number, field: keyof PartLocationEntry, value: any) => {
        const newLocations = [...locations];
        newLocations[index] = { ...newLocations[index], [field]: value };
        onChange(newLocations);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="relative">
                <PlaceSelect
                    onSelect={handleAddLocation}
                    excludeIds={locations.map(l => l.placeId)}
                    placeholder="Ajouter un emplacement de stockage..."
                />
            </div>

            {locations.length > 0 ? (
                <div className="space-y-3">
                    {locations.map((loc, index) => (
                        <div key={loc.placeId} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center text-gray-400 border border-gray-100">
                                        <Home size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{loc.placeName}</h4>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLocation(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Allée</label>
                                    <input
                                        type="text"
                                        value={loc.aisle || ''}
                                        onChange={(e) => handleUpdateLocation(index, 'aisle', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none text-sm font-medium"
                                        placeholder="Ex: A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Étagère</label>
                                    <input
                                        type="text"
                                        value={loc.row || ''}
                                        onChange={(e) => handleUpdateLocation(index, 'row', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none text-sm font-medium"
                                        placeholder="Ex: 4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Casier</label>
                                    <input
                                        type="text"
                                        value={loc.bin || ''}
                                        onChange={(e) => handleUpdateLocation(index, 'bin', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none text-sm font-medium"
                                        placeholder="Ex: 102"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Quantité initiale</label>
                                    <input
                                        type="number"
                                        value={loc.quantity}
                                        onChange={(e) => handleUpdateLocation(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none text-sm font-bold text-[#008751]"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">
                    <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500 text-sm font-medium">Aucun emplacement lié à cette pièce</p>
                </div>
            )}
        </div>
    );
}
