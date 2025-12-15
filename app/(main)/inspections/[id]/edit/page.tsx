'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, GripVertical, Type, List, AlignLeft, Clock, Gauge, CheckCircle, Image as ImageIcon, PenTool, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InspectionFormEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleCancel = () => {
        router.back();
    };

    const handleSave = () => {
        router.push(`/inspections/forms/${params.id}`);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Main Canvas */}
            <div className="flex-1 bg-gray-50 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>Inspection Forms</span>
                            <span className="text-gray-300">/</span>
                            <span>Basic Form</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Inspection Items</h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Inspection Form</button>
                    </div>
                </div>

                {/* Builder Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Toolbar */}
                        <div className="flex gap-4 mb-4 text-gray-400">
                            <button className="hover:text-gray-600"><Layout size={20} /></button>
                            <button className="hover:text-gray-600"><GripVertical size={20} /></button>
                        </div>

                        {/* Items */}
                        {[
                            { title: 'Odometer Reading', type: 'Meter Entry', required: true, icon: <Gauge size={16} /> },
                            { title: 'Tires', type: 'Pass / Fail', required: true, icon: <CheckCircle size={16} /> },
                            { title: 'Fuel Level', type: 'Dropdown', required: true, icon: <List size={16} /> },
                            { title: 'Water', type: 'Dropdown', required: true, icon: <List size={16} /> },
                            { title: 'Interior Cleanliness', type: 'Photo', required: true, icon: <ImageIcon size={16} /> }
                        ].map((item, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm flex items-center group">
                                <div className="p-3 text-gray-300 cursor-move hover:text-gray-500 border-r border-gray-100">
                                    <GripVertical size={20} />
                                </div>
                                <div className="p-3 cursor-pointer text-gray-400 hover:text-gray-600">
                                    <span className="text-xs">▶</span>
                                </div>
                                <div className="flex-1 p-3 font-bold text-gray-900 flex items-center gap-1">
                                    {item.title} {item.required && <span className="text-red-500">*</span>}
                                </div>
                                <div className="px-3 py-1 flex items-center gap-2">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border border-gray-200">
                                        {item.icon} {item.type}
                                    </span>
                                </div>
                                <div className="p-3 flex gap-2 text-gray-400 border-l border-gray-100">
                                    <button className="hover:text-gray-600"><Layout size={16} /></button>
                                    <button className="hover:text-red-600"><span className="sr-only">Delete</span>×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 shadow-sm flex flex-col shrink-0 overflow-y-auto">
                <div className="p-4 space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <Clock className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Date / Time</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <List className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Dropdown</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <AlignLeft className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Free Text</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 cursor-not-allowed opacity-60">
                        <Gauge className="text-gray-400" size={18} />
                        <span className="font-medium text-gray-400">Meter Entry</span>
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <Type className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Number</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <CheckCircle className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Pass / Fail</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <ImageIcon className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Photo</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <PenTool className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Signature</span>
                    </button>

                    <div className="border-t border-gray-100 my-4"></div>

                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#008751] hover:shadow-sm rounded-lg flex items-center gap-3 transition-all">
                        <Layout className="text-gray-500" size={18} />
                        <span className="font-medium text-gray-700">Section</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
