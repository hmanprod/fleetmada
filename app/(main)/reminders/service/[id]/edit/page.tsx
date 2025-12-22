'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';

export default function EditServiceReminderPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { reminders, updateReminder, loading: hookLoading } = useServiceReminders();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        vehicle: '',
        serviceTask: '',
        timeInterval: '',
        timeIntervalUnit: 'month(s)',
        meterInterval: '',
        meterIntervalUnit: 'mi',
        manualNextDue: '12/14/2025'
    });

    useEffect(() => {
        if (reminders.length > 0) {
            const reminder = reminders.find(r => r.id === params.id);
            if (reminder) {
                setFormData({
                    vehicle: reminder.vehicleId,
                    serviceTask: reminder.serviceTaskId || reminder.task || '',
                    timeInterval: reminder.intervalMonths?.toString() || '',
                    timeIntervalUnit: 'month(s)',
                    meterInterval: reminder.intervalMeter?.toString() || '',
                    meterIntervalUnit: 'mi',
                    manualNextDue: reminder.nextDue ? new Date(reminder.nextDue).toLocaleDateString() : ''
                });
                setLoading(false);
            }
        }
    }, [reminders, params.id]);

    const handleBack = () => {
        router.push(`/reminders/service/${params.id}`);
    };

    const handleSave = async () => {
        try {
            await updateReminder(params.id, {
                vehicleId: formData.vehicle,
                serviceTaskId: formData.serviceTask,
                intervalMonths: parseInt(formData.timeInterval) || undefined,
                intervalMeter: parseInt(formData.meterInterval) || undefined,
                nextDue: formData.manualNextDue
            } as any);
            router.push(`/reminders/service/${params.id}`);
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            alert('Erreur lors de la modification');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                    <h1 className="text-2xl font-bold text-gray-900">Edit Service Reminder</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} data-testid="save-reminder" className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Changes</button>
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
                            <label className="block text-sm font-bold text-gray-900 mb-1">Service Task</label>
                            <input disabled value={formData.serviceTask} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
