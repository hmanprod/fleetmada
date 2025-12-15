'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkOrderEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vehicle: 'MV110TRNS',
        status: 'Open',
        repairPriority: 'scheduled',
        issueDate: '12/14/2025',
        issueTime: '2:48pm',
        issuedBy: 'Hery RABOTOVAO',
        scheduledStartDate: '12/14/2025',
        scheduledStartTime: '2:48pm',
        actualStartDate: '12/14/2025',
        actualStartTime: '2:48pm',
        expectedCompletionDate: '12/14/2025',
        expectedCompletionTime: '2:48pm',
        actualCompletionDate: '12/14/2025',
        actualCompletionTime: '2:48pm',
        assignedTo: '',
        labels: '',
        vendor: '',
        invoiceNumber: '',
        poNumber: '',
        sendScheduledStartReminder: false,
        useMeterForCompletion: false,
    });

    const handleBack = () => {
        router.push(`/service/work-orders/${params.id}`);
    };

    const handleSave = () => {
        console.log('Saving work order:', formData);
        router.push(`/service/work-orders/${params.id}`);
    };

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
                        <ArrowLeft size={16} /> Back to Work Order
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 border-l border-gray-300 pl-4 ml-0">Edit Work Order #{params.id}</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Work Order</button>
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
                                <option value="MV110TRNS">MV110TRNS - Sample</option>
                                <option value="AC101">AC101 - 2018 Ford F-150</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 'Open'}
                                        onChange={() => handleInputChange('status', 'Open')}
                                        className="text-[#008751] focus:ring-[#008751] w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-900">Open</span>
                                </label>
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                <input
                                    type="text"
                                    value={formData.issueDate}
                                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="text"
                                    value={formData.issueTime}
                                    onChange={(e) => handleInputChange('issueTime', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                            <input
                                type="text"
                                value={formData.issuedBy}
                                onChange={(e) => handleInputChange('issuedBy', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                            <select
                                value={formData.assignedTo}
                                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Please select</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <select
                                value={formData.vendor}
                                onChange={(e) => handleInputChange('vendor', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Please select</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Line Items Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Line Items</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm">Engine Oil & Filter Replacement</div>
                                <div className="text-xs text-gray-500">MGA 954</div>
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

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Work Order</button>
                </div>
            </div>
        </div>
    );
}
