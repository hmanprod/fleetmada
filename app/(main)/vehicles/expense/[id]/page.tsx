'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, MoreHorizontal, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { MOCK_VEHICLES, MOCK_EXPENSE_ENTRIES } from '../../types';

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const entry = MOCK_EXPENSE_ENTRIES.find(e => e.id === params.id) || MOCK_EXPENSE_ENTRIES[0]; // Fallback for dev

    if (!entry) return <div>Entry not found</div>;

    const vehicle = MOCK_VEHICLES.find(v => v.id === entry.vehicleId);

    return (
        <div className="p-6 max-w-[1800px] mx-auto flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
                <div className="mb-6">
                    <Link href="/vehicles/expense" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm mb-2">
                        <ArrowLeft size={16} /> Expense Entries
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Expense Entry #{entry.id}18069090</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Details</h2>
                        {/* Actions not implemented yet */}
                    </div>
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">All Fields</h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-[200px_1fr] border-b border-gray-50 pb-2">
                                <div className="text-sm text-gray-500">Vehicle</div>
                                <div className="flex items-center gap-2">
                                    {/* Avatar placeholder */}
                                    <div className="w-6 h-6 rounded bg-blue-100"></div>
                                    <Link href={`/vehicles/${vehicle?.id}`} className="text-[#008751] font-medium hover:underline text-sm">
                                        {vehicle?.name}
                                    </Link>
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">Sample</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-[200px_1fr] border-b border-gray-50 pb-2">
                                <div className="text-sm text-gray-500">Date</div>
                                <div className="text-sm text-gray-900 underline decoration-dotted">{entry.date}</div>
                            </div>

                            <div className="grid grid-cols-[200px_1fr] border-b border-gray-50 pb-2">
                                <div className="text-sm text-gray-500">Type</div>
                                <div className="text-sm text-gray-900">{entry.type}</div>
                            </div>

                            <div className="grid grid-cols-[200px_1fr] border-b border-gray-50 pb-2">
                                <div className="text-sm text-gray-500">Source</div>
                                <div className="text-sm text-gray-900">{entry.source}</div>
                            </div>

                            <div className="grid grid-cols-[200px_1fr] border-b border-gray-50 pb-2">
                                <div className="text-sm text-gray-500">Vendor</div>
                                <div className="text-sm text-gray-900">{entry.vendor || '—'}</div>
                            </div>

                            <div className="grid grid-cols-[200px_1fr] border-b border-gray-50 pb-2">
                                <div className="text-sm text-gray-500">Amount</div>
                                <div className="text-sm text-gray-900">{entry.amount} {entry.currency}</div>
                            </div>

                            <div className="grid grid-cols-[200px_1fr]">
                                <div className="text-sm text-gray-500">Notes</div>
                                <div className="text-sm text-gray-900">{entry.notes || '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar / Actions */}
            <div className="w-80 space-y-4">
                {/* Top Buttons */}
                <div className="flex gap-2 justify-end">
                    <button className="border border-gray-300 bg-white rounded p-2 text-gray-600 hover:bg-gray-50"><div className="w-5 h-5 rounded-full bg-gray-200"></div></button>
                    <button className="border border-gray-300 bg-white rounded px-3 py-2 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <div className="w-4 h-4" /> Watch
                    </button>
                    <button className="border border-gray-300 bg-white rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button className="border border-gray-300 bg-white rounded px-3 py-2 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Edit size={16} /> Edit
                    </button>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 text-left">Comments</h3>
                    <div className="flex flex-col items-center justify-center py-8">
                        <MessageSquare className="text-green-500 mb-3" size={48} />
                        <p className="text-sm text-gray-500 text-center px-4">Start a conversation or @mention someone to ask a question in the comment box below.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 border-t border-gray-100 pt-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">HR</div>
                        <input type="text" placeholder="Add a Comment" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}
