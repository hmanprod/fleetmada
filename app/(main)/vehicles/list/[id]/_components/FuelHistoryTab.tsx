import React from 'react';
import { type Vehicle } from '@/lib/services/vehicles-api';
import { Search, Filter, MoreHorizontal, Fuel } from 'lucide-react';

interface FuelHistoryTabProps {
    vehicle: Vehicle;
}

export const FuelHistoryTab: React.FC<FuelHistoryTabProps> = ({ vehicle }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-md">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Fuel History"
                        className="bg-transparent border-none focus:ring-0 text-sm w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-center py-20">
                <Fuel size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No fuel entries</h3>
                <p className="text-gray-500">Start tracking fuel consumption for this vehicle.</p>
            </div>
        </div>
    );
};
