'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, FileText, Upload, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewIssuePage() {
    const router = useRouter();

    const handleCancel = () => {
        router.back();
    };

    const handleSave = () => {
        // TODO: Implement save
        router.push('/issues');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Issues
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">New Issue</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Issue</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Asset <span className="text-red-500">*</span></label>
                            <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white">
                                <option>Please select</option>
                                <option value="AC101">AC101</option>
                                <option value="AM101">AM101</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <div className="relative">
                                <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white appearance-none pl-10">
                                    <option>No Priority</option>
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-dashed border-gray-400 w-4 h-4"></div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="date" defaultValue="2025-12-14" className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                                <input type="time" defaultValue="14:07" className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Summary <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                            <p className="text-xs text-gray-500 mt-1">Brief overview of the issue</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea rows={4} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                            <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white">
                                <option>Please select</option>
                                <option>Electrical</option>
                                <option>Mechanical</option>
                                <option>Body</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Use labels to categorize, group and more. (e.g. Electrical)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                            <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 p-2.5">
                                <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold mr-2">HR</div>
                                <span className="text-gray-900 text-sm">Hery RABOTOVAO</span>
                                <button className="ml-auto text-gray-400 hover:text-gray-600"><X size={16} /></button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
                            <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white">
                                <option>Please select</option>
                                <option>Hery RABOTOVAO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Overdue Settings</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                        <p className="text-xs text-gray-500 mt-1">(optional) Considered overdue after this date</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Photos</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                            <div className="w-10 h-10 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center text-gray-400">
                                <Plus size={20} />
                            </div>
                            <p className="font-bold text-gray-700 text-sm">Drag and drop files to upload</p>
                            <p className="text-xs text-gray-500">or click to pick files</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                            <div className="w-10 h-10 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center text-gray-400">
                                <Plus size={20} />
                            </div>
                            <p className="font-bold text-gray-700 text-sm">Drag and drop files to upload</p>
                            <p className="text-xs text-gray-500">or click to pick files</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleCancel} className="text-[#008751] hover:underline text-sm font-medium">Cancel</button>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold bg-white hover:bg-gray-50">Save & Add Another</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Issue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
