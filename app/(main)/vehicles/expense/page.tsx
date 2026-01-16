'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, FileText, Image as ImageIcon, ChevronRight, MoreVertical, Settings, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { type FilterCriterion } from '../components/filters/FilterCard';
import { EXPENSE_FIELDS } from '../components/filters/filter-definitions';
import { VehiclesAPIService } from '@/lib/services/vehicles-api';
import { MOCK_VEHICLES, MOCK_EXPENSE_ENTRIES } from '../types';

export default function VehicleExpensePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);
    const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    });

    const api = new VehiclesAPIService();

    const fetchExpenses = async (page = 1, currentSearch = searchTerm, currentCriteria = activeCriteria) => {
        try {
            setLoading(true);
            setError(null);

            const query: any = {
                page,
                limit: pagination.limit,
                search: currentSearch
            };

            // Process filters
            currentCriteria.forEach(criterion => {
                const field = EXPENSE_FIELDS.find(f => f.id === criterion.field);
                if (!field) return;

                // Handle Date Filters
                if (field.type === 'date') {
                    if (criterion.operator === 'is') {
                        // For exact date, we might want a range of that day
                        const date = new Date(criterion.value as string);
                        query[`${criterion.field}_gte`] = date.toISOString();
                        const nextDay = new Date(date);
                        nextDay.setDate(date.getDate() + 1);
                        query[`${criterion.field}_lte`] = nextDay.toISOString();
                    } else if (criterion.operator === 'gt') {
                        query[`${criterion.field}_gte`] = new Date(criterion.value as string).toISOString();
                    } else if (criterion.operator === 'lt') {
                        query[`${criterion.field}_lte`] = new Date(criterion.value as string).toISOString();
                    }
                }
                // Handle Number Filters (Amount)
                else if (field.type === 'number') {
                    if (criterion.operator === 'is') {
                        query[`${criterion.field}_gte`] = criterion.value;
                        query[`${criterion.field}_lte`] = criterion.value;
                    } else if (criterion.operator === 'gt') {
                        query[`${criterion.field}_gte`] = criterion.value;
                    } else if (criterion.operator === 'lt') {
                        query[`${criterion.field}_lte`] = criterion.value;
                    } else if (criterion.operator === 'gte') {
                        query[`${criterion.field}_gte`] = criterion.value;
                    } else if (criterion.operator === 'lte') {
                        query[`${criterion.field}_lte`] = criterion.value;
                    }
                }
                // Handle other filters (Text, Enum)
                else {
                    // For Vehicle related fields, prefix might be needed if API supports it explicitly
                    // But current API maps specific fields like 'type', 'vendor', 'source' directly.
                    // 'name', 'vin' are covered by 'search' usually, but if specific filter:
                    if (criterion.field === 'status') {
                        query.vehicleStatus = criterion.value;
                    } else {
                        query[criterion.field] = criterion.value;
                    }
                }
            });

            const data = await api.getAllExpenses(query);
            setExpenses(data.expenses);
            setPagination(data.pagination);
        } catch (err: any) {
            console.error('Error loading expenses:', err);
            setError(err.message || 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchExpenses(1);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExpenses(1, searchTerm, activeCriteria);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleApplyFilters = (criteria: FilterCriterion[]) => {
        setActiveCriteria(criteria);
        setIsFiltersSidebarOpen(false);
        fetchExpenses(1, searchTerm, criteria);
    };

    const handlePageChange = (newPage: number) => {
        fetchExpenses(newPage, searchTerm, activeCriteria);
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Expense History</h1>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Beta
                    </span>
                </div>
                <div className="flex gap-2">
                    {/* <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button> */}
                    <Link
                        href="/vehicles/expense/create"
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Expense Entry
                    </Link>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">
                        <strong>Error:</strong> {error}
                    </div>
                    <button
                        onClick={() => fetchExpenses()}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search expense entries, vehicles, vendors..."
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
                    </div>
                )}
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
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {expenses.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50 group">
                                <td className="p-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                                <td className="p-4">
                                    <Link href={`/vehicles/${entry.vehicle?.id}`} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {(entry.vehicle?.name || '??').substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-[#008751] hover:underline">{entry.vehicle?.name || 'Unknown Vehicle'}</span>
                                    </Link>
                                </td>
                                <td className="p-4 text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-900">{entry.type}</td>
                                <td className="p-4 text-gray-500">{entry.vendorName || entry.vendor?.name || '—'}</td>
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
                                <td className="p-4 text-right text-gray-400">
                                    <div className="relative group hover:z-30">
                                        <button
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        <div className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 hidden group-hover:block text-left">
                                            <Link
                                                href={`/vehicles/expense/${entry.id}`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Eye size={14} /> View Details
                                            </Link>
                                            <Link
                                                href={`/vehicles/expense/${entry.id}/edit`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Settings size={14} /> Edit
                                            </Link>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle delete
                                                }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && expenses.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-gray-500">
                                    No expense entries found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalCount)}</span> of <span className="font-medium">{pagination.totalCount}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={!pagination.hasPrev}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${!pagination.hasPrev ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronRight className="h-5 w-5 transform rotate-180" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={!pagination.hasNext}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!pagination.hasNext ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
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
