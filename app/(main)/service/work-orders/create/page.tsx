'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkOrderCreatePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vehicle: '',
        status: 'Open',
        repairPriority: '',
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
        router.push('/service/work-orders');
    };

    const handleSave = () => {
        console.log('Saving work order:', formData);
        router.push('/service/work-orders');
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
                    <button onClick={handleBack} data-testid="back-button" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Work Orders
                    </button>
                    <h1 data-testid="page-title" className="text-2xl font-bold text-gray-900">New Work Order</h1>
                    <span className="text-sm text-gray-500">1/1</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} data-testid="cancel-button" className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white border border-gray-300 flex items-center gap-1">
                        Save and ... <ChevronDown size={16} />
                    </button>
                    <button onClick={handleSave} data-testid="save-button" className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Work Order</button>
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
                                data-testid="vehicle-select"
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
                                        data-testid="status-open"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start Date</label>
                                <input
                                    type="text"
                                    value={formData.scheduledStartDate}
                                    onChange={(e) => handleInputChange('scheduledStartDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="text"
                                    value={formData.scheduledStartTime}
                                    onChange={(e) => handleInputChange('scheduledStartTime', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="sendReminder"
                                checked={formData.sendScheduledStartReminder}
                                onChange={(e) => handleInputChange('sendScheduledStartReminder', e.target.checked)}
                                className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                            />
                            <label htmlFor="sendReminder" className="text-sm text-gray-700">Send a Scheduled Start Date Reminder</label>
                        </div>
                        <p className="text-xs text-gray-500">Check if you would like to send a Scheduled Start Date reminder notification</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Start Date</label>
                                <input
                                    type="text"
                                    value={formData.actualStartDate}
                                    onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="text"
                                    value={formData.actualStartTime}
                                    onChange={(e) => handleInputChange('actualStartTime', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion Date</label>
                                <input
                                    type="text"
                                    value={formData.expectedCompletionDate}
                                    onChange={(e) => handleInputChange('expectedCompletionDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="text"
                                    value={formData.expectedCompletionTime}
                                    onChange={(e) => handleInputChange('expectedCompletionTime', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="useMeter"
                                checked={formData.useMeterForCompletion}
                                onChange={(e) => handleInputChange('useMeterForCompletion', e.target.checked)}
                                className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                            />
                            <label htmlFor="useMeter" className="text-sm text-gray-700">Use chart odometer for completion meter</label>
                        </div>
                        <p className="text-xs text-gray-500">Uncheck if meter usage has increased since work start date</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Completion Date</label>
                                <input
                                    type="text"
                                    value={formData.actualCompletionDate}
                                    onChange={(e) => handleInputChange('actualCompletionDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="text"
                                    value={formData.actualCompletionTime}
                                    onChange={(e) => handleInputChange('actualCompletionTime', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                            <select
                                value={formData.labels}
                                onChange={(e) => handleInputChange('labels', e.target.value)}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                            <input
                                type="text"
                                value={formData.invoiceNumber}
                                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                            <input
                                type="text"
                                value={formData.poNumber}
                                onChange={(e) => handleInputChange('poNumber', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                    </div>
                </div>

                {/* Issues Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Issues</h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <p>Select a vehicle first.</p>
                    </div>
                </div>

                {/* Line Items Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Line Items</h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <p>Select a vehicle first.</p>
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
                            className="flex-1 border border-gray-300 rounded-md p-3 focus:ring-[#008751] focus:border-[#008751]"
                            placeholder="Add an optional comment"
                            rows={3}
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <button onClick={handleBack} className="text-gray-700 font-medium hover:underline">Cancel</button>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white flex items-center gap-1">
                            Save and ... <ChevronDown size={16} />
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Work Order</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
