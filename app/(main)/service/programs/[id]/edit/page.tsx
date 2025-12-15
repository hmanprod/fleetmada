'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceProgramEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [name, setName] = useState('Basic Vehicle Maintenance');
    const [primaryMeter, setPrimaryMeter] = useState('Miles');
    const [secondaryMeter, setSecondaryMeter] = useState(false);
    const [template, setTemplate] = useState('');

    const handleBack = () => {
        router.push(`/service/programs/${params.id}`);
    };

    const handleSave = () => {
        console.log('Saving service program:', {
            name,
            primaryMeter,
            secondaryMeter,
            template
        });
        // TODO: Implement save logic
        router.push(`/service/programs/${params.id}`);
    };

    const handleCancel = () => {
        router.push(`/service/programs/${params.id}`);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <span className="hover:underline cursor-pointer" onClick={() => router.push('/service/programs')}>Service Programs</span> <span className="text-gray-300">/</span> Basic Vehicle Maintenance
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Service Program</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-[#008751] font-medium hover:underline">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Program</button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                        <div className="flex items-center gap-2">
                            <button className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-bold px-4 py-2.5 rounded">Pick File</button>
                            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded border border-gray-300 border-dashed">Or drop file here</button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 italic">No file selected</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">
                            Primary Meter <span className="text-red-500">*</span> <Lock size={12} className="text-gray-400" />
                        </label>
                        <p className="text-sm text-gray-500 mb-2">Select how you measure utilization for this service program.</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="primaryMeter"
                                    checked={primaryMeter === 'Miles'}
                                    onChange={() => setPrimaryMeter('Miles')}
                                    className="text-[#008751] focus:ring-[#008751] w-4 h-4 border-gray-300"
                                />
                                <span className="text-sm text-gray-900 font-medium">Miles</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="primaryMeter"
                                    checked={primaryMeter === 'Kilometers'}
                                    onChange={() => setPrimaryMeter('Kilometers')}
                                    className="text-[#008751] focus:ring-[#008751] w-4 h-4 border-gray-300"
                                    disabled
                                />
                                <span className="text-sm text-gray-400 font-medium">Kilometers</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="primaryMeter"
                                    checked={primaryMeter === 'Hours'}
                                    onChange={() => setPrimaryMeter('Hours')}
                                    className="text-[#008751] focus:ring-[#008751] w-4 h-4 border-gray-300"
                                    disabled
                                />
                                <span className="text-sm text-gray-400 font-medium">Hours</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="relative inline-flex items-center cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    id="secondaryMeter"
                                    checked={secondaryMeter}
                                    onChange={(e) => setSecondaryMeter(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                            </div>
                            <div>
                                <label htmlFor="secondaryMeter" className="block text-sm font-bold text-gray-900 mb-1 cursor-pointer">Secondary Meter</label>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Turn on to utilize an additional meter on the service program. This is useful for tracking service for vehicle engine hours or attached vehicle equipment (concrete mixer, welder, trailer, etc.)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <button onClick={handleCancel} className="text-[#008751] font-medium hover:underline">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Program</button>
                </div>
            </div>
        </div>
    );
}
