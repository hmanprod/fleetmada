'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateChargingEntry } from '@/lib/hooks/useChargingEntries';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { CreateChargingEntryData } from '@/types/fuel';


export default function ChargingEntryCreatePage() {
    const router = useRouter();
    const { createEntry, loading, error } = useCreateChargingEntry();
    const { vehicles, loading: vehiclesLoading } = useVehicles();


    const [formData, setFormData] = useState<CreateChargingEntryData>({
        vehicleId: '',
        date: '',
        location: '',
        energyKwh: 0,
        cost: 0,
        durationMin: 0,
        vendor: '',
        notes: ''
    });

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    const [energyPrice, setEnergyPrice] = useState('0.00');

    const handleCancel = () => {
        router.push('/fuel/charging');
    };

    const handleSave = async () => {
        if (!formData.vehicleId || !formData.date || !formData.energyKwh || !formData.cost) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const entryData = {
                ...formData,
                energyPrice: parseFloat(energyPrice) || undefined
            };

            const newEntry = await createEntry(entryData);
            if (newEntry) {
                router.push('/fuel/charging');
            }
        } catch (err) {
            console.error('Error creating charging entry:', err);
        }
    };

    const handleInputChange = (field: keyof CreateChargingEntryData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Calculer la durée de charge
    const calculateDuration = () => {
        if (startDate && startTime && endDate && endTime) {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);
            const diffMs = end.getTime() - start.getTime();
            return Math.floor(diffMs / (1000 * 60)); // minutes
        }
        return 0;
    };

    const durationMinutes = calculateDuration();

    // Sync formData.date from startDate and startTime
    React.useEffect(() => {
        if (startDate && startTime) {
            const dateTimeString = `${startDate}T${startTime}`;
            setFormData(prev => ({ ...prev, date: dateTimeString }));
        }
    }, [startDate, startTime]);

    // Auto-calculer le coût total
    React.useEffect(() => {
        if (formData.energyKwh && energyPrice) {
            const totalCost = formData.energyKwh * parseFloat(energyPrice);
            setFormData(prev => ({ ...prev, cost: totalCost, durationMin: durationMinutes }));
        }
    }, [formData.energyKwh, energyPrice, durationMinutes]);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Charging History
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">New Charging Entry</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} data-testid="cancel-button" className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        data-testid="save-button"
                        className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Save Charging Entry
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Error: {error}
                    </div>
                )}

                {/* Vehicle Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Vehicle Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                        <select
                            value={formData.vehicleId}
                            onChange={e => handleInputChange('vehicleId', e.target.value)}
                            data-testid="vehicle-select"
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                        >
                            <option value="">{vehiclesLoading ? 'Loading vehicles...' : 'Please select'}</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
                            ))}

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
                                value={formData.vendor || ''}
                                onChange={e => handleInputChange('vendor', e.target.value)}
                                data-testid="vendor-select"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                            >
                                <option value="">Please select</option>
                                <option value="Tesla">Tesla Supercharger</option>
                                <option value="ChargePoint">ChargePoint</option>
                                <option value="Electrify America">Electrify America</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-[1fr_1fr_auto] gap-6 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charging Started <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            data-testid="start-date-input"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={e => setStartTime(e.target.value)}
                                            data-testid="start-time-input"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charging Ended</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            data-testid="end-date-input"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={e => setEndTime(e.target.value)}
                                            data-testid="end-time-input"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Charging Duration</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={durationMinutes > 0 ? `${durationMinutes} min` : ''}
                                        placeholder="Auto-calculated"
                                        data-testid="duration-input"
                                        className="w-24 p-2.5 border border-gray-300 rounded-md bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Energy <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.energyKwh || ''}
                                        onChange={e => handleInputChange('energyKwh', parseFloat(e.target.value) || 0)}
                                        data-testid="energy-input"
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
                                        data-testid="price-input"
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
                                        value={formData.cost || ''}
                                        onChange={e => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                                        data-testid="cost-input"
                                        className="w-full pl-12 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={formData.location || ''}
                                onChange={e => handleInputChange('location', e.target.value)}
                                placeholder="Charging station location"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <button className="text-[#008751] font-bold text-sm flex items-center gap-1 hover:underline">
                            <Plus size={16} /> Add fees or discounts
                        </button>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Additional Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            rows={4}
                            value={formData.notes || ''}
                            onChange={e => handleInputChange('notes', e.target.value)}
                            placeholder="Add any additional notes..."
                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}
