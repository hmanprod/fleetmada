'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Package, Archive, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PartDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/parts');
    };

    const handleEdit = () => {
        router.push(`/parts/${params.id}/edit`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Parts
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center text-gray-500">
                            <Package size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">WF-10902 <span className="text-gray-400 font-normal">Fuel Filter</span></h1>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button onClick={handleEdit} className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Edit
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Part Number</div>
                                    <div className="text-sm text-gray-900 font-medium">WF-10902</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Description</div>
                                    <div className="text-sm text-gray-900">Fuel Filter</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Category</div>
                                    <div className="text-sm text-gray-900">Filters</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Manufacturer</div>
                                    <div className="text-sm text-gray-900">Wix</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Manufacturer Part #</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Unit Cost</div>
                                    <div className="text-sm text-gray-900">Ar 25,000</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Measurement Unit</div>
                                    <div className="text-sm text-gray-900">Pieces</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">UPC</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
                            <button className="text-[#008751] text-sm font-medium hover:underline">+ Adjust Inventory</button>
                        </div>
                        <div className="p-12 text-center text-gray-500">
                            No inventory locations found.
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-[350px] space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Photo</h3>
                        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-gray-400">
                            <Package size={48} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
