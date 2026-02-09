'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
    ChevronLeft,
    ChevronDown,
    X,
    Plus,
    Search,
    Car,
    User,
    Calendar,
    Check,
    Upload,
    Camera,
    FileText,
    Trash2,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIssues } from '@/lib/hooks/useIssues';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { VehicleSelect } from '@/app/(main)/vehicles/components/VehicleSelect';
import { ContactSelect } from '@/app/(main)/contacts/components/ContactSelect';
import { authAPI } from '@/lib/auth-api';

export default function NewIssuePage() {
    const router = useRouter();
    const { createIssue, loading: saving } = useIssues();
    const { toast, toasts, removeToast } = useToast();

    // Récupération des données
    const vehicleQuery = useMemo(() => ({ limit: 500, page: 1, sortBy: 'name', sortOrder: 'asc' }), []);
    const { vehicles, loading: vehiclesLoading } = useVehicles({ query: vehicleQuery as any });
    const { contacts, loading: contactsLoading } = useContacts({ limit: 1000 });

    // États du formulaire
    const [formData, setFormData] = useState({
        vehicleId: '',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE',
        reportedDate: new Date().toISOString().split('T')[0],
        reportedTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        summary: '',
        description: '',
        labels: [] as string[],
        reportedById: '',
        assignedTo: [] as string[],
        dueDate: '',
    });

    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: '',
    });

    const [isUploading, setIsUploading] = useState(false);
    const [docList, setDocList] = useState<{ id: string; name: string; type: 'photo' | 'document'; url?: string }[]>([]);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: string, value: any) => {
        setFormStatus({ type: null, message: '' });
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        router.back();
    };

    const validateForm = (): boolean => {
        if (!formData.vehicleId) {
            setFormStatus({ type: 'error', message: 'Veuillez sélectionner un véhicule' });
            toast.error('Erreur', 'Veuillez sélectionner un véhicule');
            return false;
        }
        if (!formData.summary.trim()) {
            setFormStatus({ type: 'error', message: 'Le résumé est requis' });
            toast.error('Erreur', 'Le résumé est requis');
            return false;
        }
        return true;
    };

    const prepareSubmitData = () => {
        return {
            vehicleId: formData.vehicleId,
            summary: formData.summary.trim(),
            description: formData.description.trim() || undefined,
            priority: formData.priority === 'NONE' ? 'MEDIUM' : formData.priority,
            reportedDate: `${formData.reportedDate}T${formData.reportedTime}:00`,
            dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : undefined,
            labels: formData.labels,
            assignedTo: formData.assignedTo,
            // documents: docList.map(d => d.id), // Backend support for documents in issues?
        };
    };

    const handleSave = async (andClose = true) => {
        if (!validateForm()) return;

        try {
            const data = prepareSubmitData();
            await createIssue(data);

            setFormStatus({ type: 'success', message: 'Problème créé avec succès' });
            toast.success('Succès', 'Problème créé avec succès');
            if (andClose) {
                setTimeout(() => router.push('/issues'), 1500);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème';
            setFormStatus({ type: 'error', message: errorMessage });
            toast.error('Erreur', errorMessage);
        }
    };

    const handleSaveAndAddAnother = async () => {
        if (!validateForm()) return;

        try {
            const data = prepareSubmitData();
            await createIssue(data);

            // Reset form
            setFormData({
                vehicleId: '',
                priority: 'MEDIUM',
                reportedDate: new Date().toISOString().split('T')[0],
                reportedTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                summary: '',
                description: '',
                labels: [] as string[],
                reportedById: '',
                assignedTo: [] as string[],
                dueDate: '',
            });
            setDocList([]);

            setFormStatus({ type: 'success', message: 'Problème créé avec succès. Vous pouvez en ajouter un autre.' });
            toast.success('Succès', 'Problème créé avec succès. Vous pouvez en ajouter un autre.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème';
            setFormStatus({ type: 'error', message: errorMessage });
            toast.error('Erreur', errorMessage);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadData = new FormData();
        Array.from(files).forEach(file => {
            uploadData.append('files', file);
        });
        uploadData.append('labels', type);
        uploadData.append('attachedTo', 'temp_issue');

        setIsUploading(true);
        try {
            const token = authAPI.getToken();
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: uploadData,
            });

            const data = await res.json();
            if (data.success) {
                const newDocs = data.data.successful.map((item: any) => ({
                    id: item.document.id,
                    name: item.document.fileName,
                    type: type,
                    url: item.document.filePath
                }));
                setDocList(prev => [...prev, ...newDocs]);
                toast.success('Succès', `${type === 'photo' ? 'Photos' : 'Documents'} téléchargés avec succès`);
            } else {
                toast.error('Erreur', 'Échec du téléchargement : ' + (data.error || 'Erreur inconnue'));
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Erreur', 'Erreur lors du téléchargement des fichiers');
        } finally {
            setIsUploading(false);
        }

        if (e.target) e.target.value = '';
    };

    const handleRemoveFile = (id: string) => {
        setDocList(prev => prev.filter(doc => doc.id !== id));
    };

    const priorityOptions = [
        { value: 'NONE', label: 'Aucune priorité', color: 'gray' },
        { value: 'LOW', label: 'Faible', color: 'blue' },
        { value: 'MEDIUM', label: 'Moyenne', color: 'yellow' },
        { value: 'HIGH', label: 'Haute', color: 'orange' },
        { value: 'CRITICAL', label: 'Critique', color: 'red' },
    ];

    const mockLabelOptions = ['Électrique', 'Mécanique', 'Carrosserie', 'Sécurité', 'Rappel'];

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* ZONE 1: HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium text-sm">
                        <ChevronLeft size={18} /> Problèmes
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">Nouveau Problème</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">Annuler</button>
                    <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
                        <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-bold text-sm hover:bg-gray-50 border-r border-gray-300 transition-colors">
                            Enregistrer et ajouter un autre
                        </button>
                        <button className="px-2 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                            <ChevronDown size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        data-testid="save-button"
                        className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer le problème
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 flex-1 w-full pb-32">
                {/* Section Détails */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>

                    {formStatus.type && (
                        <div
                            className={`mb-6 p-3 border rounded-md text-sm font-medium ${formStatus.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                                }`}
                            data-testid={formStatus.type === 'success' ? 'success-message' : 'error-message'}
                        >
                            {formStatus.message}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Actif <span className="text-red-500">*</span></label>
                            <select
                                data-testid="vehicle-select"
                                className="sr-only"
                                value={formData.vehicleId}
                                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                            >
                                <option value="">Veuillez sélectionner</option>
                                {vehicles.map(v => (
                                    <option key={(v as any).id} value={(v as any).id}>
                                        {(v as any).name || 'Sans nom'}
                                    </option>
                                ))}
                            </select>
                            <VehicleSelect
                                vehicles={vehicles as any[]}
                                selectedVehicleId={formData.vehicleId}
                                onSelect={(id) => handleInputChange('vehicleId', id)}
                                loading={vehiclesLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Priorité</label>
                            <select
                                data-testid="priority-select"
                                className="sr-only"
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                            >
                                {priorityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                {priorityOptions.map((opt) => {
                                    const isSelected = formData.priority === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleInputChange('priority', opt.value)}
                                            aria-pressed={isSelected}
                                            title={isSelected ? `${opt.label} (sélectionné)` : opt.label}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md border-2 transition-all font-bold text-xs ${isSelected
                                                ? opt.value === 'NONE' ? 'bg-white border-gray-500 text-gray-700 ring-2 ring-gray-100' :
                                                    opt.value === 'LOW' ? 'bg-white border-blue-500 text-blue-700 ring-2 ring-blue-100' :
                                                        opt.value === 'MEDIUM' ? 'bg-white border-yellow-500 text-yellow-700 ring-2 ring-yellow-100' :
                                                            opt.value === 'HIGH' ? 'bg-white border-orange-500 text-orange-700 ring-2 ring-orange-100' :
                                                                'bg-white border-red-500 text-red-700 ring-2 ring-red-100'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <Check size={14} className="text-current" />
                                            ) : (
                                                <div
                                                    className={`w-2 h-2 rounded-full ${opt.value === 'NONE' ? 'bg-gray-300' :
                                                        opt.value === 'LOW' ? 'bg-blue-500' :
                                                            opt.value === 'MEDIUM' ? 'bg-yellow-500' :
                                                                opt.value === 'HIGH' ? 'bg-orange-500' : 'bg-red-600'
                                                        }`}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {opt.label}
                                            {isSelected && <span className="sr-only">Sélectionné</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date de signalement <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.reportedDate}
                                        onChange={(e) => handleInputChange('reportedDate', e.target.value)}
                                        className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                    />
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">&nbsp;</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={formData.reportedTime}
                                        onChange={(e) => handleInputChange('reportedTime', e.target.value)}
                                        className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🕒</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Résumé <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                data-testid="summary-input"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                                placeholder="Entrer un résumé"
                            />
                            <p className="mt-1 text-xs text-gray-500">Aperçu bref du problème</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                data-testid="description-textarea"
                                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none resize-none"
                                placeholder="Détails supplémentaires sur le problème..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Étiquettes</label>
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !formData.labels.includes(val)) {
                                            handleInputChange('labels', [...formData.labels, val]);
                                        }
                                        e.target.value = "";
                                    }}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner des étiquettes...</option>
                                    {mockLabelOptions.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            {formData.labels.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.labels.map(l => (
                                        <span key={l} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200">
                                            {l}
                                            <button onClick={() => handleInputChange('labels', formData.labels.filter(it => it !== l))} className="text-gray-400 hover:text-gray-600">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Utilisez les étiquettes pour catégoriser, grouper et plus encore. (par exemple, Électrique)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Signalé par</label>
                            <ContactSelect
                                contacts={contacts}
                                selectedContactId={formData.reportedById}
                                onSelect={(id) => handleInputChange('reportedById', id)}
                                loading={contactsLoading}
                                placeholder="Sélectionner un contact..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Assigné à</label>
                            <ContactSelect
                                contacts={contacts}
                                selectedContactId={formData.assignedTo[0] || ""} // Multi-select not fully supported in simple ContactSelect
                                onSelect={(id) => handleInputChange('assignedTo', [id])}
                                loading={contactsLoading}
                                placeholder="Sélectionner un contact..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section Overdue Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Paramètres d'échéance</h2>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Date d'échéance</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="w-full md:w-1/2 p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none"
                            />
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">(facultatif) Problème considéré comme en retard après cette date</p>
                    </div>
                </div>

                {/* Photos & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Camera size={18} className="text-gray-400" /> Photos
                        </h2>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={photoInputRef}
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'photo')}
                        />
                        <div
                            onClick={() => photoInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group mb-4"
                        >
                            <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-green-50 transition-colors">
                                <Upload size={24} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des photos</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">ou cliquez pour parcourir</p>
                            {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Téléchargement...</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {docList.filter(d => d.type === 'photo').map(photo => (
                                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(photo.id); }} className="bg-white p-1.5 rounded-full text-red-600 hover:bg-red-50 shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileText size={18} className="text-gray-400" /> Documents
                        </h2>
                        <input
                            type="file"
                            multiple
                            ref={documentInputRef}
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'document')}
                        />
                        <div
                            onClick={() => documentInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group mb-4"
                        >
                            <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-green-50 transition-colors">
                                <Upload size={24} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des documents</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">ou cliquez pour parcourir</p>
                            {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Téléchargement...</p>}
                        </div>

                        <div className="space-y-2">
                            {docList.filter(d => d.type === 'document').map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={16} className="text-gray-400 shrink-0" />
                                        <span className="text-xs font-medium text-gray-700 truncate">{doc.name}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(doc.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center bg-transparent border-t border-gray-200 pt-8 mt-4">
                    <button onClick={handleCancel} className="text-[#008751] hover:underline font-bold text-sm transition-all">Annuler</button>
                    <div className="flex gap-4">
                        <button onClick={handleSaveAndAddAnother} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-bold bg-white hover:bg-gray-50 shadow-sm transition-all text-sm">
                            Enregistrer et ajouter un autre
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-md shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 text-sm"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            Enregistrer le problème
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
