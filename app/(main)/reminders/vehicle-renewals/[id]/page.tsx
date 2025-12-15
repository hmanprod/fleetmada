'use client';

import React from 'react';
import { ArrowLeft, Edit, MoreHorizontal, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VehicleRenewalDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/reminders/vehicle-renewals');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mr-2">
                        Vehicle Renewal (12313354) <ArrowLeft size={12} className="rotate-180" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <span className="flex items-center gap-1"><Bell size={14} /> Watch</span>
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded text-sm shadow-sm">
                        X
                    </button>
                </div>
            </div>

            <div className="px-6 py-6 max-w-6xl">
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Emission Test</h1>
                    <div className="flex gap-2">
                        <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                            <Edit size={16} /> Edit
                        </button>
                        <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded text-sm shadow-sm">
                            ...
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                            <div className="text-sm text-gray-500">Vehicle</div>
                            <div className="flex items-center gap-2">
                                <img src="https://source.unsplash.com/random/30x30/?truck" className="w-8 h-8 rounded object-cover" alt="" />
                                <span className="text-sm font-medium text-[#008751] hover:underline cursor-pointer">AC253</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                            <div className="text-sm text-gray-500">Renewal Type</div>
                            <div className="text-sm text-gray-900">Emission Test</div>
                        </div>

                        <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="flex items-center gap-1.5 text-sm text-red-600 font-bold">
                                <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div> Overdue
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                            <div className="text-sm text-gray-500">Due Date</div>
                            <div className="text-sm text-gray-900 font-medium">
                                11/11/2025
                                <div className="text-xs text-red-500 font-normal">1 month ago</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                            <div className="text-sm text-gray-500">Due Soon Threshold</div>
                            <div className="text-sm text-gray-900">3 weeks</div>
                        </div>

                        <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                            <div className="text-sm text-gray-500">Notifications</div>
                            <div className="text-sm text-green-600 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border-l border-gray-100 pl-8">
                        <h3 className="font-bold text-gray-900 mb-4">Comments</h3>
                        <div className="flex gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">HR</div>
                            <input type="text" placeholder="Add a Comment..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
