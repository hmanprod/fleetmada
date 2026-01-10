'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Car, CheckCircle2, XCircle, MinusCircle,
    Camera, MessageSquare, ChevronRight, Loader2,
    AlertCircle, Send, ClipboardCheck, Search, PenTool, Info
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import { useVehicles } from '@/lib/hooks/useVehicles';
import useInspections from '@/lib/hooks/useInspections';

type InspectionItemStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';

interface ChecklistItem {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
    status: InspectionItemStatus;
    notes: string;
    type: string;
    options: string[];
    unit?: string;
    value: string;
    instructions?: string;
    shortDescription?: string;
    passLabel?: string;
    failLabel?: string;
    enableNA?: boolean;
    minRange?: number;
    maxRange?: number;
    dateTimeType?: string;
    requireSecondaryMeter?: boolean;
    secondaryValue?: string;
}

export default function StartInspectionPage() {
    const router = useRouter();
    const { id: templateId } = useParams();
    const { getTemplate } = useInspectionTemplates();
    const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();
    const { createInspection } = useInspections();

    // Steps
    const [currentStep, setCurrentStep] = useState<'vehicle' | 'checklist' | 'summary'>('vehicle');

    // Data
    const [template, setTemplate] = useState<any>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

    // UI State
    const [fetching, setFetching] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (templateId) {
            fetchVehicles();
            loadTemplate();
        }
    }, [templateId]);

    const loadTemplate = async () => {
        try {
            setFetching(true);
            const data = await getTemplate(templateId as string);
            setTemplate(data);
            // Initialize checklist items from template
            if (data.items && Array.isArray(data.items)) {
                setChecklistItems(data.items.map((item: any, index: number) => ({
                    id: item.id || `item-${index}`,
                    name: item.name,
                    category: item.category || 'Général',
                    isRequired: item.isRequired ?? true,
                    status: 'PENDING' as InspectionItemStatus,
                    notes: '',
                    type: item.type || 'PASS_FAIL',
                    options: item.options || [],
                    unit: item.unit || '',
                    value: '',
                    instructions: item.instructions || '',
                    shortDescription: item.shortDescription || '',
                    passLabel: item.passLabel || 'Pass',
                    failLabel: item.failLabel || 'Fail',
                    enableNA: item.enableNA ?? true,
                    minRange: item.minRange,
                    maxRange: item.maxRange,
                    dateTimeType: item.dateTimeType || 'DATE_ONLY',
                    requireSecondaryMeter: item.requireSecondaryMeter || false,
                    secondaryValue: ''
                })));
            }
        } catch (err) {
            console.error(err);
            setError('Impossible de charger le formulaire');
        } finally {
            setFetching(false);
        }
    };

    const handleVehicleSelect = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setCurrentStep('checklist');
    };

    const handleItemStatusChange = (itemId: string, status: InspectionItemStatus) => {
        setChecklistItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, status } : item
        ));
    };

    const handleItemValueChange = (itemId: string, value: string) => {
        setChecklistItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, value } : item
        ));
    };

    const handleSecondaryValueChange = (itemId: string, secondaryValue: string) => {
        setChecklistItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, secondaryValue } : item
        ));
    };

    const handleItemNotesChange = (itemId: string, notes: string) => {
        setChecklistItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, notes } : item
        ));
    };

    const getCompletionStats = () => {
        const total = checklistItems.length;
        const completed = checklistItems.filter(i => i.status !== 'PENDING').length;
        const passed = checklistItems.filter(i => i.status === 'PASSED').length;
        const failed = checklistItems.filter(i => i.status === 'FAILED').length;
        return { total, completed, passed, failed, progress: total > 0 ? (completed / total) * 100 : 0 };
    };

    const canSubmit = () => {
        const requiredItems = checklistItems.filter(i => i.isRequired);
        return requiredItems.every(i => i.status !== 'PENDING');
    };

    const handleSubmit = async () => {
        if (!canSubmit()) {
            setError('Veuillez compléter tous les éléments requis');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const stats = getCompletionStats();
            const score = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;

            // Create the inspection with results
            const inspection = await createInspection({
                vehicleId: selectedVehicle.id,
                inspectionTemplateId: templateId as string,
                title: `${template.name} - ${selectedVehicle.name}`,
                description: `Inspection réalisée le ${new Date().toLocaleDateString()}`,
                inspectorName: '', // Could get from user context
                location: '',
                notes: '',
                scheduledDate: ''
            });

            // Redirect to the inspection detail page
            router.push(`/inspections/history/${inspection.id}`);
        } catch (err) {
            console.error(err);
            setError('Erreur lors de la soumission de l\'inspection');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = getCompletionStats();

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto text-[#008751] mb-4" size={40} />
                    <p className="text-gray-500">Chargement du formulaire...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                            <p className="text-sm text-gray-500">
                                {currentStep === 'vehicle' && 'Sélectionnez un véhicule'}
                                {currentStep === 'checklist' && `${selectedVehicle?.name} - Liste de contrôle`}
                                {currentStep === 'summary' && 'Résumé'}
                            </p>
                        </div>
                    </div>

                    {currentStep === 'checklist' && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{stats.completed}/{stats.total} complété</p>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#008751] transition-all duration-300"
                                        style={{ width: `${stats.progress}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit() || submitting}
                                className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Soumettre
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-4xl mx-auto px-6 pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-6">
                {/* Step 1: Vehicle Selection */}
                {currentStep === 'vehicle' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Car size={20} className="text-[#008751]" />
                                Sélectionnez un véhicule
                            </h2>

                            {vehiclesLoading ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-gray-500">Chargement des véhicules...</p>
                                </div>
                            ) : vehicles.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    Aucun véhicule disponible
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-4">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#008751] focus:border-[#008751] sm:text-sm transition-all"
                                            placeholder="Rechercher par nom, marque, modèle ou VIN..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        {vehicles
                                            .filter(v =>
                                                v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                v.vin?.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map(vehicle => (
                                                <button
                                                    key={vehicle.id}
                                                    onClick={() => handleVehicleSelect(vehicle)}
                                                    className="w-full p-4 bg-gray-50 hover:bg-[#008751]/5 border border-gray-200 hover:border-[#008751]/30 rounded-xl flex items-center justify-between transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                                            <Car size={24} className="text-gray-400 group-hover:text-[#008751]" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-gray-900">{vehicle.name}</p>
                                                            <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} • {vehicle.vin}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-[#008751]" />
                                                </button>
                                            ))}
                                        {vehicles.filter(v =>
                                            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            v.vin?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length === 0 && (
                                                <div className="py-8 text-center text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                                                    Aucun véhicule ne correspond à votre recherche.
                                                </div>
                                            )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Checklist */}
                {currentStep === 'checklist' && (
                    <div className="space-y-4">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                            </div>
                            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                                <p className="text-xs text-green-600 uppercase tracking-wider">Réussi</p>
                            </div>
                            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                <p className="text-xs text-red-600 uppercase tracking-wider">Échoué</p>
                            </div>
                        </div>

                        {/* Checklist Items */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {checklistItems.map((item, index) => {
                                    if (item.type === 'HEADER') {
                                        return (
                                            <div key={item.id} className="bg-gray-50 px-6 py-3 border-y border-gray-100">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{item.name}</h3>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={item.id} className="p-4 sm:p-6 transition-all hover:bg-gray-50/50">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 break-words">
                                                            {item.name}
                                                            {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                        </p>
                                                        {item.shortDescription && <p className="text-sm text-gray-500 mt-0.5">{item.shortDescription}</p>}
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">{item.category}</p>

                                                        {item.instructions && (
                                                            <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed">
                                                                <div className="flex items-center gap-1 font-bold mb-1 uppercase tracking-widest text-[10px] text-blue-500">
                                                                    <AlertCircle size={10} /> Instructions
                                                                </div>
                                                                {item.instructions}
                                                            </div>
                                                        )}

                                                        {/* Specialized Inputs based on type */}
                                                        <div className="mt-4">
                                                            {(item.type === 'NUMERIC' || item.type === 'METER') && (
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-1 max-w-[200px]">
                                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{item.type === 'METER' ? 'Compteur Principal' : 'Valeur'}</label>
                                                                            <div className="relative flex items-center">
                                                                                <input
                                                                                    type="number"
                                                                                    className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:ring-2 outline-none font-bold transition-all ${(item.minRange !== undefined && parseFloat(item.value) < item.minRange) ||
                                                                                            (item.maxRange !== undefined && parseFloat(item.value) > item.maxRange)
                                                                                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30'
                                                                                            : 'border-gray-200 focus:ring-[#008751]/20 focus:border-[#008751]'
                                                                                        }`}
                                                                                    placeholder="0.00"
                                                                                    value={item.value}
                                                                                    onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                                                                                />
                                                                                <span className="absolute right-3 text-xs font-bold text-gray-400">{item.unit}</span>
                                                                            </div>
                                                                        </div>
                                                                        {item.requireSecondaryMeter && (
                                                                            <div className="flex-1 max-w-[200px]">
                                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Compteur Secondaire</label>
                                                                                <div className="relative flex items-center">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none font-bold"
                                                                                        placeholder="0.00"
                                                                                        value={item.secondaryValue}
                                                                                        onChange={(e) => handleSecondaryValueChange(item.id, e.target.value)}
                                                                                    />
                                                                                    <span className="absolute right-3 text-xs font-bold text-gray-400">{item.unit}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {(item.minRange !== undefined || item.maxRange !== undefined) && (
                                                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit transition-all ${(item.minRange !== undefined && parseFloat(item.value) < item.minRange) ||
                                                                                (item.maxRange !== undefined && parseFloat(item.value) > item.maxRange)
                                                                                ? 'bg-red-50 border-red-100 text-red-600'
                                                                                : 'bg-gray-50 border-gray-100 text-gray-500'
                                                                            }`}>
                                                                            <Info size={12} className={
                                                                                (item.minRange !== undefined && parseFloat(item.value) < item.minRange) ||
                                                                                    (item.maxRange !== undefined && parseFloat(item.value) > item.maxRange)
                                                                                    ? 'text-red-400'
                                                                                    : 'text-gray-400'
                                                                            } />
                                                                            <p className="text-[10px] font-bold uppercase">
                                                                                Plage valide : {item.minRange ?? '-∞'} à {item.maxRange ?? '+∞'} {item.unit}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {item.type === 'DATE_TIME' && (
                                                                <div className="flex flex-col sm:flex-row gap-3">
                                                                    <div className="flex-1 max-w-[200px]">
                                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date</label>
                                                                        <input
                                                                            type="date"
                                                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none font-bold"
                                                                            value={item.value.split('T')[0]}
                                                                            onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                                                                        />
                                                                    </div>
                                                                    {item.dateTimeType === 'DATE_TIME' && (
                                                                        <div className="flex-1 max-w-[150px]">
                                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Heure</label>
                                                                            <input
                                                                                type="time"
                                                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none font-bold"
                                                                                onChange={(e) => {
                                                                                    const date = item.value.split('T')[0] || new Date().toISOString().split('T')[0];
                                                                                    handleItemValueChange(item.id, `${date}T${e.target.value}`);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {item.type === 'TEXT' && (
                                                                <textarea
                                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none text-sm min-h-[100px]"
                                                                    placeholder="Saisissez votre réponse..."
                                                                    value={item.value}
                                                                    onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                                                                />
                                                            )}

                                                            {item.type === 'MULTIPLE_CHOICE' && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {item.options.map(option => (
                                                                        <button
                                                                            key={option}
                                                                            onClick={() => handleItemValueChange(item.id, option)}
                                                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${item.value === option
                                                                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                                                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                                                                }`}
                                                                        >
                                                                            {option}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {item.type === 'SIGNATURE' && (
                                                                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center group hover:border-[#008751]/30 transition-all cursor-pointer">
                                                                    <div className="text-center">
                                                                        <PenTool className="mx-auto text-gray-400 group-hover:text-[#008751] mb-2" size={24} />
                                                                        <p className="text-xs font-bold text-gray-500 group-hover:text-gray-700">Cliquez pour signer</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {item.type === 'PHOTO' && (
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center group hover:border-[#008751]/30 transition-all cursor-pointer">
                                                                        <Camera className="text-gray-400 group-hover:text-[#008751]" size={24} />
                                                                    </div>
                                                                    <p className="text-xs text-gray-400 font-medium italic">Prenez une photo comme preuve</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Buttons (Only for non-Header) */}
                                                {(item.type === 'PASS_FAIL' || item.type === 'NUMERIC' || item.type === 'METER') && (
                                                    <div className="flex gap-2 self-start">
                                                        <button
                                                            onClick={() => handleItemStatusChange(item.id, 'PASSED')}
                                                            className={`px-4 py-2 min-w-[80px] rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${item.status === 'PASSED'
                                                                ? 'bg-green-100 border-green-500 text-green-600 shadow-sm shadow-green-200'
                                                                : 'bg-white border-gray-100 text-gray-300 hover:border-green-200 hover:text-green-500'
                                                                }`}
                                                            title={item.passLabel}
                                                        >
                                                            <CheckCircle2 size={20} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.passLabel}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleItemStatusChange(item.id, 'FAILED')}
                                                            className={`px-4 py-2 min-w-[80px] rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${item.status === 'FAILED'
                                                                ? 'bg-red-100 border-red-500 text-red-600 shadow-sm shadow-red-200'
                                                                : 'bg-white border-gray-100 text-gray-300 hover:border-red-200 hover:text-red-500'
                                                                }`}
                                                            title={item.failLabel}
                                                        >
                                                            <XCircle size={20} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.failLabel}</span>
                                                        </button>
                                                        {item.enableNA && (
                                                            <button
                                                                onClick={() => handleItemStatusChange(item.id, 'NOT_APPLICABLE')}
                                                                className={`px-4 py-2 min-w-[80px] rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${item.status === 'NOT_APPLICABLE'
                                                                    ? 'bg-gray-100 border-gray-400 text-gray-600'
                                                                    : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'
                                                                    }`}
                                                                title="N/A"
                                                            >
                                                                <MinusCircle size={20} />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">N/A</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes Input (always available or conditional) */}
                                            {item.type !== 'HEADER' && (
                                                <div className="mt-6 flex items-center gap-3 pl-12 border-t border-gray-50 pt-4">
                                                    <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="Ajouter une note ou un commentaire..."
                                                        className="flex-1 text-sm bg-transparent border-none focus:ring-0 outline-none placeholder-gray-400"
                                                        value={item.notes}
                                                        onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                                                    />
                                                    <button className="p-2 text-gray-400 hover:text-[#008751] hover:bg-gray-100 rounded-lg transition-colors">
                                                        <Camera size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Bar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between sticky bottom-4 shadow-lg">
                            <div className="flex items-center gap-3">
                                <ClipboardCheck size={20} className="text-[#008751]" />
                                <span className="font-medium text-gray-700">
                                    {canSubmit() ? 'Prêt à soumettre' : `${stats.total - stats.completed} éléments restants`}
                                </span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit() || submitting}
                                className="px-6 py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Soumettre l'inspection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
