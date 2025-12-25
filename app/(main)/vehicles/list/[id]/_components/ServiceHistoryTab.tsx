import React from 'react';
import { type Vehicle } from '@/lib/services/vehicles-api';
import { Search, Filter, MoreHorizontal } from 'lucide-react';

interface ServiceHistoryTabProps {
    vehicle: Vehicle;
}

export const ServiceHistoryTab: React.FC<ServiceHistoryTabProps> = ({ vehicle }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-md">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Service History"
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

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service Task</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                No service history records found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
