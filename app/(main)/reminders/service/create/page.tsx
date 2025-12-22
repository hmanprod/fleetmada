'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Info, HelpCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useServiceTasks } from '@/lib/hooks/useServiceTasks';

export default function CreateServiceReminderPage() {
    const router = useRouter();
    const { createReminder, loading: createLoading } = useServiceReminders();
    const { vehicles, loading: vehiclesLoading } = useVehicles();
    const { tasks, loading: tasksLoading } = useServiceTasks();

    const loading = createLoading || vehiclesLoading || tasksLoading;
    const [formData, setFormData] = useState({
        vehicle: '',
        serviceTask: '',
        timeInterval: '',
        timeIntervalUnit: 'month(s)',
        timeThreshold: '2',
        timeThresholdUnit: 'week(s)',
        meterInterval: '',
        meterIntervalUnit: 'mi',
        meterThreshold: '',
        meterThresholdUnit: 'mi',
        manualDueDate: false,
        nextDue: '',
        notifications: true,
        watcher: ''
    });

    const handleBack = () => {
        router.push('/reminders/service'); // Or just /reminders/service
    };

    const handleSave = async () => {
        try {
            // Valider les champs obligatoires
            if (!formData.vehicle || !formData.serviceTask) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Préparer les données pour l'API
            const reminderData = {
                vehicleId: formData.vehicle,
                task: formData.serviceTask,
                nextDue: formData.manualDueDate ? formData.nextDue : undefined,
                intervalMonths: formData.timeInterval ? parseInt(formData.timeInterval) : undefined,
                intervalMeter: formData.meterInterval ? parseInt(formData.meterInterval) : undefined,
                title: formData.serviceTask === 'oil_change' ? 'Changement d\'huile moteur' :
                    formData.serviceTask === 'tire_rotation' ? 'Rotation des pneus' : formData.serviceTask,
                description: `Rappel de service programmé automatiquement`
            };

            await createReminder(reminderData);
            router.push('/reminders/service');
        } catch (error) {
            console.error('Erreur lors de la création du rappel:', error);
            alert('Erreur lors de la création du rappel. Veuillez réessayer.');
        }
    };

    const handleSaveAndAddAnother = () => {
        console.log('Save and add another:', formData);
        // TODO: Implement save and reset logic
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Service Reminders
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">New Service Reminder</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} data-testid="save-reminder" className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Reminder</button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-8 px-6 grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start gap-3 text-blue-800 text-sm">
                        <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            Do multiple vehicles of the same Make/Model or Type need the same service schedule? Use a <a href="#" className="font-semibold underline">Service Program</a> instead! <a href="#" className="underline">Learn More</a>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Vehicle <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.vehicle}
                                    data-testid="vehicle-select"
                                    onChange={(e) => handleInputChange('vehicle', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                >
                                    <option value="">Please select</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Service Task <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.serviceTask}
                                    data-testid="service-task-select"
                                    onChange={(e) => handleInputChange('serviceTask', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                >
                                    <option value="">Please select</option>
                                    {tasks.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                    {/* Fallback standard tasks if none available in DB yet */}
                                    {tasks.length === 0 && (
                                        <>
                                            <option value="Engine Oil & Filter Replacement">Engine Oil & Filter Replacement</option>
                                            <option value="Tire Rotation">Tire Rotation</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <hr className="border-gray-200" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Time Interval</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Every"
                                            data-testid="time-interval-input"
                                            value={formData.timeInterval}
                                            onChange={(e) => handleInputChange('timeInterval', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <select
                                            value={formData.timeIntervalUnit}
                                            data-testid="time-interval-unit"
                                            onChange={(e) => handleInputChange('timeIntervalUnit', e.target.value)}
                                            className="w-40 p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                        >
                                            <option value="month(s)">month(s)</option>
                                            <option value="year(s)">year(s)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Time Due Soon Threshold</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.timeThreshold}
                                            onChange={(e) => handleInputChange('timeThreshold', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <select
                                            value={formData.timeThresholdUnit}
                                            onChange={(e) => handleInputChange('timeThresholdUnit', e.target.value)}
                                            className="w-40 p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                        >
                                            <option value="week(s)">week(s)</option>
                                            <option value="day(s)">day(s)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Primary Meter Interval</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-center relative">
                                        <input
                                            type="text"
                                            placeholder="Every"
                                            value={formData.meterInterval}
                                            onChange={(e) => handleInputChange('meterInterval', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <span className="absolute right-3 text-gray-500 text-sm">mi</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Primary Meter Due Soon Threshold</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-center relative">
                                        <input
                                            type="text"
                                            value={formData.meterThreshold}
                                            onChange={(e) => handleInputChange('meterThreshold', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <span className="absolute right-3 text-gray-500 text-sm">mi</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="manualDueDate"
                                    checked={formData.manualDueDate}
                                    onChange={(e) => handleInputChange('manualDueDate', e.target.checked)}
                                    className="mt-1 rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                                />
                                <label htmlFor="manualDueDate" className="text-sm">
                                    <span className="font-bold text-gray-900 block">Manually set the due date and/or meter for the next reminder</span>
                                    <span className="text-gray-500 block">Adjust the schedule by updating the next reminder's meter and/or date.</span>
                                </label>
                            </div>

                            <hr className="border-gray-200" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${formData.notifications ? 'bg-[#008751]' : 'border border-gray-300'}`}>
                                        {formData.notifications && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <label className="text-sm font-bold text-gray-900">Notifications</label>
                                </div>
                                <p className="text-sm text-gray-500 ml-7">
                                    If ON, and the user has Notification Settings enabled for Service Reminders, the user will receive a notification at 7:00 am once the reminder becomes Due Soon or Overdue, and then weekly until the Reminder is resolved.
                                </p>

                                <div className="ml-7">
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Watchers</label>
                                    <select
                                        value={formData.watcher}
                                        onChange={(e) => handleInputChange('watcher', e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                    >
                                        <option value="">Please select</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule Preview</h2>
                        <div className="text-sm text-gray-500 italic">Select a vehicle and service task to preview the schedule.</div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 flex justify-end gap-3 bg-white border-t border-gray-200 sticky bottom-0">
                <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto">Cancel</button>
                <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Reminder</button>
            </div>
        </div>
    );
}
