'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, Upload, Plus, X, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useIssues from '@/lib/hooks/useIssues';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import type { IssueCreateData } from '@/lib/services/issues-api';

export default function NewIssuePage() {
    const router = useRouter();
    const { createIssue } = useIssues();

    // Récupération des véhicules via la vraie API
    const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();

    // États du formulaire
    const [formData, setFormData] = useState<IssueCreateData>({
        vehicleId: '',
        summary: '',
        priority: 'MEDIUM',
        labels: [],
        assignedTo: ''
    });

    const [description, setDescription] = useState('');
    const [reportedDate, setReportedDate] = useState(() => {
        const now = new Date();
        return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    });
    const [dueDate, setDueDate] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('');
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    // États d'interface
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Données mockées temporaires pour utilisateurs (à remplacer par API Users plus tard)
    const mockUsers = [
        { id: 'user-1', name: 'Hery RABOTOVAO' },
        { id: 'user-2', name: 'John Doe' },
        { id: 'user-3', name: 'Jane Smith' }
    ];

    const mockLabels = ['Electrical', 'Mechanical', 'Body', 'Safety', 'Recall'];

    const handleCancel = () => {
        router.back();
    };

    const handleInputChange = (field: keyof IssueCreateData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null); // Clear error when user makes changes
    };

    const handleAddLabel = () => {
        if (selectedLabel && !formData.labels?.includes(selectedLabel)) {
            setFormData(prev => ({
                ...prev,
                labels: [...(prev.labels || []), selectedLabel]
            }));
            setSelectedLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            labels: (prev.labels || []).filter(label => label !== labelToRemove)
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setUploadedImages(prev => [...prev, ...files]);
        setError(null);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleCamera = () => {
        // Simulate camera capture - in real app would use camera API
        const mockFile = new File([''], 'camera-photo.jpg', { type: 'image/jpeg' });
        setUploadedImages(prev => [...prev, mockFile]);
    };

    const validateForm = (): boolean => {
        if (!formData.vehicleId) {
            setError('Veuillez sélectionner un véhicule');
            return false;
        }
        if (!formData.summary.trim()) {
            setError('Le résumé est requis');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

            await createIssue({
                ...formData,
                summary: formData.summary.trim()
            });

            setSuccess(true);

            // Redirect after short delay
            setTimeout(() => {
                router.push('/issues');
            }, 1500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème';
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

            await createIssue({
                ...formData,
                summary: formData.summary.trim()
            });

            // Reset form for new entry
            setFormData({
                vehicleId: '',
                summary: '',
                priority: 'MEDIUM',
                labels: [],
                assignedTo: ''
            });
            setDescription('');
            setSelectedLabel('');
            setUploadedImages([]);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème';
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
                        <ArrowLeft size={16} /> Issues
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Nouveau Problème</h1>
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
                        <span className="text-red-700" data-testid="error-message">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-700" data-testid="success-message">Problème créé avec succès !</span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule <span className="text-red-500">*</span></label>
                            {vehiclesError && (
                                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                    Erreur lors du chargement des véhicules: {vehiclesError}
                                </div>
                            )}
                            <select
                                data-testid="vehicle-select"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                value={formData.vehicleId}
                                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                                disabled={vehiclesLoading}
                            >
                                <option value="">{vehiclesLoading ? 'Chargement...' : 'Veuillez sélectionner'}</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.name} - {vehicle.make} {vehicle.model} ({vehicle.vin})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                            <div className="relative">
                                <select
                                    data-testid="priority-select"
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white appearance-none pl-10"
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                >
                                    <option value="LOW">Faible</option>
                                    <option value="MEDIUM">Moyenne</option>
                                    <option value="HIGH">Haute</option>
                                    <option value="CRITICAL">Critique</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-dashed border-gray-400 w-4 h-4"></div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Résumé <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                data-testid="summary-input"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                placeholder="Décrivez brièvement le problème"
                            />
                            <p className="text-xs text-gray-500 mt-1">Aperçu bref du problème</p>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={4}
                                data-testid="description-textarea"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez le problème en détail..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Étiquettes</label>
                            <div className="flex gap-2 mb-2">
                                <select
                                    className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                    value={selectedLabel}
                                    onChange={(e) => setSelectedLabel(e.target.value)}
                                >
                                    <option value="">Veuillez sélectionner</option>
                                    {mockLabels.map(label => (
                                        <option key={label} value={label}>{label}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddLabel}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium"
                                >
                                    Ajouter
                                </button>
                            </div>
                            {formData.labels && formData.labels.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.labels.map((label, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                            {label}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLabel(label)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Utilisez les étiquettes pour catégoriser et grouper.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                            <select
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                value={formData.assignedTo}
                                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                            >
                                <option value="">Veuillez sélectionner</option>
                                {mockUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Dates</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de signalement</label>
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    value={reportedDate}
                                    onChange={(e) => setReportedDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance (optionnel)</label>
                            <input
                                type="date"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Considéré en retard après cette date</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Images</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Télécharger des images</label>
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choisir fichiers
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCamera}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Prendre photo
                                </button>
                            </div>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {uploadedImages.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Fichiers sélectionnés</h4>
                                <div className="space-y-2">
                                    {uploadedImages.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <FileText size={16} className="text-gray-600" />
                                            </div>
                                            <span className="text-sm text-gray-900 flex-1">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-500">Formats supportés: JPG, PNG, GIF. Taille max: 5MB par image.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleCancel} className="text-[#008751] hover:underline text-sm font-medium">Annuler</button>
                    <div className="flex gap-3">
                        <button onClick={handleSaveAndAddAnother} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold bg-white hover:bg-gray-50">Sauvegarder et Ajouter un Autre</button>
                        <button onClick={handleSave} data-testid="save-button" className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Sauvegarder</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
