'use client';

import React, { useState, useMemo, useRef } from 'react';
import { ChevronDown, Loader2, ChevronLeft, Upload, Search, Settings2, Plus, Info, X, Camera, FileText, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceWorkOrders } from '@/lib/hooks/useServiceWorkOrders';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { VehicleSelect } from '@/app/(main)/vehicles/components/VehicleSelect';
import { ContactSelect } from '@/app/(main)/contacts/components/ContactSelect';
import { VendorSelect } from '@/app/(main)/vendors/components/VendorSelect';
import { useVendors } from '@/lib/hooks/useVendors';
import { useServiceTasks } from '@/lib/hooks/useServiceTasks';
import { useParts } from '@/lib/hooks/useParts';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { ServiceTaskSelect } from '@/app/(main)/service/components/ServiceTaskSelect';
import { PartSelect } from '@/app/(main)/parts/components/PartSelect';
import { authAPI } from '@/lib/auth-api';

export default function WorkOrderCreatePage() {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { createWorkOrder, loading: saving } = useServiceWorkOrders();
    const vehicleQuery = useMemo(() => ({ limit: 500, page: 1, sortBy: 'name', sortOrder: 'asc' }), []);
    const { vehicles, loading: vehiclesLoading } = useVehicles({ query: vehicleQuery as any });
    const { contacts, loading: contactsLoading } = useContacts({ limit: 1000 });
    const { vendors, loading: vendorsLoading } = useVendors({ filters: { limit: 1000 } });
    const { tasks: availableTasks, loading: tasksLoading } = useServiceTasks({ limit: 1000 });
    const { parts: availableParts, loading: partsLoading } = useParts({ limit: 1000 });

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
        labor: [] as any[],
        parts: [] as any[],
        discountType: '%' as '%' | '€',
        discountValue: 0,
        taxType: '%' as '%' | '€',
        taxValue: 0,
    });

    const [activeTab, setActiveTab] = useState<'tasks' | 'labor' | 'parts'>('tasks');
    const [docList, setDocList] = useState<{ id: string; name: string; type: 'photo' | 'document'; url?: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const costSummary = useMemo(() => {
        const subtotalLabor = formData.labor.reduce((acc, item) => acc + (item.cost || 0), 0);
        const subtotalParts = formData.parts.reduce((acc, item) => acc + (item.cost || 0), 0);
        const subtotalTasks = formData.tasks.reduce((acc, item) => acc + (item.cost || 0), 0);
        const subtotal = subtotalLabor + subtotalParts + subtotalTasks;

        let discountValue = 0;
        if (formData.discountType === '%') {
            discountValue = (subtotal * (formData.discountValue || 0)) / 100;
        } else {
            discountValue = (formData.discountValue || 0);
        }

        const afterDiscount = subtotal - discountValue;

        let taxValue = 0;
        if (formData.taxType === '%') {
            taxValue = (afterDiscount * (formData.taxValue || 0)) / 100;
        } else {
            taxValue = (formData.taxValue || 0);
        }

        const total = afterDiscount + taxValue;

        return {
            labor: subtotalLabor,
            parts: subtotalParts,
            tasks: subtotalTasks,
            subtotal,
            discount: discountValue,
            tax: taxValue,
            total
        };
    }, [formData.labor, formData.parts, formData.tasks, formData.discountType, formData.discountValue, formData.taxType, formData.taxValue]);

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
                totalCost: costSummary.total,
                tasks: [
                    ...formData.tasks.map(t => ({
                        serviceTaskId: t.entityId,
                        cost: t.cost,
                        notes: t.notes
                    })),
                    // Note: labor items are currently contacts, we don't have a way to save them as tasks 
                    // without a valid serviceTaskId. Consider adding a default "Labor" task in DB.
                ],
                parts: formData.parts.map(p => ({
                    partId: p.entityId,
                    quantity: 1,
                    unitCost: p.cost,
                    notes: p.notes
                })),
                documents: docList.map(d => d.id),
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

    const addLineItem = (type: 'tasks' | 'labor' | 'parts', entityId: string, entityName: string, cost: number = 0) => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            entityId,
            name: entityName,
            cost: cost,
            notes: ''
        };
        handleInputChange(type, [...formData[type], newItem]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadData = new FormData();
        Array.from(files).forEach(file => {
            uploadData.append('files', file);
        });
        uploadData.append('labels', type);
        uploadData.append('attachedTo', 'temp_work_order'); // Temporary attachment until saved

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

        // Reset input
        if (e.target) e.target.value = '';
    };

    const handleRemoveFile = (id: string) => {
        setDocList(prev => prev.filter(doc => doc.id !== id));
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Fournisseur</label>
                            <VendorSelect
                                vendors={vendors}
                                selectedVendorId={formData.vendorId}
                                onSelect={(id) => handleInputChange('vendorId', id)}
                                loading={vendorsLoading}
                                placeholder="Sélectionner un fournisseur"
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Éléments de ligne</h2>
                            <button disabled className="px-4 py-1.5 bg-gray-100 text-gray-400 text-xs font-bold rounded cursor-not-allowed">
                                Aucun rappel d'entretien
                            </button>
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-end border-b border-gray-100">
                                <div className="flex gap-8">
                                    {(['tasks', 'labor', 'parts'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-[#008751]' : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            {tab === 'tasks' ? 'Tâches d\'entretien' : tab === 'labor' ? 'Main-d\'œuvre' : 'Pièces'}
                                            {activeTab === tab && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008751]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center gap-2 text-sm text-gray-600 font-bold mb-4 hover:text-gray-900 transition-colors">
                                    <Settings2 size={16} /> Personnaliser
                                </button>
                            </div>
                        </div>

                        <div className="mt-6">
                            {activeTab === 'tasks' ? (
                                <ServiceTaskSelect
                                    tasks={availableTasks}
                                    onSelect={(id, name) => addLineItem('tasks', id, name)}
                                    loading={tasksLoading}
                                    placeholder="Rechercher des tâches d'entretien..."
                                />
                            ) : activeTab === 'labor' ? (
                                <ContactSelect
                                    contacts={contacts}
                                    onSelect={(id) => {
                                        const contact = contacts.find(c => c.id === id);
                                        if (contact) addLineItem('labor', id, `${contact.firstName} ${contact.lastName}`);
                                    }}
                                    loading={contactsLoading}
                                    placeholder="Rechercher des techniciens..."
                                />
                            ) : (
                                <PartSelect
                                    parts={availableParts}
                                    onSelect={(id, name, cost) => addLineItem('parts', id, name, cost)}
                                    loading={partsLoading}
                                    placeholder="Rechercher des pièces..."
                                />
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50/30">
                        {formData[activeTab].length === 0 ? (
                            <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-100 p-12">
                                <p className="text-sm font-medium mb-4">
                                    Aucun élément de ligne de {activeTab === 'tasks' ? 'tâche d\'entretien' : activeTab === 'labor' ? 'main-d\'œuvre' : 'pièce'} ajouté
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData[activeTab].map((item: any) => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                            {item.entityId && <span className="text-[11px] text-gray-500 uppercase font-bold tracking-tight">ID: {item.entityId.slice(-6)}</span>}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Coût</span>
                                                <input
                                                    type="number"
                                                    value={item.cost}
                                                    onChange={(e) => {
                                                        const newItems = formData[activeTab].map((it: any) =>
                                                            it.id === item.id ? { ...it, cost: parseFloat(e.target.value) || 0 } : it
                                                        );
                                                        handleInputChange(activeTab, newItems);
                                                    }}
                                                    className="w-24 text-right border-none p-0 focus:ring-0 font-bold text-gray-900"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newItems = formData[activeTab].filter((it: any) => it.id !== item.id);
                                                    handleInputChange(activeTab, newItems);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Cost Summary & Description */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4">Description</label>
                                <textarea
                                    className="w-full h-48 border border-gray-300 rounded-lg p-4 focus:ring-[#008751] focus:border-[#008751] transition-all outline-none text-sm resize-none shadow-sm"
                                    placeholder="Ajouter des notes ou des détails supplémentaires"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-100 pb-2">Récapitulatif des coûts</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-gray-500">Sous-total</span>
                                        <span className="text-gray-900 font-bold">{costSummary.subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 pl-4 border-l-2 border-gray-100">Main-d'œuvre</span>
                                        <span className="text-gray-500">{costSummary.labor.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 pl-4 border-l-2 border-gray-100">Pièces</span>
                                        <span className="text-gray-500">{costSummary.parts.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm pt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-bold">Remise</span>
                                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-9">
                                                <select
                                                    value={formData.discountType}
                                                    onChange={(e) => handleInputChange('discountType', e.target.value)}
                                                    className="bg-gray-50 border-r border-gray-300 px-2 py-1 text-xs font-bold outline-none cursor-pointer hover:bg-gray-100 h-full"
                                                >
                                                    <option value="%">%</option>
                                                    <option value="€">€</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={formData.discountValue}
                                                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 text-sm font-bold outline-none text-center h-full border-none focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                        <span className="text-gray-900 font-bold">{costSummary.discount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-bold">Taxe</span>
                                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-9">
                                                <select
                                                    value={formData.taxType}
                                                    onChange={(e) => handleInputChange('taxType', e.target.value)}
                                                    className="bg-gray-50 border-r border-gray-300 px-2 py-1 text-xs font-bold outline-none cursor-pointer hover:bg-gray-100 h-full"
                                                >
                                                    <option value="%">%</option>
                                                    <option value="€">€</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={formData.taxValue}
                                                    onChange={(e) => handleInputChange('taxValue', parseFloat(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 text-sm font-bold outline-none text-center h-full border-none focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                        <span className="text-gray-900 font-bold">{costSummary.tax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                    </div>

                                    <div className="pt-6 border-t font-black text-gray-900 mt-6 flex justify-between items-center">
                                        <span className="text-lg uppercase tracking-tight">Total</span>
                                        <span className="text-2xl">{costSummary.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photos & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-primary flex items-center gap-2">
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
                            className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group mb-4"
                        >
                            <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-green-50 transition-colors">
                                <Upload size={32} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des photos</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">ou cliquez pour parcourir vos fichiers</p>
                            {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Téléchargement...</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {docList.filter(d => d.type === 'photo').map(photo => (
                                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                                    {photo.url ? (
                                        <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Camera size={24} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(photo.id); }}
                                            className="bg-white p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-[10px] truncate">
                                        {photo.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-primary flex items-center gap-2">
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
                            className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group mb-4"
                        >
                            <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-green-50 transition-colors">
                                <Upload size={32} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des documents</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">ou cliquez pour parcourir vos fichiers</p>
                            {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Téléchargement...</p>}
                        </div>

                        <div className="space-y-2">
                            {docList.filter(d => d.type === 'document').map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={18} className="text-gray-400 shrink-0" />
                                        <span className="text-sm font-medium text-gray-700 truncate">{doc.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(doc.id); }}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
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
        </div>
    );
}
