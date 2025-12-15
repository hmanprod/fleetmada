'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Lock, Calendar, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateVehicleRenewalPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vehicle: '',
        renewalType: '',
        dueDate: '12/14/2025',
        threshold: '3',
        thresholdUnit: 'week(s)',
        notifications: true,
        watcher: '',
        comment: ''
    });

    const handleBack = () => {
        router.push('/reminders/vehicle-renewals');
    };

    const handleSave = () => {
        console.log('Saving renewal:', formData);
        // TODO: Implement save logic
        router.push('/reminders/vehicle-renewals');
    };

    const handleSaveAndAddAnother = () => {
        console.log('Save and add another:', formData);
        // TODO: Implement save and reset logic
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Vehicle Renewal Reminders
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">New Vehicle Renewal Reminder</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Vehicle Renewal Reminder</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Details Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Vehicle <span className="text-red-500">*</span></label>
                            <select
                                value={formData.vehicle}
                                onChange={(e) => handleInputChange('vehicle', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            >
                                <option value="">Please select</option>
                                <option value="AC101">AC101 (Sample)</option>
                                <option value="HF109">HF109 (Sample)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <label className="block text-sm font-bold text-gray-900">Vehicle Renewal Type <span className="text-red-500">*</span></label>
                                <Lock size={12} className="text-gray-400" />
                            </div>
                            <select
                                value={formData.renewalType}
                                onChange={(e) => handleInputChange('renewalType', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            >
                                <option value="">Please select</option>
                                <option value="emission_test">Emission Test</option>
                                <option value="registration">Registration</option>
                            </select>
                        </div>

                        <hr className="border-gray-200" />

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Due Date <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.dueDate}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                                <Calendar size={18} className="absolute left-3 top-3 text-gray-500" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <label className="block text-sm font-bold text-gray-900">Due Soon Threshold</label>
                                <HelpCircle size={14} className="text-gray-400" />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.threshold}
                                    onChange={(e) => handleInputChange('threshold', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                                <select
                                    value={formData.thresholdUnit}
                                    onChange={(e) => handleInputChange('thresholdUnit', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                >
                                    <option value="week(s)">week(s)</option>
                                    <option value="day(s)">day(s)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mt-4">
                            <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 ${formData.notifications ? 'bg-[#008751]' : 'border border-gray-300'}`}>
                                {formData.notifications && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">Enable Notifications</div>
                                <div className="text-sm text-gray-500 text-xs mt-1">When enabled, notifications may be sent according to each Watcher's User Notification Settings.</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Watchers</label>
                            <select
                                value={formData.watcher}
                                onChange={(e) => handleInputChange('watcher', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            >
                                <option value="">Please select</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Comment Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">Comment</h2>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            HR
                        </div>
                        <textarea
                            placeholder="Add an optional comment"
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-12">
                    <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto ml-2">Cancel</button>
                    <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Vehicle Renewal Reminder</button>
                </div>
            </div>
        </div>
    );
}
