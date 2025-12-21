'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { MOCK_VEHICLES, MOCK_EXPENSE_ENTRIES, ExpenseEntry } from '../../types';

export default function CreateExpensePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<ExpenseEntry>>({
        date: new Date().toISOString().split('T')[0],
        currency: 'MGA', // Default based on screenshot
        type: ''
    });

    const handleSubmit = () => {
        console.log('Saving expense:', formData);
        // In a real app we'd save to DB here
        router.push('/vehicles/expense');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/vehicles/expense" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                        <ArrowLeft size={16} /> Expense Entries
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">New Expense Entry</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/vehicles/expense')}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2"
                    >
                        <Save size={18} /> Save Expense Entry
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Details Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Details</h2>

                    <div className="space-y-4 max-w-3xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.vehicleId || ''}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            >
                                <option value="">Please select</option>
                                {MOCK_VEHICLES.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.vin})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type <span className="text-red-500">*</span></label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.type || ''}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Please select</option>
                                <option value="Fuel">Fuel</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Tolls">Tolls</option>
                                <option value="Vehicle Registration">Vehicle Registration</option>
                                <option value="Vehicle Registration and Taxes">Vehicle Registration and Taxes</option>
                                <option value="Telematics Device">Telematics Device</option>
                                <option value="Safety Technology">Safety Technology</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.vendor || ''}
                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                            >
                                <option value="">Please select</option>
                                <option value="Shell">Shell</option>
                                <option value="Chevron">Chevron</option>
                                <option value="Geico">Geico</option>
                                <option value="DMV">DMV</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Ar</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded pl-8 pr-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Frequency Checkboxes */}
                        <div>
                            <h3 className="block text-sm font-medium text-gray-700 mb-2">Frequency</h3>
                            <div className="flex gap-6">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input type="radio" name="frequency" className="mt-1 text-[#008751] focus:ring-[#008751]" defaultChecked />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Single Expense</div>
                                        <div className="text-xs text-gray-500">A single entry that does not repeat</div>
                                    </div>
                                </label>
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input type="radio" name="frequency" className="mt-1 text-[#008751] focus:ring-[#008751]" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Recurring Expense</div>
                                        <div className="text-xs text-gray-500">Repeats on a monthly or annual basis</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                    value={formData.date || ''}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                rows={4}
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Photos & Documents */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Photos</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3 text-gray-400">
                                <Plus size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                            <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Documents</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3 text-gray-400">
                                <Plus size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                            <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pb-10">
                    <button className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50">
                        Save & Add Another
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
                    >
                        Save Expense Entry
                    </button>
                </div>
            </div>
        </div>
    );
}
