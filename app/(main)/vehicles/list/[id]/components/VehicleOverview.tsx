"use client";

import React from 'react';
import type { Vehicle } from '@/lib/services/vehicles-api';

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="border-b border-gray-100 py-3 last:border-0">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{value || '-'}</dd>
        </div>
    );
}

interface VehicleOverviewProps {
    vehicle: Vehicle;
    getStatusBadge: (status: string) => React.ReactNode;
}

export function VehicleOverview({ vehicle, getStatusBadge }: VehicleOverviewProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Details</div>
                <div className="px-6 py-2 border-b border-gray-100 text-sm text-gray-500">All Fields</div>
                <div className="p-6 space-y-0">
                    <DetailRow label="Name" value={vehicle.name} />
                    <DetailRow label="Meter" value={
                        vehicle.meterReading ?
                            `${vehicle.meterReading.toLocaleString()} ${vehicle.primaryMeter || 'mi'}` :
                            vehicle.lastMeterReading ?
                                `${vehicle.lastMeterReading.toLocaleString()} ${vehicle.lastMeterUnit || 'hr'}` :
                                '-'
                    } />
                    <DetailRow label="Status" value={getStatusBadge(vehicle.status)} />
                    <DetailRow label="Group" value={vehicle.group} />
                    <DetailRow label="Operator" value={vehicle.operator || 'Unassigned'} />
                    <DetailRow label="Type" value={vehicle.type} />
                    <DetailRow label="Fuel Type" value={vehicle.fuelUnit || '-'} />
                    <DetailRow label="VIN/SN" value={vehicle.vin} />
                    <DetailRow label="License Plate" value="-" />
                    <DetailRow label="Year" value={vehicle.year} />
                    <DetailRow label="Make" value={vehicle.make} />
                    <DetailRow label="Model" value={vehicle.model} />
                </div>
            </div>
        </div>
    );
}