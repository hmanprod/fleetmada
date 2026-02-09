'use client';

import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, Save, Edit, Camera, MessageSquare, AlertTriangle,
    CheckCircle, X, Upload, Star, Award, TrendingUp, Calendar,
    User, MapPin, FileText, Clock, BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInspections from '@/lib/hooks/useInspections';
import type { InspectionResultData } from '@/lib/services/inspections-api';

interface InspectionResultExecution {
    inspectionItemId: string;
    resultValue: string;
    isCompliant: boolean;
    notes?: string;
    imageUrl?: string;
}

export default function InspectionEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Hooks
    const { loading, error, fetchInspectionById, updateInspection, submitInspectionResults } = useInspections();
    const [inspection, setInspection] = useState<any>(null);

    // États pour l'édition
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        inspectorName: '',
        location: '',
        notes: '',
        scheduledDate: ''
    });

    // États pour les résultats
    const [results, setResults] = useState<InspectionResultExecution[]>([]);
    const [templateItems, setTemplateItems] = useState<any[]>([]);
    const [generalNotes, setGeneralNotes] = useState('');
    const [overallScore, setOverallScore] = useState(0);

    // États d'interface
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'results'>('details');
    const [photoUploads, setPhotoUploads] = useState<{ [key: string]: string }>({});

    // Charger l'inspection
    useEffect(() => {
        const loadInspection = async () => {
            try {
                const foundInspection = await fetchInspectionById(params.id);
                setInspection(foundInspection);

                if (foundInspection) {
                    // Pré-remplir le formulaire
                    setFormData({
                        title: foundInspection.title || '',
                        description: foundInspection.description || '',
                        inspectorName: foundInspection.inspectorName || '',
                        location: foundInspection.location || '',
                        notes: foundInspection.notes || '',
                        scheduledDate: foundInspection.scheduledDate ?
                            new Date(foundInspection.scheduledDate).toISOString().slice(0, 16) : ''
                    });

                    setGeneralNotes(foundInspection.notes || '');
                    setOverallScore(foundInspection.overallScore || 0);

                    // Charger les items *réels* de l'inspection (inspection.items) pour conserver les bons IDs
                    // (les résultats et l'API /results utilisent inspectionItemId, pas templateItemId).
                    const inspectionItems = Array.isArray(foundInspection.items) ? foundInspection.items : [];
                    setTemplateItems(
                        inspectionItems.map((insItem: any) => ({
                            id: insItem.id, // inspectionItemId
                            templateItemId: insItem.templateItemId || insItem.templateItem?.id,
                            name: insItem.name || insItem.templateItem?.name || '—',
                            description: insItem.description || insItem.templateItem?.description || '',
                            category: insItem.category || insItem.templateItem?.category || 'Général',
                            isRequired: insItem.isRequired ?? insItem.templateItem?.isRequired ?? false
                        }))
                    );

                    // Charger les résultats existants
                    if (foundInspection.results && foundInspection.results.length > 0) {
                        const existingResults = foundInspection.results.map((result: any) => ({
                            inspectionItemId: result.inspectionItemId,
                            resultValue: result.resultValue ?? undefined,
                            isCompliant: result.isCompliant,
                            notes: result.notes ?? undefined,
                            imageUrl: result.imageUrl ?? undefined
                        }));
                        setResults(existingResults);
                    }
                }
            } catch (err) {
                console.error('Erreur lors du chargement:', err);
            }
        };
        loadInspection();
    }, [params.id, fetchInspectionById]);

    const handleBack = () => {
        router.push(`/inspections/history/${params.id}`);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleResultChange = (itemId: string, field: keyof InspectionResultExecution, value: any) => {
        setResults(prev => prev.map(result =>
            result.inspectionItemId === itemId
                ? { ...result, [field]: value }
                : result
        ));

        // Recalculer le score si le statut de conformité change
        if (field === 'isCompliant') {
            calculateScore();
        }
    };

    const calculateScore = () => {
        if (results.length === 0) return;

        const completedResults = results.filter(r => r.resultValue || r.notes);
        if (completedResults.length === 0) {
            setOverallScore(0);
            return;
        }

        const compliantCount = completedResults.filter(r => r.isCompliant).length;
        const score = Math.round((compliantCount / completedResults.length) * 100);
        setOverallScore(score);
    };

    const handlePhotoUpload = async (itemId: string, file: File) => {
        try {
            // TODO: Implémenter l'upload d'image via API
            const imageUrl = URL.createObjectURL(file);
            setPhotoUploads(prev => ({ ...prev, [itemId]: imageUrl }));

            handleResultChange(itemId, 'imageUrl', imageUrl);
        } catch (err) {
            console.error('Erreur lors de l\'upload:', err);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Mettre à jour les données de base
            const updatePayload: any = { ...formData };
            if (formData.scheduledDate) {
                updatePayload.scheduledDate = new Date(formData.scheduledDate).toISOString();
            } else {
                delete updatePayload.scheduledDate;
            }
            await updateInspection(params.id, updatePayload);

            // Soumettre les résultats modifiés
            if (activeTab === 'results' && results.length > 0) {
                await submitInspectionResults(params.id, {
                    results: results
                });
            }

            // Rediriger vers la page de détails
            router.push(`/inspections/history/${params.id}`);

        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
        } finally {
            setSaving(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getComplianceIcon = (isCompliant: boolean) => {
        return isCompliant ?
            <CheckCircle className="text-green-600" size={16} /> :
            <AlertTriangle className="text-red-600" size={16} />;
    };

    if (loading) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Chargement de l'inspection...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-600" size={20} />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => fetchInspectionById(params.id)}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!inspection) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Inspection non trouvée</h2>
                    <p className="text-gray-500 mb-4">L'inspection demandée n'existe pas ou a été supprimée.</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-[#008751] text-white rounded hover:bg-[#007043]"
                    >
                        Retour aux inspections
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Détails
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier l'Inspection</h1>
                    <span className="text-sm text-gray-500 ml-2">#{inspection.id.slice(-6)}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <Save size={16} /> Sauvegarder
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-[1600px] mx-auto px-6 pt-6">
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'details'
                            ? 'text-[#008751] border-b-2 border-[#008751]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Informations Générales
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'results'
                            ? 'text-[#008751] border-b-2 border-[#008751]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Résultats & Évaluation
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Détails Tab */}
                        {activeTab === 'details' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-900">Informations de l'Inspection</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                                            <input
                                                type="text"
                                                name="title"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#008751] focus:border-[#008751]"
                                                value={formData.title}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                placeholder="Titre de l'inspection"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Inspecteur</label>
                                            <input
                                                type="text"
                                                name="inspectorName"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#008751] focus:border-[#008751]"
                                                value={formData.inspectorName}
                                                onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                                                placeholder="Nom de l'inspecteur"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#008751] focus:border-[#008751]"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Description de l'inspection"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#008751] focus:border-[#008751]"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                placeholder="Lieu de l'inspection"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Programmée</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#008751] focus:border-[#008751]"
                                                value={formData.scheduledDate}
                                                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes Générales</label>
                                        <textarea
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#008751] focus:border-[#008751]"
                                            value={generalNotes}
                                            onChange={(e) => setGeneralNotes(e.target.value)}
                                            placeholder="Notes et commentaires généraux"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Résultats Tab */}
                        {activeTab === 'results' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-gray-900">Résultats de l'Inspection</h2>
                                    <div className="flex items-center gap-2">
                                        <Award className="text-yellow-500" size={20} />
                                        <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
                                            {overallScore}%
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {templateItems.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-gray-500">Aucun élément d'inspection disponible</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {templateItems.map((item) => {
                                                const result = results.find(r => r.inspectionItemId === item.id) || {
                                                    inspectionItemId: item.id,
                                                    resultValue: '',
                                                    isCompliant: true,
                                                    notes: '',
                                                    imageUrl: undefined
                                                };

                                                return (
                                                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                                                    {item.name}
                                                                    {item.isRequired && <span className="text-red-500">*</span>}
                                                                </h3>
                                                                {item.description && (
                                                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                                                )}
                                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                                                                    {item.category}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getComplianceIcon(result.isCompliant)}
                                                                <button
                                                                    onClick={() => {
                                                                        const fileInput = document.createElement('input');
                                                                        fileInput.type = 'file';
                                                                        fileInput.accept = 'image/*';
                                                                        fileInput.onchange = (e) => {
                                                                            const file = (e.target as HTMLInputElement).files?.[0];
                                                                            if (file) handlePhotoUpload(item.id, file);
                                                                        };
                                                                        fileInput.click();
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                                    title="Ajouter une photo"
                                                                >
                                                                    <Camera size={16} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Valeur mesurée */}
                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                                                value={result.resultValue}
                                                                onChange={(e) => handleResultChange(item.id, 'resultValue', e.target.value)}
                                                                placeholder="Valeur mesurée ou observée"
                                                            />
                                                        </div>

                                                        {/* Statut de conformité */}
                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleResultChange(item.id, 'isCompliant', true)}
                                                                    className={`px-3 py-1 text-xs rounded border ${result.isCompliant
                                                                        ? 'bg-green-100 border-green-300 text-green-700'
                                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    <CheckCircle size={14} className="inline mr-1" />
                                                                    Conforme
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResultChange(item.id, 'isCompliant', false)}
                                                                    className={`px-3 py-1 text-xs rounded border ${!result.isCompliant
                                                                        ? 'bg-red-100 border-red-300 text-red-700'
                                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    <AlertTriangle size={14} className="inline mr-1" />
                                                                    Non-Conforme
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Notes */}
                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                                            <textarea
                                                                rows={2}
                                                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                                                value={result.notes}
                                                                onChange={(e) => handleResultChange(item.id, 'notes', e.target.value)}
                                                                placeholder="Commentaires et observations"
                                                            />
                                                        </div>

                                                        {/* Photo */}
                                                        {(result.imageUrl || photoUploads[item.id]) && (
                                                            <div className="mt-3">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                                                <div className="relative inline-block">
                                                                    <img
                                                                        src={result.imageUrl || photoUploads[item.id]}
                                                                        alt="Photo de l'élément"
                                                                        className="w-32 h-32 object-cover rounded border"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            setPhotoUploads(prev => {
                                                                                const newUploads = { ...prev };
                                                                                delete newUploads[item.id];
                                                                                return newUploads;
                                                                            });
                                                                            handleResultChange(item.id, 'imageUrl', undefined);
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Informations du véhicule */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Véhicule</h3>
                            </div>
                            <div className="p-4">
                                {inspection.vehicle ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                                <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${inspection.vehicle.id}`} className="w-full h-full object-cover" alt="Vehicle" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {inspection.vehicle.make} {inspection.vehicle.model}
                                                </div>
                                                <div className="text-xs text-gray-500">{inspection.vehicle.vin}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">Aucun véhicule associé</p>
                                )}
                            </div>
                        </div>

                        {/* Modèle d'inspection */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Modèle</h3>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-900 font-medium">
                                    {inspection.inspectionTemplate?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {inspection.inspectionTemplate?.category || ''}
                                </p>
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Statistiques</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Éléments évalués</span>
                                    <span className="text-sm font-medium">{results.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Conformes</span>
                                    <span className="text-sm font-medium text-green-600">
                                        {results.filter(r => r.isCompliant).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Non-conformes</span>
                                    <span className="text-sm font-medium text-red-600">
                                        {results.filter(r => !r.isCompliant).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm text-gray-600">Score global</span>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className={getScoreColor(overallScore)} size={16} />
                                        <span className={`font-bold ${getScoreColor(overallScore)}`}>
                                            {overallScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Actions</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#008751] hover:bg-[#007043] text-white rounded text-sm font-medium disabled:opacity-50"
                                >
                                    <Save size={16} /> Sauvegarder
                                </button>
                                <button
                                    onClick={handleBack}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium"
                                >
                                    <ArrowLeft size={16} /> Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
