'use client';

import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, MoreHorizontal, Edit, Play, CheckCircle, AlertCircle,
    Camera, FileText, Clock, Check, X, AlertTriangle,
    Upload, Save, Flag, MessageSquare, Star, Award, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInspections from '@/lib/hooks/useInspections';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import ScoringSystem from '../../components/ScoringSystem';
import type { InspectionResultData, InspectionTemplateItem } from '@/lib/services/inspections-api';

// Utiliser les types de l'API directement
type InspectionItemExecution = {
    status: 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';
    value?: string;
    notes?: string;
    imageUrl?: string;
};

export default function InspectionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Hooks
    const { loading, error, fetchInspectionById, updateInspection, completeInspection, startInspection, submitInspectionResults } = useInspections();
    const { getTemplateItems } = useInspectionTemplates();
    const [inspection, setInspection] = useState<any>(null);

    const [executionResults, setExecutionResults] = useState<{ [key: string]: InspectionItemExecution }>({});
    const [inspectionItems, setInspectionItems] = useState<any[]>([]);
    const [generalNotes, setGeneralNotes] = useState('');

    // États d'interface
    const [activeTab, setActiveTab] = useState<'details' | 'execution' | 'results'>('details');

    // Charger l'inspection au montage
    useEffect(() => {
        const loadInspectionData = async () => {
            try {
                const data = await fetchInspectionById(params.id);
                setInspection(data);

                if (data.items && data.items.length > 0) {
                    setInspectionItems(data.items);
                } else if (data?.inspectionTemplateId) {
                    loadInspectionItems(data.inspectionTemplateId);
                }

                // Initialiser les résultats d'exécution s'ils existent
                if (data.results && data.results.length > 0) {
                    const initialResults: { [key: string]: InspectionItemExecution } = {};
                    data.results.forEach((result: any) => {
                        initialResults[result.inspectionItemId] = {
                            status: result.isCompliant ? 'PASSED' : 'FAILED',
                            value: result.resultValue,
                            notes: result.notes,
                            imageUrl: result.imageUrl || (result.images && result.images[0])
                        };
                    });
                    setExecutionResults(initialResults);
                }
            } catch (err) {
                console.error('Erreur lors du chargement de l\'inspection:', err);
            }
        };
        loadInspectionData();
    }, [params.id, fetchInspectionById]);

    const loadInspectionItems = async (templateId: string) => {
        try {
            const items = await getTemplateItems(templateId);
            setInspectionItems(items);
        } catch (err) {
            console.error('Erreur lors du chargement des items:', err);
        }
    };

    const handleBack = () => {
        router.push('/inspections/history');
    };

    const handleEdit = () => {
        router.push(`/inspections/history/${params.id}/edit`);
    };

    const calculateOverallScore = (): number => {
        if (inspectionItems.length === 0) return 0;

        const totalItems = inspectionItems.length;
        const passedItems = Object.values(executionResults).filter(r => r.status === 'PASSED').length;
        const notApplicableItems = Object.values(executionResults).filter(r => r.status === 'NOT_APPLICABLE').length;

        // Calculer le score basé sur les éléments applicables uniquement
        const applicableItems = totalItems - notApplicableItems;
        if (applicableItems === 0) return 100;

        return Math.round((passedItems / applicableItems) * 100);
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-500 text-white border-gray-600';
            case 'SCHEDULED': return 'bg-blue-500 text-white border-blue-600';
            case 'IN_PROGRESS': return 'bg-yellow-500 text-white border-yellow-600';
            case 'COMPLETED': return 'bg-green-600 text-white border-green-700';
            case 'CANCELLED': return 'bg-red-500 text-white border-red-600';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const getComplianceColor = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return 'text-green-600 bg-green-50';
            case 'NON_COMPLIANT': return 'text-red-600 bg-red-50';
            case 'PENDING_REVIEW': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
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
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => fetchInspectionById(params.id).then(setInspection)}
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
                        <ArrowLeft size={16} /> Historique
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{inspection.title}</h1>
                    <span className={`status-badge text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(inspection.status)}`}>{inspection.status}</span>
                </div>

                <div className="flex gap-2">
                    <button className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    {(inspection.status === 'DRAFT' || inspection.status === 'SCHEDULED' || inspection.status === 'IN_PROGRESS') && (
                        <button
                            onClick={() => router.push(`/inspections/forms/${inspection.inspectionTemplateId}/start`)}
                            data-testid="start-inspection-button"
                            className="px-3 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded flex items-center gap-2 text-sm shadow-sm"
                        >
                            <Play size={16} /> {inspection.status === 'IN_PROGRESS' ? 'Continuer' : 'Démarrer'}
                        </button>
                    )}
                    {inspection.status === 'COMPLETED' && (
                        <button
                            onClick={handleEdit}
                            className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm"
                        >
                            <Edit size={16} /> Modifier
                        </button>
                    )}
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
                        Détails
                    </button>
                    <button
                        onClick={() => setActiveTab('execution')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'execution'
                            ? 'text-[#008751] border-b-2 border-[#008751]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Résultat de l'inspection
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'results'
                            ? 'text-[#008751] border-b-2 border-[#008751]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Synthèse
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Détails Tab */}
                    {activeTab === 'details' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Détails de l'Inspection</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">N° Inspection</div>
                                        <div className="text-sm text-gray-900">#{inspection.id.slice(-6)}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Statut</div>
                                        <div><span className={`status-badge text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(inspection.status)}`}>{inspection.status}</span></div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Titre</div>
                                        <div className="text-sm text-gray-900">{inspection.title}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Description</div>
                                        <div className="text-sm text-gray-900">{inspection.description || '—'}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Véhicule</div>
                                        <div className="flex items-center gap-2">
                                            {inspection.vehicle ? (
                                                <>
                                                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${inspection.vehicle.id}`} className="w-full h-full object-cover" alt="Vehicle" />
                                                    </div>
                                                    <span className="text-[#008751] font-medium hover:underline cursor-pointer">
                                                        {inspection.vehicle.make} {inspection.vehicle.model}
                                                    </span>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{inspection.vehicle.vin}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Modèle</div>
                                        <div className="text-sm text-gray-900">{inspection.inspectionTemplate?.name || 'N/A'}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Inspecteur</div>
                                        <div className="text-sm text-gray-900">{inspection.inspectorName || '—'}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Lieu</div>
                                        <div className="text-sm text-gray-900">{inspection.location || '—'}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Date Programmée</div>
                                        <div className="text-sm text-gray-900">{inspection.scheduledDate ? formatDate(inspection.scheduledDate) : '—'}</div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Statut Conformité</div>
                                        <div>
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getComplianceColor(inspection.complianceStatus)}`}>{inspection.complianceStatus}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Score Global</div>
                                        <div className="text-sm text-gray-900">
                                            {inspection.overallScore ? (
                                                <span className={`font-bold ${getScoreColor(inspection.overallScore)}`}>
                                                    {inspection.overallScore}%
                                                </span>
                                            ) : '—'}
                                        </div>
                                    </div>

                                    {inspection.notes && (
                                        <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                            <div className="text-sm text-gray-500">Notes</div>
                                            <div className="text-sm text-gray-900">{inspection.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Résultat de l'inspection Tab (formerly Execution) */}
                    {activeTab === 'execution' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Résultat de l'inspection</h2>
                                {(inspection.status === 'DRAFT' || inspection.status === 'SCHEDULED') && (
                                    <button
                                        onClick={() => router.push(`/inspections/forms/${inspection.inspectionTemplateId}/start`)}
                                        className="px-3 py-1 bg-[#008751] hover:bg-[#007043] text-white rounded text-sm"
                                    >
                                        Démarrer l'Inspection
                                    </button>
                                )}
                            </div>
                            <div className="p-6">
                                {inspectionItems.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500">Aucun élément d'inspection disponible</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {inspectionItems.map((item, index) => {
                                            const result = executionResults[item.id] || { status: 'PENDING' };
                                            return (
                                                <div key={item.id} className="inspection-item border border-gray-200 rounded-lg p-4 bg-gray-50/50">
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
                                                        <div>
                                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${result.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                                                                result.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                                    result.status === 'NOT_APPLICABLE' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {result.status === 'PASSED' && 'CONFORME'}
                                                                {result.status === 'FAILED' && 'NON-CONFORME'}
                                                                {result.status === 'NOT_APPLICABLE' && 'N/A'}
                                                                {result.status === 'PENDING' && 'EN ATTENTE'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Details (Value, Notes, Images) */}
                                                    {(result.value || result.notes || result.imageUrl) && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                                            {result.value && (
                                                                <div className="text-sm">
                                                                    <span className="font-medium text-gray-700">Valeur: </span>
                                                                    <span className="text-gray-900">{result.value}</span>
                                                                </div>
                                                            )}
                                                            {result.notes && (
                                                                <div className="text-sm">
                                                                    <span className="font-medium text-gray-700 block mb-1">Notes:</span>
                                                                    <p className="bg-white p-2 rounded border border-gray-200 text-gray-600">{result.notes}</p>
                                                                </div>
                                                            )}
                                                            {result.imageUrl && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-medium text-gray-500 mb-1">Photo:</p>
                                                                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                                                                        <img
                                                                            src={result.imageUrl}
                                                                            alt="Preuve"
                                                                            className="w-full h-full object-cover"
                                                                            onClick={() => window.open(result.imageUrl, '_blank')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
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

                    {/* Synthèse Tab (formerly Results) */}
                    {activeTab === 'results' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">Synthèse de l'Inspection</h2>
                            </div>
                            <div className="p-6">
                                {inspection.status === 'COMPLETED' ? (
                                    <ScoringSystem
                                        overallScore={inspection.overallScore || 0}
                                        complianceStatus={inspection.complianceStatus}
                                        criticalIssues={0} // TODO: Calculer depuis les résultats
                                        totalItems={inspectionItems.length}
                                        passedItems={Object.values(executionResults).filter(r => r.status === 'PASSED').length}
                                        failedItems={Object.values(executionResults).filter(r => r.status === 'FAILED').length}
                                        notApplicableItems={Object.values(executionResults).filter(r => r.status === 'NOT_APPLICABLE').length}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Inspection en cours</h3>
                                        <p className="text-gray-500">Les résultats seront disponibles une fois l'inspection terminée.</p>
                                    </div>
                                )}

                                {generalNotes && (
                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <h3 className="font-medium text-gray-900 mb-3">Commentaires Généraux</h3>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded">{generalNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-500">
                        Créé {formatDate(inspection.createdAt)} · Modifié {formatDate(inspection.updatedAt)}
                    </div>
                </div>

                {/* Right Sidebar - Timeline & Actions */}
                <div className="w-[400px] space-y-6">
                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Chronologie</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                        <FileText size={12} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-gray-900 text-sm">Inspection Créée</span>
                                        <span className="text-xs text-gray-500">{formatDate(inspection.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            {inspection.startedAt && (
                                <div className="flex gap-4 items-start mt-4">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                            <Play size={12} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-gray-900 text-sm">Inspection Démarrée</span>
                                            <span className="text-xs text-gray-500">{formatDate(inspection.startedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {inspection.completedAt && (
                                <div className="flex gap-4 items-start mt-4">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle size={12} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-gray-900 text-sm">Inspection Terminée</span>
                                            <span className="text-xs text-gray-500">{formatDate(inspection.completedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistiques */}
                    {inspection.status === 'COMPLETED' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">Statistiques</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Score Global</span>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className={getScoreColor(inspection.overallScore || 0)} size={16} />
                                        <span className={`font-bold ${getScoreColor(inspection.overallScore || 0)}`}>
                                            {inspection.overallScore || 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Conformité</span>
                                    <span className={`text-sm font-medium ${getComplianceColor(inspection.complianceStatus)}`}>
                                        {inspection.complianceStatus === 'COMPLIANT' ? 'Conforme' :
                                            inspection.complianceStatus === 'NON_COMPLIANT' ? 'Non-Conforme' : 'En attente'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Durée</span>
                                    <span className="text-sm text-gray-900">
                                        {inspection.startedAt && inspection.completedAt ?
                                            `${Math.round((new Date(inspection.completedAt).getTime() - new Date(inspection.startedAt).getTime()) / (1000 * 60))} min`
                                            : '—'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions Rapides */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Actions Rapides</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {inspection.status === 'DRAFT' && (
                                <button
                                    onClick={() => router.push(`/inspections/forms/${inspection.inspectionTemplateId}/start`)}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white rounded text-sm font-medium"
                                >
                                    <Play size={16} /> Commencer l'Inspection
                                </button>
                            )}
                            {/* {inspection.status === 'SCHEDULED' && (
                                <button
                                    onClick={handleStartExecution}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                                >
                                    <Play size={16} /> Commencer Maintenant
                                </button>
                            )} */}
                            {inspection.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={() => router.push(`/inspections/forms/${inspection.inspectionTemplateId}/start`)}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium"
                                >
                                    <Play size={16} /> Continuer l'Inspection
                                </button>
                            )}
                            {/* <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium">
                                <Clock size={16} /> Programmer
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium">
                                <Camera size={16} /> Ajouter Photos
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium">
                                <Flag size={16} /> Signaler
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
