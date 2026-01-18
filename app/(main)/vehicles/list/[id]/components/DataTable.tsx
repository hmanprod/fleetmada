"use client";

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface TableHeaderProps {
    columns: string[];
}

function TableHeader({ columns }: TableHeaderProps) {
    return (
        <thead className="bg-gray-50">
            <tr>
                {columns.map((col, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
            </tr>
        </thead>
    );
}

interface EmptyStateProps {
    title: string;
}

function EmptyState({ title }: EmptyStateProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun {title} trouvé.</p>
        </div>
    );
}

interface DataTableProps {
    title: string;
    columns: string[];
    data: any[];
    renderRow: (item: any, index: number) => React.ReactNode;
    searchPlaceholder?: string;
}

export function DataTable({
    title,
    columns,
    data,
    renderRow,
    searchPlaceholder = "Rechercher"
}: DataTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex-1 max-w-sm">
                    <Search size={18} className="text-gray-400" />
                    <input type="text" placeholder={searchPlaceholder} className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Filter size={16} /> Date
                </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <TableHeader columns={columns} />
                    <tbody className="bg-white divide-y divide-gray-200">
                        {!data || !Array.isArray(data) || data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                    <div className="space-y-2">
                                        <p className="text-gray-500">Aucun {title.toLowerCase()} trouvé</p>
                                        <p className="text-sm text-gray-400">Les {title.toLowerCase()} apparaîtront ici</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => renderRow(item, index))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}