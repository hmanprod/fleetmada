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

interface VehicleFinancialProps {
    vehicle: Vehicle;
}

export function VehicleFinancial({ vehicle }: VehicleFinancialProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900">Achat et Finance</div>
            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-2">
                <DetailRow label="Fournisseur" value={vehicle.purchaseVendor} />
                <DetailRow label="Date d'achat" value={vehicle.purchaseDate} />
                <DetailRow label="Prix d'achat" value={vehicle.purchasePrice ? `${vehicle.purchasePrice.toLocaleString()} Ar` : '-'} />
                <DetailRow label="Prêt/Leasing" value={vehicle.loanLeaseType} />
                <div className="col-span-2">
                    <DetailRow label="Notes" value={vehicle.purchaseNotes} />
                </div>
            </div>
        </div>
    );
}