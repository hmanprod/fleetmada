'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicleRenewals } from '@/lib/hooks/useVehicleRenewals';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function EditVehicleRenewalPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { renewals, updateRenewal, loading: hookLoading } = useVehicleRenewals();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        vehicle: '',
        renewalType: '',
        dueDate: '',
        priority: 'MEDIUM',
        notes: ''
    });

    useEffect(() => {
        if (renewals.length > 0) {
            const renewal = renewals.find(r => r.id === params.id);
            if (renewal) {
                setFormData({
                    vehicle: renewal.vehicle?.name || renewal.vehicleId,
                    renewalType: renewal.type,
                    dueDate: renewal.dueDate ? new Date(renewal.dueDate).toISOString().split('T')[0] : '',
                    priority: renewal.priority,
                    notes: renewal.notes || ''
                });
                setLoading(false);
            }
        }
    }, [renewals, params.id]);

    const handleBack = () => {
        router.back();
    };

    const handleSave = async () => {
        try {
            await updateRenewal(params.id, {
                type: formData.renewalType,
                dueDate: new Date(formData.dueDate).toISOString(),
                priority: formData.priority,
                notes: formData.notes
            } as any);

            toast.success('Succès', 'Rappel de renouvellement mis à jour avec succès');

            setTimeout(() => {
                router.back();
            }, 1000);
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            toast.error('Erreur', 'Erreur lors de la modification. Veuillez réessayer.');
        }
    };

    if (loading || hookLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Retour
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier le rappel de renouvellement</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Enregistrer les modifications</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Véhicule</label>
                            <input disabled value={formData.vehicle} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Type de renouvellement <span className="text-red-500">*</span></label>
                            <select
                                value={formData.renewalType}
                                onChange={(e) => setFormData(prev => ({ ...prev, renewalType: e.target.value }))}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="EMISSION_TEST">Test d'émission</option>
                                <option value="REGISTRATION">Immatriculation</option>
                                <option value="INSURANCE">Assurance</option>
                                <option value="INSPECTION">Inspection</option>
                                <option value="OTHER">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Date d'échéance <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Commentaire</label>
                            <textarea
                                placeholder="Ajouter un commentaire optionnel"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
