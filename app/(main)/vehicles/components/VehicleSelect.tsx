import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Car, ChevronDown } from 'lucide-react';
import { type Vehicle } from '../types';

interface VehicleSelectProps {
    vehicles: Vehicle[];
    selectedVehicleId?: string;
    onSelect: (vehicleId: string) => void;
    className?: string;
    loading?: boolean;
}

export function VehicleSelect({ vehicles, selectedVehicleId, onSelect, className, loading }: VehicleSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedVehicle = useMemo(() =>
        vehicles.find(v => v.id === selectedVehicleId),
        [vehicles, selectedVehicleId]
    );

    const filteredVehicles = useMemo(() => {
        if (!searchTerm) return vehicles;
        const term = searchTerm.toLowerCase();
        return vehicles.filter(v =>
            (v.name && v.name.toLowerCase().includes(term)) ||
            (v.vin && v.vin.toLowerCase().includes(term))
        );
    }, [vehicles, searchTerm]);

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
                className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer bg-white hover:border-gray-400 focus-within:ring-1 focus-within:ring-[#008751] focus-within:border-[#008751]"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#008751] rounded-full animate-spin"></div>
                        <span className="text-gray-400">Loading vehicles...</span>
                    </div>
                ) : selectedVehicle ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Car size={16} className="text-gray-400 shrink-0" />
                        <span className="truncate text-gray-900">{selectedVehicle.name} {selectedVehicle.vin ? `(${selectedVehicle.vin})` : ''}</span>
                    </div>
                ) : (
                    <span className="text-gray-500">Please select</span>
                )}
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
                                placeholder="Search vehicle name or VIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(vehicle => (
                                <div
                                    key={vehicle.id}
                                    onClick={() => {
                                        onSelect(vehicle.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex flex-col gap-0.5 border-b border-gray-50 last:border-0 ${selectedVehicleId === vehicle.id ? 'bg-green-50' : ''}`}
                                >
                                    <span className="font-medium text-gray-900">{vehicle.name}</span>
                                    {vehicle.vin && <span className="text-[11px] text-gray-500 font-mono tracking-tight">{vehicle.vin}</span>}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                No vehicles found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
