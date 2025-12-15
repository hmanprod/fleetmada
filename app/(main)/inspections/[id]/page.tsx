'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Car, CheckCircle, Droplets, Gauge } from 'lucide-react'; // Using approximate icons
import { useRouter } from 'next/navigation';

export default function InspectionFormDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleEdit = () => {
        router.push(`/inspections/forms/${params.id}/edit`);
    };

    const handleBack = () => {
        router.push('/inspections/forms');
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 w-fit flex items-center gap-1 text-sm">
                    <ArrowLeft size={16} /> Inspection Forms
                </button>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-gray-900">Basic Form</h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                        <button
                            onClick={() => { }} // Start inspection
                            className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-50"
                        >
                            Start Inspection
                        </button>
                        <button
                            onClick={handleEdit}
                            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                        >
                            <Edit size={18} /> Edit Inspection Form
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1 mb-8">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Description</div>
                <p className="text-gray-600">—</p>

                <div className="flex gap-8 mt-4 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs font-bold uppercase tracking-wide">Location Exception Tracking</span>
                        <span className="font-medium text-gray-900">Enabled</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs font-bold uppercase tracking-wide">Prevent Use of Stored Photos</span>
                        <span className="font-medium text-gray-900">Disabled</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
                <button className="pb-3 border-b-2 border-[#008751] text-[#008751] font-bold text-sm flex items-center gap-2">
                    Inspection Items <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">5</span>
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-2">
                    Workflows <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">1</span>
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-2">
                    Vehicles & Schedules <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">4</span>
                </button>
            </div>

            {/* Items List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900">Inspection Items</h2>
                    <button
                        onClick={handleEdit}
                        className="text-[#008751] hover:text-[#007043] font-medium flex items-center gap-1 text-sm"
                    >
                        <Edit size={14} /> Edit
                    </button>
                </div>

                {[
                    { title: 'Odometer Reading', required: true, type: 'Meter Entry', icon: <Gauge size={16} /> },
                    { title: 'Tires', required: true, type: 'Pass / Fail', icon: <CheckCircle size={16} /> },
                    { title: 'Fuel Level', required: true, type: 'Dropdown', icon: <Droplets size={16} />, choices: ['Full', '3/4', '1/2', '1/4', 'Empty'] },
                    { title: 'Water', required: true, type: 'Dropdown', icon: <Droplets size={16} />, choices: ['Max', '1/2', 'Min'] },
                    { title: 'Interior Cleanliness', required: true, type: 'Photo', icon: <Car size={16} /> }
                ].map((item, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1">
                                {item.title} {item.required && <span className="text-red-500">*</span>}
                            </h3>
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                {item.icon} {item.type}
                            </div>
                        </div>

                        <div className="grid grid-cols-[200px_1fr] gap-y-2 text-sm">
                            <div className="text-gray-500">Short Description</div>
                            <div>—</div>

                            {item.title === 'Odometer Reading' && (
                                <>
                                    <div className="text-gray-500">Require Secondary Meter</div>
                                    <div>Yes</div>
                                    <div className="text-gray-500">Require Photo Verification</div>
                                    <div>Yes</div>
                                </>
                            )}

                            {item.title === 'Tires' && (
                                <>
                                    <div className="text-gray-500">Instructions</div>
                                    <div>—</div>
                                    <div className="text-gray-500">Pass Label</div>
                                    <div>Pass</div>
                                    <div className="text-gray-500">Fail Label</div>
                                    <div>Fail</div>
                                    <div className="text-gray-500">Enable N/A option</div>
                                    <div>No</div>
                                </>
                            )}

                            {(item.title === 'Fuel Level' || item.title === 'Water') && (
                                <>
                                    <div className="text-gray-500">Choices</div>
                                    <div className="flex flex-col">
                                        {item.choices?.map(c => <span key={c}>{c}</span>)}
                                    </div>
                                    <div className="text-gray-500">Require photo or comment for "Pass"</div>
                                    <div>No</div>
                                    <div className="text-gray-500">Require photo or comment for "Fail"</div>
                                    <div>No</div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
