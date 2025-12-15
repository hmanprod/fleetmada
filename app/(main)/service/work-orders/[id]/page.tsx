'use client';

import React from 'react';
import { ArrowLeft, Bell, MoreHorizontal, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/service/work-orders');
    };

    const handleEdit = () => {
        router.push(`/service/work-orders/${params.id}/edit`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mr-2">
                        Work Orders <ArrowLeft size={16} className="rotate-180" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Bell size={14} /> Watch
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded text-sm shadow-sm">
                        ...
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded text-sm shadow-sm flex items-center gap-2">
                        <MoreHorizontal size={14} /> Emergency
                    </button>
                </div>
            </div>

            <div className="px-6 py-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Work Order #{params.id}</h1>

                        {/* Details Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">All Fields</div>
                                    <div className="text-sm text-gray-900"></div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Vehicle</div>
                                    <div className="flex items-center gap-2">
                                        <img src="https://source.unsplash.com/random/30x30/?truck" className="w-6 h-6 rounded object-cover" alt="" />
                                        <span className="text-sm font-medium text-[#008751] hover:underline cursor-pointer">MV110TRNS</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-sm text-gray-900">In-Progress</span>
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
                                    <div className="text-sm text-gray-500">Service Tasks</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Issued By</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Issue Date</div>
                                    <div className="text-sm text-gray-900">12/14/2025 2:48pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Scheduled Start Date</div>
                                    <div className="text-sm text-gray-900">12/14/2025 2:48pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Actual Start Date</div>
                                    <div className="text-sm text-gray-900">12/14/2025 2:48pm</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Expected Completion Date</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Actual Completion Date</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Start Meter</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Completion Meter</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Assigned To</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Vendor</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">Invoice Number</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <div className="text-sm text-gray-500">PO Number</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolved Issues */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Resolved Issues</h2>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 mb-3 text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 max-w-xs">No posts to show. If this work order resolves any issues, you can add them by editing the work order.</p>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Line Items</h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Labor</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">MGA 977</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Parts</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">MGA 958</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Total</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">MGA 1,935</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Labor</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Parts</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm mb-2">Engine Oil & Filter Replacement</div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                                                <div className="text-gray-500">Category / System / Assembly</div>
                                                <div className="text-gray-900">Engine / Motor Systems / Power Plant / Filter Assembly - Oil</div>
                                                <div className="text-gray-500">Reason for Repair</div>
                                                <div className="text-gray-900">Routine</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 align-top">MGA 373</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 align-top">MGA 581</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 align-top">MGA 954</td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-2 text-right text-xs font-medium text-gray-500">Subtotal</td>
                                        <td className="px-6 py-2 text-right text-xs font-medium text-gray-900">MGA 1,935</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-1 text-right text-xs font-medium text-gray-500">Labor</td>
                                        <td className="px-6 py-1 text-right text-xs font-medium text-gray-500">MGA 977</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-1 text-right text-xs font-medium text-gray-500">Parts</td>
                                        <td className="px-6 py-1 text-right text-xs font-medium text-gray-500">MGA 958</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-2 text-right text-xs font-medium text-gray-500">Discount (0%)</td>
                                        <td className="px-6 py-2 text-right text-xs font-medium text-gray-900">MGA 0</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-2 text-right text-xs font-medium text-gray-500 border-b border-gray-200">Tax (0%)</td>
                                        <td className="px-6 py-2 text-right text-xs font-medium text-gray-900 border-b border-gray-200">MGA 0</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">MGA 1,935</td>
                                    </tr>
                                </tfoot>
                            </table>
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
                                <MessageSquare size={32} />
                            </div>
                            <p className="text-gray-500 text-sm mb-12">Start a conversation or @mention someone to ask a question in the comment box below.</p>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">HR</div>
                            <textarea
                                className="flex-1 border border-gray-300 rounded-md p-3 focus:ring-[#008751] focus:border-[#008751]"
                                placeholder="Add a comment"
                                rows={2}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
