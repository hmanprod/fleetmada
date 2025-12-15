'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceReminderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/reminders/service');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Service Reminders
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center text-orange-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tire Rotation</h1>
                            <div className="text-sm text-gray-500">AP101 (Sample)</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        actions <MoreHorizontal size={16} />
                    </button>
                    <button className="px-3 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded flex items-center gap-2 text-sm shadow-sm">
                        <CheckCircle size={16} /> Resolve
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-red-50">
                            <div className="flex items-center gap-2 text-red-700 font-bold">
                                <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div> Overdue
                            </div>
                            <div className="text-sm text-red-600">Due 4 months ago</div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Service Task</div>
                                    <div className="text-sm text-gray-900 font-medium">Tire Rotation</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Vehicle</div>
                                    <div className="text-sm text-[#008751] font-medium hover:underline cursor-pointer">AP101 (Sample)</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Next Due Date</div>
                                    <div className="text-sm text-gray-900">Aug 22, 2025</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Next Due Meter</div>
                                    <div className="text-sm text-gray-900">22,101 mi</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Repeats</div>
                                    <div className="text-sm text-gray-900">Every 4 months or 7,500 mi</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Compliance</div>
                                    <div className="text-sm text-gray-900">100%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Service History</h2>
                        <div className="text-center py-8 text-gray-500">
                            No completed service entries found for this task.
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-[350px] space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Notifications</h3>
                        <div className="flex gap-2 items-start mb-4">
                            <div className="mt-0.5"><CheckCircle size={16} className="text-green-500" /></div>
                            <div className="text-sm text-gray-600">Notifications are enabled for this reminder.</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Watchers</h3>
                        <div className="text-sm text-gray-500">No watchers assigned.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
