'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, Upload, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIssueDetails } from '@/lib/hooks/useIssueDetails';
import useIssues from '@/lib/hooks/useIssues';
import { useVehicles } from '@/lib/hooks/useVehicles';
import type { IssueUpdateData } from '@/lib/services/issues-api';

export default function IssueEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    
    // Hooks pour les données
    const { 
        issue, 
        loading, 
        error, 
        fetchIssue, 
        updateIssue, 
        clearError 
    } = useIssueDetails(params.id);
    
    const { updateIssue: updateIssueInList } = useIssues();
    
    // Récupération des véhicules via la vraie API
    const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
    
    // États du formulaire
    const [formData, setFormData] = useState<IssueUpdateData>({
        summary: '',
        priority: 'MEDIUM',
        labels: [],
        assignedTo: ''
    });
    
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    
    // Données mockées temporaires pour utilisateurs (à remplacer par API Users plus tard)
    
    const mockUsers = [
        { id: 'user-1', name: 'Hery RABOTOVAO' },
        { id: 'user-2', name: 'John Doe' },
        { id: 'user-3', name: 'Jane Smith' }
    ];
    
    const mockLabels = ['Electrical', 'Mechanical', 'Body', 'Safety', 'Recall'];

    // Charger l'issue au montage
    useEffect(() => {
        if (params.id) {
            fetchIssue(params.id);
        }
    }, [params.id, fetchIssue]);
    
    // Mettre à jour le formulaire quand l'issue est chargée
    useEffect(() => {
        if (issue) {
            setFormData({
                summary: issue.summary,
                priority: issue.priority,
                labels: [...issue.labels],
                assignedTo: issue.assignedTo || ''
            });
        }
    }, [issue]);

    const handleCancel = () => {
        router.back();
    };

    const handleSave = async () => {
        if (!issue) return;
        
        try {
            setLoadingSubmit(true);
            setSubmitError(null);
            
            const updatedIssue = await updateIssue(params.id, formData);
            
            // Mettre à jour aussi dans la liste (si elle est ouverte)
            try {
                await updateIssueInList(params.id, formData);
            } catch (listError) {
                console.warn('Impossible de mettre à jour la liste:', listError);
            }
            
            setSubmitSuccess(true);
            
            // Redirection après un court délai
            setTimeout(() => {
                router.push(`/issues/${params.id}`);
            }, 1500);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
            setSubmitError(errorMessage);
        } finally {
            setLoadingSubmit(false);
        }
    };
    
    const handleInputChange = (field: keyof IssueUpdateData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSubmitError(null);
    };
    
    const handleAddLabel = (label: string) => {
        if (label && !formData.labels?.includes(label)) {
            setFormData(prev => ({
                ...prev,
                labels: [...(prev.labels || []), label]
            }));
        }
    };
    
    const handleRemoveLabel = (labelToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            labels: (prev.labels || []).filter(label => label !== labelToRemove)
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Issue #{params.id.slice(-6)}</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button 
                        onClick={handleSave}
                        disabled={loadingSubmit || !issue}
                        className="px-4 py-2 bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white font-bold rounded shadow-sm"
                    >
                        {loadingSubmit ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Messages d'état */}
                {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-red-700">{submitError}</span>
                        <button 
                            onClick={() => setSubmitError(null)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-700">Issue modifié avec succès !</span>
                    </div>
                )}
                
                {/* État de chargement */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
                            <p className="mt-2 text-gray-500">Chargement de l'issue...</p>
                        </div>
                    </div>
                )}
                
                {/* État d'erreur de chargement */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-red-700">{error}</span>
                        <button 
                            onClick={() => {
                                clearError();
                                fetchIssue(params.id);
                            }}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            Réessayer
                        </button>
                    </div>
                )}
                
                {/* Formulaire */}
                {!loading && !error && issue && (
                    <>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule <span className="text-red-500">*</span></label>
                                    {issue.vehicle ? (
                                        <div className="p-2.5 border border-gray-300 rounded-md bg-gray-50">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {issue.vehicle.name} - {issue.vehicle.make} {issue.vehicle.model}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                VIN: {issue.vehicle.vin}
                                            </div>
                                        </div>
                                    ) : (
                                        <select 
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white" 
                                            value={issue.vehicleId || ''}
                                            disabled
                                        >
                                            <option value="">Aucun véhicule sélectionné</option>
                                        </select>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Le véhicule ne peut pas être modifié après la création</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <div className="relative">
                                        <select
                                            value={formData.priority}
                                            onChange={e => handleInputChange('priority', e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white appearance-none pl-10"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-dashed text-xs w-4 h-4 ${formData.priority === 'CRITICAL' ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Summary <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.summary}
                                        onChange={e => handleInputChange('summary', e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        placeholder="Brief overview of the issue"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Brief overview of the issue</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                                    <div className="space-y-2">
                                        <select 
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAddLabel(e.target.value);
                                                    e.target.value = ''; // Reset selection
                                                }
                                            }}
                                        >
                                            <option value="">Please select</option>
                                            {mockLabels.filter(label => !formData.labels?.includes(label)).map(label => (
                                                <option key={label} value={label}>{label}</option>
                                            ))}
                                        </select>
                                        
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
                                        
                                        <p className="text-xs text-gray-500 mt-1">Use labels to categorize, group and more.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                                    <select 
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                        value={formData.assignedTo || ''}
                                        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                    >
                                        <option value="">Please select</option>
                                        {mockUsers.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                                    <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 p-2.5">
                                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold mr-2">
                                            {issue.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-gray-900 text-sm">{issue.user?.name || 'Unknown User'}</span>
                                        <span className="ml-auto text-xs text-gray-500">Cannot be changed</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="date" 
                                            value={new Date(issue.reportedDate).toISOString().split('T')[0]}
                                            disabled
                                            className="flex-1 p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500" 
                                        />
                                        <input 
                                            type="time" 
                                            value={new Date(issue.reportedDate).toTimeString().split(' ')[0].slice(0, 5)}
                                            disabled
                                            className="flex-1 p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500" 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Reported date cannot be changed</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <div className="flex gap-3">
                                <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold bg-white hover:bg-gray-50">Cancel</button>
                                <button 
                                    onClick={handleSave}
                                    disabled={loadingSubmit || !issue}
                                    className="px-4 py-2 bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white font-bold rounded shadow-sm"
                                >
                                    {loadingSubmit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
