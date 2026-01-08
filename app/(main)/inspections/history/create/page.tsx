'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, Plus, X, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInspections from '@/lib/hooks/useInspections';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import { useVehicles } from '@/lib/hooks/useVehicles';
import type { InspectionCreateData, InspectionTemplate } from '@/lib/services/inspections-api';

export default function NewInspectionPage() {
    const router = useRouter();
    const { createInspection } = useInspections();
    const { templates, loading: templatesLoading, fetchTemplates } = useInspectionTemplates();
    const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();

    // États du formulaire
    const [formData, setFormData] = useState<InspectionCreateData>({
        vehicleId: '',
        inspectionTemplateId: '',
        title: '',
        description: '',
        scheduledDate: '',
        inspectorName: '',
        location: '',
        notes: ''
    });

    // États d'interface
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Charger les données au montage
    useEffect(() => {
        fetchVehicles();
        fetchTemplates();
    }, []);

    const handleCancel = () => {
        router.back();
    };

    const handleInputChange = (field: keyof InspectionCreateData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.vehicleId) {
            setError('Veuillez sélectionner un véhicule');
            return false;
        }
        if (!formData.inspectionTemplateId) {
            setError('Veuillez sélectionner un modèle d\'inspection');
            return false;
        }
        if (!formData.title.trim()) {
            setError('Le titre est requis');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

            const newInspection = await createInspection({
                ...formData,
                title: formData.title.trim()
            });

            setSuccess(true);

            // Redirect after short delay
            setTimeout(() => {
                router.push(`/inspections/history/${newInspection.id}`);
            }, 1500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'inspection';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndAddAnother = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

            await createInspection({
                ...formData,
                title: formData.title.trim()
            });

            // Reset form for new entry
            setFormData({
                vehicleId: '',
                inspectionTemplateId: '',
                title: '',
                description: '',
                scheduledDate: '',
                inspectorName: '',
                location: '',
                notes: ''
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'inspection';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Historique
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Planifier une nouvelle Inspection</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Sauvegarder</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Messages d'état */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-700">Inspection créée avec succès !</span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Détails de l'Inspection</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule <span className="text-red-500">*</span></label>
                            {vehiclesLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                                </div>
                            ) : vehicles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText size={24} className="mx-auto mb-2 opacity-50" />
                                    <p>Aucun véhicule disponible</p>
                                    <p className="text-sm">Contactez votre administrateur pour ajouter des véhicules.</p>
                                </div>
                            ) : (
                                <select
                                    name="vehicleId"
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                    value={formData.vehicleId}
                                    onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                                >
                                    <option value="">Veuillez sélectionner</option>
                                    {vehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name} - {vehicle.make} {vehicle.model} ({vehicle.vin})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle d'Inspection <span className="text-red-500">*</span></label>
                            {templatesLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText size={24} className="mx-auto mb-2 opacity-50" />
                                    <p>Aucun modèle d'inspection disponible</p>
                                    <p className="text-sm">Contactez votre administrateur pour créer des modèles d'inspection.</p>
                                </div>
                            ) : (
                                <select
                                    name="inspectionTemplateId"
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                    value={formData.inspectionTemplateId}
                                    onChange={(e) => handleInputChange('inspectionTemplateId', e.target.value)}
                                >
                                    <option value="">Veuillez sélectionner</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} ({template.category})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Entrez le titre de l'inspection"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Description optionnelle de l'inspection..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'Inspecteur</label>
                            <input
                                type="text"
                                name="inspectorName"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.inspectorName}
                                onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                                placeholder="Nom de l'inspecteur"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="Lieu de l'inspection"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Planification</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Programmée</label>
                            <input
                                type="datetime-local"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.scheduledDate}
                                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Laissez vide pour une inspection immédiate</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows={3}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Notes supplémentaires..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleCancel} className="text-[#008751] hover:underline text-sm font-medium">Retour à l'historique</button>
                    <div className="flex gap-3">
                        <button onClick={handleSaveAndAddAnother} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold bg-white hover:bg-gray-50">Sauvegarder et Ajouter un Autre</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Sauvegarder</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
