'use client';

import React from 'react';
import { ArrowLeft, Bell, Edit, MoreHorizontal, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceEntryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/service/history');
    };

    const handleEdit = () => {
        router.push(`/service/history/${params.id}/edit`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mr-2">
                        Service Entries <ArrowLeft size={16} className="rotate-180" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <span className="flex items-center gap-1"><Bell size={14} /> Watch</span>
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded text-sm shadow-sm">
                        ...
                    </button>
                    <button
                        onClick={handleEdit}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded text-sm shadow-sm flex items-center gap-2"
                    >
                        <Edit size={14} /> Edit
                    </button>
                </div>
            </div>

            <div className="px-6 py-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Service Entry #43324076</h1>

                        {/* Details Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">ALL FIELDS</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Vehicle</div>
                                    <div className="flex items-center gap-2">
                                        <img src="https://source.unsplash.com/random/30x30/?truck" className="w-6 h-6 rounded object-cover" alt="" />
                                        <span className="text-sm font-medium text-[#008751] hover:underline cursor-pointer">MV110TRNS</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Repair Priority Class</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-gray-900">Scheduled</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Start Date</div>
                                    <div className="text-sm text-gray-900">12/19/2025 4:18pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Completion Date</div>
                                    <div className="text-sm text-gray-900">12/21/2025 11:18pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Duration</div>
                                    <div className="text-sm text-gray-900">2 days 7 hrs 0 mins</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Odometer</div>
                                    <div className="text-sm text-gray-900">19 mi</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Work Order</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-[#008751] hover:underline cursor-pointer">#24</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Created By</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Vendor</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Reference</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Notes</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolved Issues */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Resolved Issues</h2>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 mb-3 text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 max-w-xs">No issues to show. If this service entry resolves any issues, you can add them by editing the service entry.</p>
                        </div>
                    </div>

                    {/* Smart Assessments Banner */}
                    <div className="bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600" />
                            <span className="font-bold text-gray-900">Smart Assessments</span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">Early Access</span>
                        </div>
                        <button className="text-sm text-gray-600 flex items-center gap-1">
                            <span className="text-gray-400">🔒</span> Ask your account administrator to enable
                        </button>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Line Items</h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Labor</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">MGA 755</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Parts</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">MGA 581</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Total</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">MGA 1,336</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Labor</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Parts</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {/* Item 1 */}
                                    <tr>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm mb-2">Engine Oil & Filter Replacement <span className="text-gray-400 font-normal">🗑</span></div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                                                <div className="text-gray-500">Reason for Repair</div>
                                                <div className="text-gray-900">Consumption, Oil</div>
                                                <div className="text-gray-500">Category / System / Assembly</div>
                                                <div className="text-gray-900">Engine / Motor Systems / Power Plant / Filter Assembly - Oil</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 align-top">MGA 373</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 align-top">MGA 581</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 align-top">MGA 954</td>
                                    </tr>

                                    {/* Item 2 */}
                                    <tr>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm mb-2">Tire Rotation <span className="text-gray-400 font-normal">🗑</span></div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                                                <div className="text-gray-500">Reason for Repair</div>
                                                <div className="text-gray-900">Routine</div>
                                                <div className="text-gray-500">Category / System / Assembly</div>
                                                <div className="text-gray-900">Chassis / Tires, Tubes, Liners & V... / Tire - Pneumatic</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 align-top">MGA 382</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 align-top">MGA 0</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 align-top">MGA 382</td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-2 text-right text-xs font-medium text-gray-500">Subtotal</td>
                                        <td className="px-6 py-2 text-right text-xs font-medium text-gray-900">~ MGA 1,336</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-1 text-right text-xs font-medium text-gray-500">Labor</td>
                                        <td className="px-6 py-1 text-right text-xs font-medium text-gray-500">MGA 755</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-1 text-right text-xs font-medium text-gray-500">Parts</td>
                                        <td className="px-6 py-1 text-right text-xs font-medium text-gray-500">MGA 581</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-2 text-right text-xs font-medium text-gray-500">Discount (null%)</td>
                                        <td className="px-6 py-2 text-right text-xs font-medium text-gray-900">-</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-2 text-right text-xs font-medium text-gray-500 border-b border-gray-200">Tax (null%)</td>
                                        <td className="px-6 py-2 text-right text-xs font-medium text-gray-900 border-b border-gray-200">+</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">MGA 1,336</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="px-6 py-3 bg-gray-50 text-xs text-green-600 text-center font-medium border-t border-gray-200">
                                Created 16 hours ago
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Comments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px] flex flex-col">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Comments</h2>

                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="h-14 w-14 rounded border-2 border-green-500 flex items-center justify-center mb-4 text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm mb-12">Start a conversation or @mention someone to ask a question in the comment box below.</p>
                        </div>

                        <div className="text-xs text-gray-400 mt-auto">
                            You cannot comment on service entries generated by work orders.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
