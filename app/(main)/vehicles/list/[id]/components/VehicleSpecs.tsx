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

interface VehicleSpecsProps {
    vehicle: Vehicle;
}

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Specifications</div>
            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                <DetailRow label="Body Type" value={vehicle.bodyType} />
                <DetailRow label="Body Subtype" value={vehicle.bodySubtype} />
                <DetailRow label="MSRP" value={vehicle.msrp} />
                <DetailRow label="Width" value={vehicle.width} />
                <DetailRow label="Height" value={vehicle.height} />
                <DetailRow label="Length" value={vehicle.length} />
                <DetailRow label="Interior Volume" value={vehicle.interiorVolume} />
                <DetailRow label="Passenger Volume" value={vehicle.passengerVolume} />
                <DetailRow label="Ground Clearance" value={vehicle.groundClearance} />
                <DetailRow label="Bed Length" value={vehicle.bedLength} />
            </div>
        </div>
    );
}