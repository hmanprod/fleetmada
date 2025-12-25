import React from 'react';
import { type Vehicle } from '@/lib/services/vehicles-api';

interface FinancialTabProps {
    vehicle: Vehicle;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({ vehicle }) => {
    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="border-b border-gray-100 py-3 last:border-0">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{value || '-'}</dd>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Purchase & Financial</div>
            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                <DetailRow label="Vendor" value={vehicle.purchaseVendor} />
                <DetailRow label="Purchase Date" value={vehicle.purchaseDate} />
                <DetailRow label="Purchase Price" value={vehicle.purchasePrice ? `Ar ${vehicle.purchasePrice.toLocaleString()}` : '-'} />
                <DetailRow label="Loan/Lease" value={vehicle.loanLeaseType} />
                <div className="col-span-2">
                    <DetailRow label="Notes" value={vehicle.purchaseNotes} />
                </div>
            </div>
        </div>
    );
};
