import React from 'react';
import { type Vehicle } from '@/lib/services/vehicles-api';

interface OverviewTabProps {
    vehicle: Vehicle;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ vehicle }) => {
    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="border-b border-gray-100 py-3 last:border-0">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{value || '-'}</dd>
        </div>
    );

    const getStatusBadge = (status: string) => {
        const statusMap = {
            'ACTIVE': { label: 'Active', class: 'bg-green-100 text-green-800' },
            'INACTIVE': { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
            'MAINTENANCE': { label: 'En maintenance', class: 'bg-yellow-100 text-yellow-800' },
            'DISPOSED': { label: 'Retiré du service', class: 'bg-red-100 text-red-800' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Identification</div>
                <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                    <DetailRow label="VIN/SN" value={vehicle.vin} />
                    <DetailRow label="Vehicle Name" value={vehicle.name} />
                    <DetailRow label="Type" value={vehicle.type} />
                    <DetailRow label="Year" value={vehicle.year} />
                    <DetailRow label="Make" value={vehicle.make} />
                    <DetailRow label="Model" value={vehicle.model} />
                    <DetailRow label="Status" value={getStatusBadge(vehicle.status)} />
                    <DetailRow label="Ownership" value={vehicle.ownership} />
                    <DetailRow label="Group" value={vehicle.group} />
                    <DetailRow label="Current Operator" value={vehicle.operator} />
                    <DetailRow label="Meter Reading" value={
                        vehicle.meterReading ?
                            `${vehicle.meterReading.toLocaleString()} ${vehicle.primaryMeter || 'mi'}` :
                            vehicle.lastMeterReading ?
                                `${vehicle.lastMeterReading.toLocaleString()} ${vehicle.lastMeterUnit || 'mi'}` :
                                '-'
                    } />
                    <DetailRow label="Recent Costs" value={
                        vehicle.recentCosts ?
                            `${vehicle.recentCosts.toLocaleString()}` :
                            '-'
                    } />
                </div>
            </div>

            {/* Additional Overview Widgets could go here */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Service Reminder</h3>
                    <div className="text-2xl font-bold text-gray-900">None</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Open Issues</h3>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Fuel Economy</h3>
                    <div className="text-2xl font-bold text-gray-900">-</div>
                </div>
            </div>
        </div>
    );
};
