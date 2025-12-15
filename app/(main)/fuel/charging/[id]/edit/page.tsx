'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChargingEntryEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    // Mock initial data
    const [vehicle, setVehicle] = useState('MV112TRNS');
    const [vendor, setVendor] = useState('Tesla');
    const [startDate, setStartDate] = useState('2025-12-14');
    const [startTime, setStartTime] = useState('03:49');
    const [endDate, setEndDate] = useState('2025-12-14');
    const [endTime, setEndTime] = useState('03:49');
    const [totalEnergy, setTotalEnergy] = useState('120.5');
    const [energyPrice, setEnergyPrice] = useState('0.00');
    const [energyCost, setEnergyCost] = useState('0.00');

    const handleCancel = () => {
        router.back();
    };

    const handleSave = () => {
        // TODO: Implement update functionality
        console.log('Update charging entry:', { params: params.id });
        router.push('/fuel/charging');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Charging Entry #{params.id || '...'}</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Changes</button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
                {/* Vehicle Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Vehicle Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                        <select
                            value={vehicle}
                            onChange={e => setVehicle(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                        >
                            <option>Please select</option>
                            <option value="MV112TRNS">MV112TRNS</option>
                            <option value="AM101">AM101</option>
                        </select>
                    </div>
                </div>

                {/* Charging Event */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Charging Event</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <select
                                value={vendor}
                                onChange={e => setVendor(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                            >
                                <option>Please select</option>
                                <option value="Tesla">Tesla Supercharger</option>
                                <option value="ChargePoint">ChargePoint</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-[1fr_1fr_auto] gap-6 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charging Started <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                                    </div>
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charging Ended</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                                    </div>
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charging Duration</label>
                                <div className="relative">
                                    <input type="text" readOnly value="" placeholder="" className="w-24 p-2.5 border border-gray-300 rounded-md bg-gray-50" />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">min</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Energy <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={totalEnergy}
                                        onChange={e => setTotalEnergy(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">kWh</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Energy Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">MGA</span>
                                    <input
                                        type="number"
                                        value={energyPrice}
                                        onChange={e => setEnergyPrice(e.target.value)}
                                        className="w-full pl-12 pr-12 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/ kWh</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Energy Cost</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">MGA</span>
                                    <input
                                        type="number"
                                        value={energyCost}
                                        onChange={e => setEnergyCost(e.target.value)}
                                        className="w-full pl-12 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="text-[#008751] font-bold text-sm flex items-center gap-1 hover:underline">
                            <Plus size={16} /> Add fees or discounts
                        </button>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900">Additional Details</h2>
                    {/* Collapsed content typically implies it can be expanded. Leaving empty as per screenshot which shows just the header bar style or section */}
                </div>
            </div>
        </div>
    );
}
