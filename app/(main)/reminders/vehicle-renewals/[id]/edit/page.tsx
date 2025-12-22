'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicleRenewals } from '@/lib/hooks/useVehicleRenewals';

export default function EditVehicleRenewalPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { renewals, updateRenewal, loading: hookLoading } = useVehicleRenewals();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        vehicle: '',
        renewalType: '',
        dueDate: '',
        priority: 'NORMAL'
    });

    useEffect(() => {
        if (renewals.length > 0) {
            const renewal = renewals.find(r => r.id === params.id);
            if (renewal) {
                setFormData({
                    vehicle: renewal.vehicleId,
                    renewalType: renewal.type,
                    dueDate: renewal.dueDate ? new Date(renewal.dueDate).toLocaleDateString() : '',
                    priority: renewal.priority
                });
                setLoading(false);
            }
        }
    }, [renewals, params.id]);

    const handleBack = () => {
        router.push(`/reminders/vehicle-renewals/${params.id}`);
    };

    const handleSave = async () => {
        try {
            await updateRenewal(params.id, {
                type: formData.renewalType,
                dueDate: formData.dueDate,
                priority: formData.priority
            } as any);
            router.push(`/reminders/vehicle-renewals/${params.id}`);
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            alert('Erreur lors de la modification');
        }
    };

    if (loading || hookLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle Renewal</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} data-testid="save-renewal" className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Changes</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Vehicle</label>
                            <input disabled value={formData.vehicle} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Renewal Type</label>
                            <input value={formData.renewalType} onChange={(e) => setFormData(prev => ({ ...prev, renewalType: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
