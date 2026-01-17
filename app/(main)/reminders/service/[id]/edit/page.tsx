'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Info, HelpCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useServiceTasks } from '@/lib/hooks/useServiceTasks';
import { useContacts } from '@/lib/hooks/useContacts';
import { remindersApi } from '@/lib/services/reminders-api';
import { VehicleSelect } from '@/app/(main)/vehicles/components/VehicleSelect';
import { ContactSelect } from '@/app/(main)/contacts/components/ContactSelect';
import { ServiceTaskSelect } from '@/app/(main)/service/components/ServiceTaskSelect';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function EditServiceReminderPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { updateReminder, loading: updateLoading } = useServiceReminders();
    const { vehicles, loading: vehiclesLoading } = useVehicles();
    const { tasks, loading: tasksLoading } = useServiceTasks();
    const { contacts, loading: contactsLoading } = useContacts({ limit: 1000 });

    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        vehicle: '',
        serviceTaskId: '',
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
        nextDueMeter: '',
        notifications: true,
        watcher: ''
    });

    const loadReminder = useCallback(async () => {
        try {
            setFetching(true);
            const reminder = await remindersApi.getServiceReminder(params.id);
            if (reminder) {
                // Déterminer l'unité de l'intervalle de temps
                let intervalValue = reminder.intervalMonths?.toString() || '';
                let intervalUnit = 'month(s)';

                setFormData({
                    vehicle: reminder.vehicleId,
                    serviceTaskId: reminder.serviceTaskId || '',
                    serviceTask: reminder.task || reminder.title || '',
                    timeInterval: intervalValue,
                    timeIntervalUnit: intervalUnit,
                    timeThreshold: reminder.timeThreshold?.toString() || '2',
                    timeThresholdUnit: reminder.timeThresholdUnit || 'week(s)',
                    meterInterval: reminder.intervalMeter?.toString() || '',
                    meterIntervalUnit: 'km',
                    meterThreshold: reminder.meterThreshold?.toString() || '',
                    meterThresholdUnit: 'km',
                    manualDueDate: !!(reminder.nextDue || reminder.nextDueMeter),
                    nextDue: reminder.nextDue ? new Date(reminder.nextDue).toISOString().split('T')[0] : '',
                    nextDueMeter: reminder.nextDueMeter?.toString() || '',
                    notifications: true,
                    watcher: reminder.watchers?.[0] || ''
                });
            } else {
                toast.error('Erreur', 'Rappel non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors du chargement du rappel:', error);
            toast.error('Erreur', 'Impossible de charger le rappel');
        } finally {
            setFetching(false);
        }
    }, [params.id, toast]);

    useEffect(() => {
        loadReminder();
    }, [loadReminder]);

    const loading = updateLoading || vehiclesLoading || tasksLoading || contactsLoading || fetching;

    const handleBack = () => {
        router.push(`/reminders/service/${params.id}`);
    };

    const handleSave = async () => {
        try {
            // Valider les champs obligatoires
            if (!formData.vehicle || (!formData.serviceTaskId && !formData.serviceTask)) {
                toast.error('Erreur', 'Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Calculer l'intervalle en mois si l'unité est "year(s)"
            let intervalMonths = formData.timeInterval ? parseInt(formData.timeInterval) : undefined;
            if (intervalMonths && formData.timeIntervalUnit === 'year(s)') {
                intervalMonths *= 12;
            }

            // Déterminer le type de rappel
            let type: 'date' | 'meter' | 'both' = 'date';
            if (formData.timeInterval && formData.meterInterval) {
                type = 'both';
            } else if (formData.meterInterval) {
                type = 'meter';
            }

            // Préparer les données pour l'API
            const isFallback = ['oil_change', 'tire_rotation'].includes(formData.serviceTaskId);
            const reminderData = {
                vehicleId: formData.vehicle,
                serviceTaskId: isFallback ? undefined : (formData.serviceTaskId || undefined),
                task: formData.serviceTask,
                nextDue: formData.manualDueDate && formData.nextDue ? new Date(formData.nextDue).toISOString() : undefined,
                nextDueMeter: formData.manualDueDate && formData.nextDueMeter ? parseFloat(formData.nextDueMeter) : undefined,
                intervalMonths,
                intervalMeter: formData.meterInterval ? parseFloat(formData.meterInterval) : undefined,
                type,
                title: formData.serviceTask,
                description: `Rappel de service programmé pour ${formData.serviceTask}`,
                watchers: formData.watcher ? [formData.watcher] : [],
                timeThreshold: formData.timeThreshold ? parseInt(formData.timeThreshold) : undefined,
                timeThresholdUnit: formData.timeThresholdUnit,
                meterThreshold: formData.meterThreshold ? parseFloat(formData.meterThreshold) : undefined
            };

            await updateReminder(params.id, reminderData);
            toast.success('Succès', 'Rappel de service mis à jour avec succès');

            setTimeout(() => {
                router.push(`/reminders/service/${params.id}`);
            }, 1000);
        } catch (error) {
            console.error('Erreur lors de la modification du rappel:', error);
            toast.error('Erreur', 'Erreur lors de la modification du rappel. Veuillez réessayer.');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Rappels de service
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier le rappel de service</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>
                    <button onClick={handleSave} data-testid="save-reminder" disabled={loading} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2">
                        {updateLoading && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer les modifications
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-6">
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start gap-3 text-blue-800 text-sm">
                        <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            Plusieurs véhicules de la même marque/modèle ou du même type ont-ils besoin du même calendrier d'entretien ? Utilisez un <a href="#" className="font-semibold underline">Programme d'entretien</a> à la place ! <a href="#" className="underline">En savoir plus</a>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Véhicule <span className="text-red-500">*</span></label>
                                <VehicleSelect
                                    vehicles={vehicles as any[]}
                                    selectedVehicleId={formData.vehicle}
                                    onSelect={(id) => handleInputChange('vehicle', id)}
                                    loading={vehiclesLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Tâche de service <span className="text-red-500">*</span></label>
                                <ServiceTaskSelect
                                    tasks={tasks}
                                    selectedTaskId={formData.serviceTaskId}
                                    onSelect={(id, name) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            serviceTaskId: id,
                                            serviceTask: name
                                        }));
                                    }}
                                    loading={tasksLoading}
                                    fallbackTasks={[
                                        { id: 'oil_change', name: 'Remplacement huile moteur et filtre' },
                                        { id: 'tire_rotation', name: 'Rotation des pneus' }
                                    ]}
                                />
                            </div>

                            <hr className="border-gray-200" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Intervalle de temps</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Tous les"
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
                                            <option value="month(s)">mois</option>
                                            <option value="year(s)">an(s)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Seuil d'échéance proche (temps)</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={formData.timeThreshold}
                                            onChange={(e) => handleInputChange('timeThreshold', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <select
                                            value={formData.timeThresholdUnit}
                                            onChange={(e) => handleInputChange('timeThresholdUnit', e.target.value)}
                                            className="w-40 p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                        >
                                            <option value="week(s)">semaine(s)</option>
                                            <option value="day(s)">jour(s)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Intervalle de kilométrage</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-center relative">
                                        <input
                                            type="number"
                                            placeholder="Tous les"
                                            value={formData.meterInterval}
                                            onChange={(e) => handleInputChange('meterInterval', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <span className="absolute right-3 text-gray-500 text-sm">km</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Seuil d'échéance proche (km)</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-center relative">
                                        <input
                                            type="number"
                                            value={formData.meterThreshold}
                                            onChange={(e) => handleInputChange('meterThreshold', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <span className="absolute right-3 text-gray-500 text-sm">km</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="manualDueDate"
                                        checked={formData.manualDueDate}
                                        onChange={(e) => handleInputChange('manualDueDate', e.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                                    />
                                    <label htmlFor="manualDueDate" className="text-sm">
                                        <span className="font-bold text-gray-900 block">Définir manuellement la date d'échéance et/ou le kilométrage pour le prochain rappel</span>
                                        <span className="text-gray-500 block">Ajustez le calendrier en mettant à jour le kilométrage et/ou la date du prochain rappel.</span>
                                    </label>
                                </div>

                                {formData.manualDueDate && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-7 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-1">Prochaine date d'échéance</label>
                                            <input
                                                type="date"
                                                value={formData.nextDue}
                                                onChange={(e) => handleInputChange('nextDue', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-1">Prochain kilométrage</label>
                                            <input
                                                type="number"
                                                value={formData.nextDueMeter}
                                                onChange={(e) => handleInputChange('nextDueMeter', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                                placeholder="ex: 50000"
                                            />
                                        </div>
                                    </div>
                                )}
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
                                    Si activé, l'utilisateur recevra une notification à 7h00 une fois que le rappel devient "Échéance proche" ou "En retard", puis chaque semaine jusqu'à ce que le rappel soit résolu.
                                </p>

                                <div className="ml-7">
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Observateurs</label>
                                    <ContactSelect
                                        contacts={contacts}
                                        selectedContactId={formData.watcher}
                                        onSelect={(id) => handleInputChange('watcher', id)}
                                        loading={contactsLoading}
                                        placeholder="Veuillez sélectionner un observateur"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 flex justify-end gap-3 bg-white border-t border-gray-200 sticky bottom-0 mt-8">
                    <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto">Annuler</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2">
                        {updateLoading && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer les modifications
                    </button>
                </div>
            </div>
        </div>
    );
}
