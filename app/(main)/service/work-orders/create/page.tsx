'use client';

import React, { useState } from 'react';
import { ChevronDown, Loader2, ChevronLeft, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceWorkOrders } from '@/lib/hooks/useServiceWorkOrders';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { VehicleSelect } from '@/app/(main)/vehicles/components/VehicleSelect';
import { ContactSelect } from '@/app/(main)/contacts/components/ContactSelect';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function WorkOrderCreatePage() {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { createWorkOrder, loading: saving } = useServiceWorkOrders();
    const { vehicles, loading: vehiclesLoading } = useVehicles();
    const { contacts, loading: contactsLoading } = useContacts({ limit: 1000 });

    const [formData, setFormData] = useState({
        vehicleId: '',
        status: 'SCHEDULED',
        priority: 'MEDIUM',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        issuedBy: 'Hery RABOTOVAO',
        scheduledStartDate: new Date().toISOString().split('T')[0],
        scheduledStartTime: '08:00',
        actualStartDate: '',
        actualStartTime: '',
        expectedCompletionDate: '',
        expectedCompletionTime: '',
        actualCompletionDate: '',
        actualCompletionTime: '',
        assignedToContactId: '',
        labels: [] as string[],
        vendorId: '',
        invoiceNumber: '',
        poNumber: '',
        sendScheduledStartReminder: false,
        useMeterForCompletion: false,
        notes: '',
        tasks: [] as any[],
    });

    const handleBack = () => {
        router.push('/service/work-orders');
    };

    const handleSave = async (andClose = true) => {
        if (!formData.vehicleId) {
            toast.error('Erreur', 'Veuillez sélectionner un véhicule');
            return;
        }

        try {
            const result = await createWorkOrder({
                vehicleId: formData.vehicleId,
                date: formData.date,
                status: formData.status as any,
                priority: formData.priority as any,
                assignedToContactId: formData.assignedToContactId || undefined,
                vendorId: formData.vendorId || undefined,
                notes: formData.notes,
                isWorkOrder: true,
                tasks: formData.tasks,
            });

            if (result) {
                toast.success('Succès', 'Ordre de travail créé avec succès');
                if (andClose) {
                    setTimeout(() => router.push('/service/work-orders'), 1500);
                } else {
                    // Reset form or handle "Save and New"
                }
            }
        } catch (error) {
            toast.error('Erreur', 'Impossible de créer l\'ordre de travail');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* ZONE 1: HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium text-sm">
                        <ChevronLeft size={18} /> Demandes d'entretien
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">Nouvel ordre de travail</h1>
                        <span className="text-sm text-gray-400 font-medium">1/1</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">Annuler</button>
                    <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
                        <button className="px-4 py-2 text-gray-700 font-bold text-sm hover:bg-gray-50 border-r border-gray-300 transition-colors">
                            Enregistrer et ...
                        </button>
                        <button className="px-2 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                            <ChevronDown size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer l'ordre
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 flex-1 w-full pb-32">
                {/* Section Détails */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Véhicule <span className="text-red-500">*</span></label>
                            <VehicleSelect
                                vehicles={vehicles as any[]}
                                selectedVehicleId={formData.vehicleId}
                                onSelect={(id) => handleInputChange('vehicleId', id)}
                                loading={vehiclesLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Statut <span className="text-red-500">*</span></label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 'SCHEDULED'}
                                        onChange={() => handleInputChange('status', 'SCHEDULED')}
                                        className="text-[#008751] focus:ring-[#008751] w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-900 group-hover:text-[#008751] transition-colors">Ouvert</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Priorité de réparation</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751] outline-none transition-all"
                            >
                                <option value="LOW">Faible</option>
                                <option value="MEDIUM">Moyenne</option>
                                <option value="HIGH">Élevée</option>
                                <option value="CRITICAL">Critique</option>
                            </select>
                            <p className="mt-2 text-xs text-gray-500 italic">La classe de priorité (Code VMRS Key 16) est un moyen simple de classer si un service ou une réparation était planifié, non planifié ou une urgence.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date d'émission</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Heure</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Émis par</label>
                            <input
                                type="text"
                                value={formData.issuedBy}
                                onChange={(e) => handleInputChange('issuedBy', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                            />
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date de début planifiée</label>
                                <input
                                    type="date"
                                    value={formData.scheduledStartDate}
                                    onChange={(e) => handleInputChange('scheduledStartDate', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Heure</label>
                                <input
                                    type="time"
                                    value={formData.scheduledStartTime}
                                    onChange={(e) => handleInputChange('scheduledStartTime', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sendReminder"
                                    checked={formData.sendScheduledStartReminder}
                                    onChange={(e) => handleInputChange('sendScheduledStartReminder', e.target.checked)}
                                    className="rounded border-gray-300 text-[#008751] focus:ring-[#008751] w-4 h-4"
                                />
                                <label htmlFor="sendReminder" className="text-sm font-medium text-gray-700 cursor-pointer">Envoyer un rappel de date de début planifiée</label>
                            </div>
                            <p className="text-xs text-gray-500 ml-6">Cochez cette case si vous souhaitez envoyer une notification de rappel.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Assigné à</label>
                            <ContactSelect
                                contacts={contacts}
                                selectedContactId={formData.assignedToContactId}
                                onSelect={(id) => handleInputChange('assignedToContactId', id)}
                                loading={contactsLoading}
                                placeholder="Sélectionner un assigné"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Vendeur</label>
                            <ContactSelect
                                contacts={contacts}
                                selectedContactId={formData.vendorId}
                                onSelect={(id) => handleInputChange('vendorId', id)}
                                loading={contactsLoading}
                                placeholder="Sélectionner un vendeur"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Numéro de facture</label>
                                <input
                                    type="text"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Numéro de BC (PO)</label>
                                <input
                                    type="text"
                                    value={formData.poNumber}
                                    onChange={(e) => handleInputChange('poNumber', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Problèmes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[200px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Problèmes</h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-sm font-medium">Sélectionnez d'abord un véhicule.</p>
                    </div>
                </div>

                {/* Section Éléments de ligne */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[200px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Éléments de ligne</h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-sm font-medium">Sélectionnez d'abord un véhicule.</p>
                    </div>
                </div>

                {/* Photos & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-primary">Photos</h2>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group">
                            <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-green-50 transition-colors">
                                <Upload size={32} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des photos</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">ou cliquez pour parcourir vos fichiers</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-primary">Documents</h2>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group">
                            <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-green-50 transition-colors">
                                <Upload size={32} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des documents</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">ou cliquez pour parcourir vos fichiers</p>
                        </div>
                    </div>
                </div>

                {/* Commentaires */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Commentaires</h2>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#008751] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-green-100">HR</div>
                        <textarea
                            className="flex-1 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-green-100 focus:border-[#008751] transition-all outline-none text-sm"
                            placeholder="Ajouter un commentaire optionnel..."
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* ZONE 3: STICKY FOOTER */}
            <div className="bg-white border-t border-gray-200 px-8 py-4 sticky bottom-0 z-30 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <button onClick={handleBack} className="text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors">Annuler</button>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
                        <button className="px-4 py-2 text-gray-700 font-bold text-sm hover:bg-gray-50 border-r border-gray-300 transition-colors">
                            Enregistrer et ...
                        </button>
                        <button className="px-2 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                            <ChevronDown size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer l'ordre
                    </button>
                </div>
            </div>
        </div>
    );
}
