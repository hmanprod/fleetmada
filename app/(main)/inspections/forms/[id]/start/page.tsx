'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Car, CheckCircle2, XCircle, MinusCircle,
    Camera, MessageSquare, ChevronRight, Loader2,
    AlertCircle, Send, ClipboardCheck, Search, PenTool, Info,
    Trash2, RotateCcw, Image as ImageIcon, Calendar, Clock
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import { useVehicles } from '@/lib/hooks/useVehicles';
import inspectionsAPI from '@/lib/services/inspections-api';
import useInspections from '@/lib/hooks/useInspections';

type InspectionItemStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';

interface ChecklistOption {
    label: string;
    value: string;
    fail_if_chosen?: boolean;
}

interface ChecklistItem {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
    status: InspectionItemStatus;
    notes: string;
    type: string;
    options: ChecklistOption[];
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
    media?: string[]; // Array of blob URLs or base64
}

export default function StartInspectionPage() {
    const router = useRouter();
    const { id: templateId } = useParams();
    const { getTemplate } = useInspectionTemplates();
    const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();
    const { createInspection, startInspection, submitInspectionResults } = useInspections();

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

    // Refs
    // Removed capture="environment" to support desktop file picking while still allowing camera on mobile
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activePhotoItemId = useRef<string | null>(null);
    const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const isDrawing = useRef<{ [key: string]: boolean }>({});

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
                setChecklistItems(data.items.map((item: any, index: number) => {
                    // Normalize options/choices
                    let options: ChecklistOption[] = [];
                    if (item.choices && Array.isArray(item.choices)) {
                        options = item.choices.map((c: any) => ({
                            label: c.label || c.value,
                            value: c.value,
                            fail_if_chosen: c.fail_if_chosen
                        }));
                    } else if (item.options && Array.isArray(item.options)) {
                        options = item.options.map((o: any) =>
                            typeof o === 'string'
                                ? { label: o, value: o, fail_if_chosen: false }
                                : { label: o.label || o.value, value: o.value, fail_if_chosen: o.fail_if_chosen }
                        );
                    }

                    return {
                        id: item.id || `item-${index}`,
                        name: item.name,
                        category: item.category || 'Général',
                        isRequired: item.isRequired ?? true,
                        status: 'PENDING' as InspectionItemStatus,
                        notes: '',
                        type: item.type || 'PASS_FAIL',
                        options: options,
                        unit: item.unit || '',
                        value: '',
                        instructions: item.instructions || '',
                        shortDescription: item.shortDescription || item.short_description || '',
                        passLabel: item.passLabel || 'Pass',
                        failLabel: item.failLabel || 'Fail',
                        enableNA: item.enableNA ?? true,
                        minRange: item.minRange,
                        maxRange: item.maxRange,
                        dateTimeType: item.dateTimeType || 'DATE_ONLY',
                        requireSecondaryMeter: item.requireSecondaryMeter || false,
                        secondaryValue: '',
                        media: []
                    };
                }));
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
        setChecklistItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;

            let newStatus = item.status;

            // Validation logic for Dropdowns/Multiple Choice
            if (item.type === 'Dropdown' || item.type === 'MULTIPLE_CHOICE') {
                const selectedOption = item.options.find(opt => opt.value === value);
                if (selectedOption) {
                    if (selectedOption.fail_if_chosen) {
                        newStatus = 'FAILED';
                    } else {
                        newStatus = 'PASSED';
                    }
                }
            } else if (item.type === 'Free Text' || item.type === 'TEXT') {
                // For text, if required and not empty -> PASSED
                if (item.isRequired && value.trim().length > 0) {
                    newStatus = 'PASSED';
                } else if (item.isRequired && value.trim().length === 0) {
                    newStatus = 'PENDING';
                }
            } else if (['Date / Time', 'Date', 'Time', 'datetime', 'date', 'time', 'DATE_TIME'].includes(item.type)) {
                if (item.isRequired && value) {
                    newStatus = 'PASSED';
                } else if (item.isRequired && !value) {
                    newStatus = 'PENDING';
                }
            }

            return { ...item, value, status: newStatus };
        }));
    };

    // --- Photo Handling ---
    const handlePhotoClick = (itemId: string) => {
        activePhotoItemId.current = itemId;
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const currentItemId = activePhotoItemId.current;

        if (file && currentItemId) {
            const imageUrl = URL.createObjectURL(file);

            setChecklistItems(prev => prev.map(item => {
                if (item.id === currentItemId) {
                    const currentMedia = item.media || [];
                    return {
                        ...item,
                        media: [...currentMedia, imageUrl],
                        status: item.type === 'Photo' ? 'PASSED' : item.status
                    };
                }
                return item;
            }));
        }
        // Reset input
        if (event.target) event.target.value = '';
        activePhotoItemId.current = null;
    };

    const removePhoto = (itemId: string, photoIndex: number) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId && item.media) {
                const newMedia = item.media.filter((_, idx) => idx !== photoIndex);
                return {
                    ...item,
                    media: newMedia,
                    status: (item.type === 'Photo' && newMedia.length === 0 && item.isRequired) ? 'PENDING' : item.status
                };
            }
            return item;
        }));
    };

    // --- Signature Handling ---
    const startDrawing = (e: React.MouseEvent | React.TouchEvent, itemId: string) => {
        const canvas = canvasRefs.current[itemId];
        if (!canvas) return;

        isDrawing.current[itemId] = true;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
    };

    const draw = (e: React.MouseEvent | React.TouchEvent, itemId: string) => {
        if (!isDrawing.current[itemId]) return;
        const canvas = canvasRefs.current[itemId];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (itemId: string) => {
        if (!isDrawing.current[itemId]) return;
        isDrawing.current[itemId] = false;

        // Save signature to value
        const canvas = canvasRefs.current[itemId];
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            handleItemValueChange(itemId, dataUrl);
            // Specifically set status to PASSED for signature
            handleItemStatusChange(itemId, 'PASSED');
        }
    };

    const clearSignature = (itemId: string) => {
        const canvas = canvasRefs.current[itemId];
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            handleItemValueChange(itemId, '');
            handleItemStatusChange(itemId, 'PENDING');
        }
    };

    // --- Validation & Submit ---
    const getCompletionStats = () => {
        const total = checklistItems.filter(i => i.type !== 'HEADER').length;
        const completed = checklistItems.filter(i => i.type !== 'HEADER' && i.status !== 'PENDING').length;
        const passed = checklistItems.filter(i => i.status === 'PASSED').length;
        const failed = checklistItems.filter(i => i.status === 'FAILED').length;
        return { total, completed, passed, failed, progress: total > 0 ? (completed / total) * 100 : 0 };
    };

    const canSubmit = () => {
        const requiredItems = checklistItems.filter(i => i.isRequired && i.type !== 'HEADER');
        return requiredItems.every(i => i.status !== 'PENDING');
    };

    // --- Photo Upload Helper ---
    const uploadPhoto = async (blobUrl: string): Promise<string | null> => {
        try {
            // Fetch blob from local URL
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('files', file);
            formData.append('isPublic', 'true');

            // Get token manually since we're using fetch directly
            const token = localStorage.getItem('authToken') || document.cookie.match(/authToken=([^;]*)/)?.[1];

            const uploadRes = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadRes.ok) return null;

            const data = await uploadRes.json();
            // Return the filePath of the first successful upload
            return data.data?.successful?.[0]?.document?.filePath || null;
        } catch (e) {
            console.error("Upload failed", e);
            return null;
        }
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

            // 1. Create the inspection (Draft)
            const inspection = await createInspection({
                vehicleId: selectedVehicle.id,
                inspectionTemplateId: templateId as string,
                title: `${template.name} - ${selectedVehicle.name}`,
                description: `Inspection réalisée le ${new Date().toLocaleDateString()}`,
                inspectorName: 'Utilisateur Actuel', // Should come from auth context
                location: 'Sur site', // Should come from GPS or input
                notes: `Score: ${stats.passed}/${stats.total}`,
                scheduledDate: new Date().toISOString()
            });

            // 2. Start the inspection (Creates items in DB)
            await startInspection(inspection.id);

            // 3. Get the created items to map answers
            const inspectionItems = await inspectionsAPI.getInspectionItems(inspection.id);

            // 4. Submit results
            const resultsToSubmit = await Promise.all(inspectionItems.map(async (insItem) => {
                const checkItem = checklistItems.find(c => c.id === insItem.templateItemId);
                if (checkItem) {
                    let imageUrl = '';
                    let images: string[] = [];

                    // Upload photos if present
                    if (checkItem.media && checkItem.media.length > 0) {
                        try {
                            const uploadPromises = checkItem.media.map(mediaUrl => uploadPhoto(mediaUrl));
                            const uploadedPaths = await Promise.all(uploadPromises);

                            // Filter out any failed uploads (nulls)
                            const validPaths = uploadedPaths.filter(Boolean) as string[];

                            if (validPaths.length > 0) {
                                imageUrl = validPaths[0]; // Primary image for backward compatibility
                                images = validPaths;
                            }
                        } catch (err) {
                            console.error(`Failed to upload photos for item ${checkItem.name}`, err);
                        }
                    }

                    return {
                        inspectionItemId: insItem.id,
                        resultValue: checkItem.value,
                        isCompliant: checkItem.status === 'PASSED',
                        notes: checkItem.notes,
                        imageUrl: imageUrl || undefined,
                        images: images
                    };
                }
                return null;
            }));

            const validResults = resultsToSubmit.filter(Boolean) as any[];

            if (validResults.length > 0) {
                await submitInspectionResults(inspection.id, { results: validResults });
            }

            // Redirect to the inspection detail page
            router.push(`/inspections/history/${inspection.id}`);
        } catch (err: any) {
            console.error("SUBMISSION ERROR:", err);
            setError(`Erreur lors de la soumission: ${err?.message || 'Erreur inconnue'}`);
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Hidden File Input for Photos */}
            {/* Using a robust way to hide the input but keep it accessible for ref clicks */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}
                accept="image/*"
                capture={template?.preventStoredPhotos ? "environment" : undefined}
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{template.name}</h1>
                            <p className="text-sm text-gray-500">
                                {currentStep === 'vehicle' && 'Sélectionnez un véhicule'}
                                {currentStep === 'checklist' && `${selectedVehicle?.name}`}
                            </p>
                        </div>
                    </div>

                    {currentStep === 'checklist' && (
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${stats.completed === stats.total ? 'text-green-600' : 'text-gray-500'}`}>
                                    {Math.round(stats.progress)}%
                                </span>
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#008751] transition-all duration-500 ease-out"
                                        style={{ width: `${stats.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-3xl mx-auto px-6 pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto p-4 sm:p-6">
                {/* Step 1: Vehicle Selection */}
                {currentStep === 'vehicle' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Car size={20} className="text-[#008751]" />
                                Sélectionnez un véhicule à inspecter
                            </h2>

                            {vehiclesLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="animate-spin mx-auto text-gray-400 mb-3" size={32} />
                                    <p className="text-gray-500 font-medium">Chargement des véhicules...</p>
                                </div>
                            ) : vehicles.length === 0 ? (
                                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Car size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p>Aucun véhicule disponible</p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-6">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
                                            placeholder="Rechercher (Nom, Marque, VIN)..."
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
                                                    className="w-full p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#008751]/50 rounded-xl flex items-center justify-between transition-all group text-left hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-[#008751]/10 group-hover:text-[#008751] transition-colors">
                                                            <Car size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 group-hover:text-[#008751] transition-colors">{vehicle.name}</p>
                                                            <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} <span className="text-gray-300">•</span> {vehicle.vin}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-[#008751] transition-colors" />
                                                </button>
                                            ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Checklist */}
                {currentStep === 'checklist' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Items */}
                        <div className="space-y-4">
                            {checklistItems.map((item, index) => {
                                if (item.type === 'HEADER') {
                                    return (
                                        <div key={item.id} className="pt-4 pb-2">
                                            <h3 className="text-sm font-extrabold text-[#008751] uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1 h-4 bg-[#008751] rounded-full"></span>
                                                {item.name}
                                            </h3>
                                        </div>
                                    );
                                }

                                const isCompleted = item.status !== 'PENDING';
                                const isFailed = item.status === 'FAILED';

                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isFailed ? 'border-red-200 shadow-sm shadow-red-100' : 'border-gray-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="p-5">
                                            <div className="flex flex-col gap-4">
                                                {/* Title Row */}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                            {item.isRequired && <span className="text-red-500 text-xs font-bold" title="Requis">*</span>}

                                                            {/* Status Indicator Badge */}
                                                            {item.status === 'PASSED' && <CheckCircle2 size={16} className="text-green-500" />}
                                                            {item.status === 'FAILED' && <AlertCircle size={16} className="text-red-500" />}
                                                        </div>
                                                        {item.shortDescription && (
                                                            <p className="text-sm text-gray-500 mb-2">{item.shortDescription}</p>
                                                        )}
                                                        {item.instructions && (
                                                            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block border border-blue-100">
                                                                <Info size={12} className="inline mr-1 mb-0.5" />
                                                                {item.instructions}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Input Area */}
                                                <div className="space-y-4">

                                                    {/* Dropdown / Choices */}
                                                    {(item.type === 'Dropdown' || item.type === 'MULTIPLE_CHOICE') && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.options.map(option => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => handleItemValueChange(item.id, option.value)}
                                                                    className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all flex-1 min-w-[120px] ${item.value === option.value
                                                                        ? option.fail_if_chosen
                                                                            ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                                                                            : 'bg-[#008751] text-white border-[#008751] shadow-md shadow-green-200'
                                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Date / Time Inputs */}
                                                    {['Date / Time', 'Date', 'Time', 'datetime', 'date', 'time', 'DATE_TIME'].includes(item.type) && (
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                {['Time', 'time'].includes(item.type) ? <Clock className="text-gray-400" size={18} /> : <Calendar className="text-gray-400" size={18} />}
                                                            </div>
                                                            <input
                                                                type={
                                                                    (['Date / Time', 'datetime'].includes(item.type) || (item.type === 'DATE_TIME' && item.dateTimeType === 'DATE_TIME')) ? 'datetime-local' :
                                                                        (['Date', 'date'].includes(item.type) || (item.type === 'DATE_TIME' && (!item.dateTimeType || item.dateTimeType === 'DATE_ONLY'))) ? 'date' :
                                                                            (['Time', 'time'].includes(item.type) || (item.type === 'DATE_TIME' && item.dateTimeType === 'TIME_ONLY')) ? 'time' :
                                                                                'datetime-local'
                                                                }
                                                                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
                                                                value={item.value}
                                                                onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Free Text */}
                                                    {(item.type === 'Free Text' || item.type === 'TEXT') && (
                                                        <textarea
                                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none text-sm min-h-[100px] transition-all"
                                                            placeholder="Saisissez votre réponse ici..."
                                                            value={item.value}
                                                            onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                                                        />
                                                    )}

                                                    {/* Signature Pad */}
                                                    {(item.type === 'Signature' || item.type === 'SIGNATURE') && (
                                                        <div className="space-y-2">
                                                            <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden touch-none group hover:border-gray-300 transition-colors">
                                                                {item.value ? (
                                                                    <div className="relative w-full h-full flex items-center justify-center bg-white">
                                                                        <img src={item.value} alt="Signature" className="max-h-full max-w-full object-contain" />
                                                                        <div className="absolute top-2 right-2">
                                                                            <button
                                                                                onClick={() => clearSignature(item.id)}
                                                                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <canvas
                                                                            ref={el => { if (el) canvasRefs.current[item.id] = el; }}
                                                                            className="w-full h-full cursor-crosshair"
                                                                            width={600}
                                                                            height={300} // Logical, CSS handles display size
                                                                            onMouseDown={(e) => startDrawing(e, item.id)}
                                                                            onMouseMove={(e) => draw(e, item.id)}
                                                                            onMouseUp={() => stopDrawing(item.id)}
                                                                            onMouseLeave={() => stopDrawing(item.id)}
                                                                            onTouchStart={(e) => startDrawing(e, item.id)}
                                                                            onTouchMove={(e) => { e.preventDefault(); draw(e, item.id); }}
                                                                            onTouchEnd={() => stopDrawing(item.id)}
                                                                            style={{ width: '100%', height: '100%' }}
                                                                        />
                                                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 opacity-50">
                                                                            <p className="text-xl font-bold uppercase tracking-widest">Signer ici</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-end gap-2 text-xs">
                                                                {!item.value && (
                                                                    <button
                                                                        onClick={() => clearSignature(item.id)}
                                                                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium"
                                                                    >
                                                                        <RotateCcw size={12} /> Effacer
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Photo Upload (Generic for all types if needed, or specific Type) */}
                                                    {(item.type === 'Photo' || item.type === 'PHOTO' || true) && (
                                                        <div className="mt-2">
                                                            {/* Media Preview */}
                                                            {item.media && item.media.length > 0 && (
                                                                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                                                                    {item.media.map((url, idx) => (
                                                                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                                                                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] font-bold text-center py-1 truncate px-1">
                                                                                En attente
                                                                            </div>
                                                                            <button
                                                                                onClick={() => removePhoto(item.id, idx)}
                                                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Improved Photo Button UX */}
                                                            <button
                                                                onClick={() => handlePhotoClick(item.id)}
                                                                className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 group-hover:border-[#008751] group-hover:text-[#008751] transition-colors shadow-sm">
                                                                    <Camera size={18} className="text-gray-500 group-hover:text-[#008751]" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                                                                    {item.type === 'Photo' ? 'Prendre une photo (Requis)' : 'Ajouter une photo'}
                                                                </span>
                                                                {template?.preventStoredPhotos && (
                                                                    <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                                                        Direct uniquement
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Pass/Fail Buttons (Legacy/Standard) */}
                                                    {(item.type === 'PASS_FAIL' || item.type === 'NUMERIC' || item.type === 'METER') && (
                                                        <div className="flex gap-2 pt-2">
                                                            <button
                                                                onClick={() => handleItemStatusChange(item.id, 'PASSED')}
                                                                className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold ${item.status === 'PASSED'
                                                                    ? 'bg-green-50 border-green-500 text-green-600 shadow-inner'
                                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-500'
                                                                    }`}
                                                            >
                                                                <CheckCircle2 size={20} />
                                                                {item.passLabel}
                                                            </button>
                                                            <button
                                                                onClick={() => handleItemStatusChange(item.id, 'FAILED')}
                                                                className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold ${item.status === 'FAILED'
                                                                    ? 'bg-red-50 border-red-500 text-red-600 shadow-inner'
                                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-500'
                                                                    }`}
                                                            >
                                                                <XCircle size={20} />
                                                                {item.failLabel}
                                                            </button>
                                                            {item.enableNA && (
                                                                <button
                                                                    onClick={() => handleItemStatusChange(item.id, 'NOT_APPLICABLE')}
                                                                    className={`w-14 rounded-xl border-2 transition-all flex items-center justify-center ${item.status === 'NOT_APPLICABLE'
                                                                        ? 'bg-gray-100 border-gray-500 text-gray-700'
                                                                        : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'
                                                                        }`}
                                                                >
                                                                    <MinusCircle size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sticky Bottom Submit Bar */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Progression</span>
                                    <span className="font-bold text-gray-900">
                                        {canSubmit() ? 'Complet' : `${stats.total - stats.completed} restants`}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-900/20"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    {submitting ? 'Envoi en cours...' : 'Soumettre le rapport'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
