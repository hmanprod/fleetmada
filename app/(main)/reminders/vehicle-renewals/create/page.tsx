'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, HelpCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicleRenewals } from '@/lib/hooks/useVehicleRenewals';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { VehicleSelect } from '../../../vehicles/components/VehicleSelect';
import { ContactSelect } from '../../../contacts/components/ContactSelect';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function CreateVehicleRenewalPage() {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { createRenewal, loading: createLoading } = useVehicleRenewals();
    const { vehicles, loading: vehiclesLoading } = useVehicles();
    const { contacts, loading: contactsLoading } = useContacts({ limit: 1000 });

    const loading = createLoading || vehiclesLoading || contactsLoading;
    const [formData, setFormData] = useState({
        vehicleId: '',
        renewalType: '',
        dueDate: '',
        threshold: '3',
        thresholdUnit: 'week(s)',
        notifications: true,
        watcher: '',
        comment: ''
    });

    const handleBack = () => {
        router.push('/reminders/vehicle-renewals');
    };

    const handleSave = async () => {
        try {
            // Valider les champs obligatoires
            if (!formData.vehicleId || !formData.renewalType || !formData.dueDate) {
                toast.error('Erreur', 'Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Préparer les données pour l'API
            const renewalData = {
                vehicleId: formData.vehicleId,
                type: formData.renewalType,
                title: formData.renewalType === 'EMISSION_TEST' ? 'Test d\'émission' :
                    formData.renewalType === 'REGISTRATION' ? 'Renouvellement immatriculation' :
                        formData.renewalType === 'INSURANCE' ? 'Assurance' : 'Renouvellement',
                dueDate: new Date(formData.dueDate).toISOString(),
                priority: 'HIGH',
                notes: formData.comment,
                watchers: formData.watcher ? [formData.watcher] : []
            };

            await createRenewal(renewalData);
            toast.success('Succès', 'Rappel de renouvellement créé avec succès');

            setTimeout(() => {
                router.push('/reminders/vehicle-renewals');
            }, 1000);
        } catch (error) {
            console.error('Erreur lors de la création du renouvellement:', error);
            toast.error('Erreur', 'Erreur lors de la création du renouvellement. Veuillez réessayer.');
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
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Rappels de renouvellement
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Nouveau rappel de renouvellement</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>
                    <button onClick={handleSave} data-testid="save-renewal" disabled={loading} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2">
                        {createLoading && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer le rappel
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-6">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Véhicule <span className="text-red-500">*</span></label>
                                <VehicleSelect
                                    vehicles={vehicles as any[]}
                                    selectedVehicleId={formData.vehicleId}
                                    onSelect={(id) => handleInputChange('vehicleId', id)}
                                    loading={vehiclesLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Type de renouvellement <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.renewalType}
                                    data-testid="renewal-type-select"
                                    onChange={(e) => handleInputChange('renewalType', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                >
                                    <option value="">Veuillez sélectionner</option>
                                    <option value="EMISSION_TEST">Test d'émission</option>
                                    <option value="REGISTRATION">Immatriculation</option>
                                    <option value="INSURANCE">Assurance</option>
                                    <option value="INSPECTION">Inspection</option>
                                    <option value="OTHER">Autre</option>
                                </select>
                            </div>

                            <hr className="border-gray-200" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Date d'échéance <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            data-testid="due-date-input"
                                            value={formData.dueDate}
                                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-bold text-gray-900">Seuil d'échéance proche</label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={formData.threshold}
                                            onChange={(e) => handleInputChange('threshold', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <select
                                            value={formData.thresholdUnit}
                                            onChange={(e) => handleInputChange('thresholdUnit', e.target.value)}
                                            className="w-40 p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                                        >
                                            <option value="week(s)">semaine(s)</option>
                                            <option value="day(s)">jour(s)</option>
                                        </select>
                                    </div>
                                </div>
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
                                    Si activé, l'utilisateur recevra une notification lorsque le rappel devient "Échéance proche" ou "En retard".
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

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Commentaire</h2>
                        <textarea
                            placeholder="Ajouter un commentaire optionnel"
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="px-8 py-6 flex justify-end gap-3 bg-white border-t border-gray-200 sticky bottom-0 mt-8 -mx-6">
                    <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto">Annuler</button>
                    <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Enregistrer et ajouter un autre</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2">
                        {createLoading && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer le rappel
                    </button>
                </div>
            </div>
        </div>
    );
}
