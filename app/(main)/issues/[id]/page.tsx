'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Bell, MessageSquare, MapPin, Check, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/issues');
    };

    const handleEdit = () => {
        router.push(`/issues/${params.id}/edit`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Issues
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Dead battery</h1>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-2 mr-2">
                        <div className="bg-purple-200 text-purple-700 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">HR</div>
                        <div className="bg-gray-200 text-gray-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">+</div>
                    </div>
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <EyeOff size={16} /> Unwatch
                    </button>
                    <button className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button onClick={handleEdit} className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Edit
                    </button>
                    <button className="px-3 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded flex items-center gap-2 text-sm shadow-sm">
                        <Check size={16} /> Resolve
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Details</h2>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">All Fields</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Issue #</div>
                                    <div className="text-sm text-gray-900">{params.id || '1'}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div><span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">Open</span></div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Summary</div>
                                    <div className="text-sm text-gray-900">Dead battery</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Description</div>
                                    <div className="text-sm text-gray-900">Had to jump-start the truck</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Priority</div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-red-500 font-bold text-sm">! Critical</div>
                                    </div>
                                    <div className="col-start-2 text-xs text-gray-500">Out of service or safety issue</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Vehicle</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <img src={`https://source.unsplash.com/random/50x50/?truck`} className="w-full h-full object-cover" alt="Vehicle" />
                                        </div>
                                        <span className="text-[#008751] font-medium hover:underline cursor-pointer">AC101</span>
                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Reported Date</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">08/22/2025 5:13am</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Reported By</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Odometer</div>
                                    <div className="text-sm text-gray-900">71,520 mi</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Source</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Assigned To</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Due Date</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] pb-1">
                                    <div className="text-sm text-gray-500">Due Odometer</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-[#008751] cursor-pointer hover:underline mb-8">
                        Created 4 months ago · Updated 16 hours ago
                    </div>
                </div>

                {/* Right Sidebar - Timeline & Comments */}
                <div className="w-[400px] space-y-6">
                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Timeline</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1">
                                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold">!</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-gray-900 text-sm">Issue Opened</span>
                                        <span className="text-xs text-gray-500">Aug 22</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Comments</h2>
                            <div className="flex bg-gray-100 p-1 rounded">
                                <button className="p-1 hover:bg-white rounded shadow-sm relative"><MessageSquare size={14} /><span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-3 h-3 rounded-full flex items-center justify-center">1</span></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400 relative"><MapPin size={14} /><span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-3 h-3 rounded-full flex items-center justify-center">1</span></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><Bell size={14} /></button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">HR</div>
                                <div>
                                    <div className="flex gap-2 items-baseline">
                                        <span className="font-bold text-[#008751] text-sm">Hery RABOTOVAO</span>
                                        <span className="text-xs text-gray-500">4 months ago</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">Scheduling for service this week. Battery is starting to look corroded.</p>
                                </div>
                            </div>
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
