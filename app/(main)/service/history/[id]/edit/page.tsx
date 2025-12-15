'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceEntryEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vehicle: 'AC101',
        repairPriority: 'scheduled',
        completionDate: '2025-12-19',
        time: '16:18',
        setStartDate: true,
        reference: 'REF-2025-001',
        vendor: 'MGA',
        labels: '',
        comment: ''
    });

    const handleBack = () => {
        router.push(`/service/history/${params.id}`);
    };

    const handleSave = () => {
        console.log('Saving service entry:', formData);
        // TODO: Implement save logic
        router.push(`/service/history/${params.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this service entry?')) {
            console.log('Deleting entry');
            router.push('/service/history');
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Service Entry
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 border-l border-gray-300 pl-4 ml-0">Edit Service Entry</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDelete} className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded bg-white border border-transparent hover:border-red-200">Delete</button>
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Entry</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Details Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                            <select
                                value={formData.vehicle}
                                onChange={(e) => handleInputChange('vehicle', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Please select</option>
                                <option value="AC101">AC101 - 2018 Ford F-150</option>
                                <option value="BT50">BT50 - 2009 Mazda BT50</option>
                                <option value="MV110TRNS">MV110TRNS - Sample</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Repair Priority Class</label>
                            <select
                                value={formData.repairPriority}
                                onChange={(e) => handleInputChange('repairPriority', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Please select</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="non-scheduled">Non-Scheduled</option>
                                <option value="emergency">Emergency</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Repair Priority Class (VMRS Code Key 16) is a simple way to classify whether a service or repair was scheduled, non-scheduled, or an emergency.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.completionDate}
                                    onChange={(e) => handleInputChange('completionDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="setDate"
                                checked={formData.setStartDate}
                                onChange={(e) => handleInputChange('setStartDate', e.target.checked)}
                                className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                            />
                            <label htmlFor="setDate" className="text-sm text-gray-700">Set Start Date</label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                            <input
                                type="text"
                                value={formData.reference}
                                onChange={(e) => handleInputChange('reference', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <select
                                value={formData.vendor}
                                onChange={(e) => handleInputChange('vendor', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Please select</option>
                                <option value="MGA">MGA</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                            <select
                                value={formData.labels}
                                onChange={(e) => handleInputChange('labels', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Please select</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Issues Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Issues</h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <p>No issues associated.</p>
                    </div>
                </div>

                {/* Line Items Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Line Items</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm">Engine Oil & Filter Replacement</div>
                                <div className="text-xs text-gray-500">MGA 954</div>
                            </div>
                            <button className="text-[#008751] text-sm font-bold hover:underline">Edit</button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm">Tire Rotation</div>
                                <div className="text-xs text-gray-500">MGA 382</div>
                            </div>
                            <button className="text-[#008751] text-sm font-bold hover:underline">Edit</button>
                        </div>
                        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:bg-gray-50 hover:border-gray-400 font-medium">Add Line Item</button>
                    </div>
                </div>

                {/* Photos & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Photos</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                <Upload size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                            <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                <Upload size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                            <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Comments</h2>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">HR</div>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md p-3 focus:ring-[#008751] focus:border-[#008751]"
                            placeholder="Add an optional comment"
                            rows={3}
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Entry</button>
                </div>
            </div>
        </div>
    );
}
