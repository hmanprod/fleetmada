'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddServiceProgramVehiclesPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [method, setMethod] = useState('');

    const handleBack = () => {
        router.push(`/service/programs/${params.id}`);
    };

    const handleAdd = () => {
        console.log('Adding vehicles method:', method);
        // TODO: Implement add vehicles logic
        router.push(`/service/programs/${params.id}`);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <span className="hover:underline cursor-pointer" onClick={() => router.push('/service/programs')}>Service Programs</span> <span className="text-gray-300">/</span> <span className="hover:underline cursor-pointer" onClick={handleBack}>Basic Vehicle Maintenance</span> <span className="text-gray-300">/</span> Vehicles
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">New Service Program Vehicles</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-[#008751] font-medium hover:underline">Cancel</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-gray-200 text-gray-500 font-bold rounded shadow-sm cursor-not-allowed">Add Service Program Vehicles</button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Add Vehicles</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add Vehicles By</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                        >
                            <option value="">Please select</option>
                            <option value="individual">Individual Vehicle</option>
                            <option value="group">Vehicle Group</option>
                            <option value="type">Vehicle Type</option>
                        </select>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-100 flex justify-start">
                        <button onClick={handleBack} className="text-[#008751] font-medium hover:underline">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
