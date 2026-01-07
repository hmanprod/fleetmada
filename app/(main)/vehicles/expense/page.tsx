'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, FileText, Image as ImageIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { type FilterCriterion } from '../components/filters/FilterCard';
import { EXPENSE_FIELDS } from '../components/filters/filter-definitions';
import { MOCK_VEHICLES, MOCK_EXPENSE_ENTRIES } from '../types';

export default function VehicleExpensePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);
    const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);


    const getVehicleName = (id: string) => {
        return MOCK_VEHICLES.find(v => v.id === id)?.name || 'Unknown Vehicle';
    };

    const filteredEntries = MOCK_EXPENSE_ENTRIES.filter(entry => {
        const vehicleName = getVehicleName(entry.vehicleId).toLowerCase();
        const type = entry.type.toLowerCase();
        const query = searchTerm.toLowerCase();
        const matchesSearch = vehicleName.includes(query) || type.includes(query);

        if (!matchesSearch) return false;

        // Apply filters
        return activeCriteria.every(criterion => {
            const entryValue = String(entry[criterion.field as keyof typeof entry] || '').toLowerCase();
            const filterValue = String(criterion.value).toLowerCase();

            switch (criterion.operator) {
                case 'is':
                    return entryValue === filterValue;
                case 'contains':
                    return entryValue.includes(filterValue);
                // Add logic for other operators if needed for MOCK data
                default:
                    return true;
            }
        });
    });

    const handleApplyFilters = (criteria: FilterCriterion[]) => {
        setActiveCriteria(criteria);
        setIsFiltersSidebarOpen(false);
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Expense History</h1>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Learn
                    </span>
                </div>
                <div className="flex gap-2">
                    <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <Link
                        href="/vehicles/expense/create"
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Expense Entry
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search expense entries..."
                        className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsFiltersSidebarOpen(true)}
                    className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Filter size={14} /> Filters
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200 font-medium">
                            <th className="p-4 w-8"><input type="checkbox" className="rounded border-gray-300" /></th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Vendor</th>
                            <th className="p-4">Source</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4">Attachments</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {filteredEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50 group">
                                <td className="p-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                                <td className="p-4">
                                    <Link href={`/vehicles/expense/${entry.id}`} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {getVehicleName(entry.vehicleId).substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-[#008751] hover:underline">{getVehicleName(entry.vehicleId)}</span>
                                    </Link>
                                </td>
                                <td className="p-4 text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-900">{entry.type}</td>
                                <td className="p-4 text-gray-500">{entry.vendor || '—'}</td>
                                <td className="p-4 text-gray-500">{entry.source}</td>
                                <td className="p-4 text-right font-medium text-gray-900">
                                    {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {entry.currency}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 text-gray-400">
                                        {entry.photos ? <div className="flex items-center gap-1"><ImageIcon size={14} /> {entry.photos}</div> : null}
                                        {entry.docs ? <div className="flex items-center gap-1"><FileText size={14} /> {entry.docs}</div> : null}
                                        {!entry.photos && !entry.docs && '—'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredEntries.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-gray-500">
                                    No expense entries found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <FiltersSidebar
                isOpen={isFiltersSidebarOpen}
                onClose={() => setIsFiltersSidebarOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={activeCriteria}
                availableFields={EXPENSE_FIELDS}
            />
        </div >
    );
}
