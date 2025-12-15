'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Bell, MessageSquare, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChargingEntryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/fuel/charging');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Charging History
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Charging Entry #{params.id || '295871221'}</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full bg-gray-100"><span className="sr-only">User</span><div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white">HR</div></button>
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Bell size={16} /> Watch
                    </button>
                    <button className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Edit
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Details</h2>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">All Fields</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Vehicle</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <img src={`https://source.unsplash.com/random/50x50/?electric-car`} className="w-full h-full object-cover" alt="Vehicle" />
                                        </div>
                                        <span className="text-[#008751] font-medium hover:underline cursor-pointer">MV112TRNS</span>
                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Charging Started</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">12/14/2025 3:49pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Charging Ended</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">12/14/2025 3:49pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Duration</div>
                                    <div className="text-sm text-gray-900">0 min</div>
                                </div>


                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Vendor</div>
                                    <div className="text-sm text-gray-900">Tesla</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Total Energy</div>
                                    <div className="text-sm text-gray-900">120.5 kWh</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Energy Price</div>
                                    <div className="text-sm text-gray-900">MGA 0.00 / kWh</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] pb-1">
                                    <div className="text-sm text-gray-500">Energy Cost</div>
                                    <div className="text-sm text-gray-900">MGA 0.00</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Footer in Card - Adapted for Charging */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 grid grid-cols-4 gap-6">
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">Total Energy</div>
                                <div className="text-xl font-bold text-gray-900">120.5 <span className="text-xs font-normal text-gray-500">kWh</span></div>
                                <div className="text-xs text-gray-400 font-medium mt-1">—</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">Avg. Energy Price</div>
                                <div className="text-xl font-bold text-gray-900">MGA 0.00 <span className="text-xs font-normal text-gray-500">/ kWh</span></div>
                                <div className="text-xs text-gray-400 font-medium mt-1">—</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">Total Cost</div>
                                <div className="text-xl font-bold text-gray-900">MGA 0</div>
                                <div className="text-xs text-gray-400 font-medium mt-1">—</div>
                            </div>
                            <div>{/* Empty col for spacing/alignment */}</div>

                            <div className="mt-4">
                                <div className="text-xs text-gray-500 font-medium mb-1">Usage</div>
                                <div className="text-xl font-bold text-gray-900">0 <span className="text-xs font-normal text-gray-500">hours</span></div>
                                <div className="text-xs text-gray-400 font-medium mt-1">—</div>
                            </div>
                            <div className="mt-4">
                                <div className="text-xs text-gray-500 font-medium mb-1">Energy Economy</div>
                                <div className="text-xl font-bold text-gray-900">— <span className="text-xs font-normal text-gray-500"></span></div>
                                <div className="text-xs text-gray-400 font-medium mt-1">—</div>
                            </div>
                            <div className="mt-4">
                                <div className="text-xs text-gray-500 font-medium mb-1">Cost Per Hour</div>
                                <div className="text-xl font-bold text-gray-900">MGA 0 <span className="text-xs font-normal text-gray-500">/ hour</span></div>
                                <div className="text-xs text-gray-400 font-medium mt-1">—</div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Location</h2>
                        <div className="h-64 bg-gray-50 rounded flex flex-col items-center justify-center text-gray-400">
                            <div className="mb-2">No map available</div>
                            <span className="text-sm">Location is unknown or not available</span>
                        </div>
                    </div>

                    <div className="text-center text-xs text-[#008751] cursor-pointer hover:underline mb-8">
                        Created a day ago · Updated 18 hours ago
                    </div>
                </div>

                {/* Right Sidebar - Comments */}
                <div className="w-[350px] space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Comments</h2>
                            <div className="flex bg-gray-100 p-1 rounded">
                                <button className="p-1 hover:bg-white rounded shadow-sm"><MessageSquare size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><MapPin size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><Bell size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><MessageSquare size={14} className="rotate-180" /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">Start a conversation or @mention someone to ask a question in the comment box below.</p>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">HR</div>
                            <input type="text" placeholder="Add a Comment" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
