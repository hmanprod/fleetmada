'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Save, Plus, Trash2, Star, RefreshCw, Calendar, Car, Clock, Settings2,
    Hash, FileText, CheckSquare, PenTool, Image as ImageIcon, Heading,
    Layout, ChevronDown, ChevronUp, GripVertical, Copy, MoreVertical,
    CheckCircle2, XCircle, AlertCircle, Type, ListChecks, Info,
    Gauge, CalendarClock, Palette, MapPin, CameraOff, HelpCircle
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import type { InspectionTemplateUpdateData, InspectionTemplateItem, InspectionTemplate } from '@/lib/services/inspections-api';
import inspectionsAPI from '@/lib/services/inspections-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';

const COLORS = [
    { name: 'None', value: null },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#a855f7' },
];

export default function EditInspectionFormPage() {
    const router = useRouter();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'questions';

    const [activeTab, setActiveTab] = useState(initialTab);
    const { getTemplate, updateTemplate, loading, error, clearError } = useInspectionTemplates();
    const { toast, toasts, removeToast } = useToast();

    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        category: 'Général',
        color: null,
        isActive: true,
        enableLocationException: true,
        preventStoredPhotos: true,
        items: []
    });

    const [fetching, setFetching] = useState(true);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Schedules State
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        ruleType: 'ALL_VEHICLES',
        ruleValue: '',
        scheduleEnabled: false,
        frequencyType: 'WEEKLY',
        frequencyInterval: 1
    });

    useEffect(() => {
        if (id) {
            loadTemplate();
            loadSchedules();
        }

        if (searchParams.get('created') === 'true') {
            toast.success('Formulaire créé', 'Vous pouvez maintenant configurer les détails et les questions.');
        }
    }, [id, searchParams]);

    const loadTemplate = async () => {
        try {
            setFetching(true);
            const template = await getTemplate(id as string);
            setFormData({
                name: template.name,
                description: template.description || '',
                category: template.category,
                color: template.color || null,
                isActive: template.isActive,
                enableLocationException: template.enableLocationException ?? true,
                preventStoredPhotos: template.preventStoredPhotos ?? true,
                items: template.items || []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const loadSchedules = async () => {
        try {
            setLoadingSchedules(true);
            const data = await inspectionsAPI.getSchedules(id as string);
            setSchedules(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleAddItem = (type: any) => {
        const newItem = {
            name: type === 'HEADER' ? 'Nouvelle section' : 'Nouvel élément',
            category: 'Général',
            isRequired: type !== 'HEADER',
            type: type as any,
            options: [],
            unit: '',
            instructions: '',
            shortDescription: '',
            passLabel: 'Pass',
            failLabel: 'Fail',
            requirePhotoOnPass: false,
            requirePhotoOnFail: false,
            enableNA: true,
            sortOrder: (formData.items || []).length,
            dateTimeType: 'DATE_ONLY',
            minRange: undefined,
            maxRange: undefined,
            requireSecondaryMeter: false
        };

        setFormData((prev: any) => {
            const newItems = [...(prev.items || []), newItem];
            return { ...prev, items: newItems };
        });

        setExpandedItem((formData.items || []).length);
    };

    const handleUpdateItem = (index: number, updates: any) => {
        setFormData((prev: any) => {
            const newItems = [...(prev.items || [])];
            newItems[index] = { ...newItems[index], ...updates };
            return { ...prev, items: newItems };
        });
    };

    const handleDuplicateItem = (index: number) => {
        const itemToDuplicate = formData.items[index];
        const newItem = { ...itemToDuplicate, sortOrder: formData.items.length };
        setFormData((prev: any) => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setExpandedItem(formData.items.length);
    };

    const handleRemoveItem = (index: number) => {
        setFormData((prev: any) => {
            const newItems = (prev.items || []).filter((_: any, i: number) => i !== index);
            return { ...prev, items: newItems };
        });
        if (expandedItem === index) setExpandedItem(null);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        try {
            console.log('Données envoyées:', formData);
            await updateTemplate(id as string, formData);
            router.push('/inspections/forms?updated=true');
        } catch (err: any) {
            console.error('Erreur lors de la sauvegarde:', err);
            toast.error('Erreur de mise à jour', err.message || 'Une erreur est survenue lors de l\'enregistrement.');
        }
    };

    const handleAddSchedule = async () => {
        try {
            const payload = {
                ...newSchedule,
                scheduleEnabled: true
            };
            await inspectionsAPI.createSchedule(id as string, payload);
            await loadSchedules();
            setNewSchedule({
                ruleType: 'ALL_VEHICLES',
                ruleValue: '',
                scheduleEnabled: false,
                frequencyType: 'WEEKLY',
                frequencyInterval: 1
            });
        } catch (err) {
            console.error(err);
            alert('Failed to add schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!confirm('Are you sure you want to remove this rule?')) return;
        try {
            await inspectionsAPI.deleteSchedule(id as string, scheduleId);
            await loadSchedules();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <RefreshCw className="animate-spin text-[#008751] mb-4" size={40} />
                <p className="text-gray-500 font-medium tracking-tight">Chargement du formulaire...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 italic">Modifier: {formData.name}</h1>
                        <p className="text-sm text-gray-500">Mettez à jour votre processus de vérification</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !formData.name}
                        className="px-6 py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-xl shadow-lg shadow-green-900/10 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={20} />}
                        Mettre à jour
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'questions' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <ListChecks size={16} /> Questions & Items
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'schedules' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Calendar size={16} /> Vehicles & Schedules
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'info' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Info size={16} /> Information
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4">
                {activeTab === 'info' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                            <h2 className="text-xl font-bold text-gray-900">Information du Modèle</h2>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-gray-400"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Catégorie</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-gray-400"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Description</label>
                                        <textarea
                                            rows={4}
                                            className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-gray-400 resize-none"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Color Picker */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                            <Palette size={16} className="text-gray-400" /> Couleur d'identification
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${formData.color === color.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                                                        }`}
                                                    style={{ backgroundColor: color.value || '#f3f4f6' }}
                                                    title={color.name}
                                                >
                                                    {!color.value && <div className="w-6 h-[2px] bg-gray-400 rotate-45" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Settings */}
                                    <div className="space-y-6 pt-2">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative flex items-center mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={formData.enableLocationException}
                                                    onChange={e => setFormData({ ...formData, enableLocationException: e.target.checked })}
                                                />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#008751]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Activer le suivi des exceptions de localisation</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative flex items-center mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={formData.preventStoredPhotos}
                                                    onChange={e => setFormData({ ...formData, preventStoredPhotos: e.target.checked })}
                                                />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#008751]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Empêcher l'utilisation de photos enregistrées</p>
                                                <p className="text-xs text-gray-500 mt-1">Les utilisateurs ne pourront joindre que des photos prises avec l'appareil photo</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative flex items-center mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={formData.isActive}
                                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#008751]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Modèle Actif</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'questions' ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Builder Area (Left) */}
                        <div className="flex-1 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <ListChecks size={16} className="text-[#008751]" />
                                        <span>Liste des questions ({formData.items?.length || 0})</span>
                                    </h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddItem('HEADER')}
                                            className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            <Plus size={14} /> Section
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    {formData.items?.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            <Layout size={40} className="mb-3 opacity-20" />
                                            <p className="text-sm font-medium italic">Aucune question ajoutée pour le moment</p>
                                            <p className="text-xs">Commencez par ajouter une section ou un élément de contrôle</p>
                                        </div>
                                    ) : (
                                        formData.items?.map((item: any, index: number) => (
                                            <div key={index} className={`group bg-white border ${expandedItem === index ? 'border-[#008751] shadow-lg scale-[1.01]' : 'border-gray-100 hover:border-gray-200 shadow-sm'} rounded-xl transition-all overflow-hidden`}>
                                                {/* Item Header */}
                                                <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedItem(expandedItem === index ? null : index)}>
                                                    <div className="text-gray-300 cursor-grab active:cursor-grabbing">
                                                        <GripVertical size={16} />
                                                    </div>
                                                    <div className={`p-2 rounded-lg ${item.type === 'HEADER' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-[#008751]'}`}>
                                                        {item.type === 'PASS_FAIL' && <CheckSquare size={16} />}
                                                        {item.type === 'NUMERIC' && <Hash size={16} />}
                                                        {item.type === 'METER' && <Gauge size={16} />}
                                                        {item.type === 'TEXT' && <FileText size={16} />}
                                                        {item.type === 'MULTIPLE_CHOICE' && <ListChecks size={16} />}
                                                        {item.type === 'SIGNATURE' && <PenTool size={16} />}
                                                        {item.type === 'PHOTO' && <ImageIcon size={16} />}
                                                        {item.type === 'HEADER' && <Heading size={16} />}
                                                        {item.type === 'DATE_TIME' && <CalendarClock size={16} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className={`text-sm font-bold truncate ${item.type === 'HEADER' ? 'text-indigo-900 uppercase tracking-wider' : 'text-gray-900'}`}>{item.name}</h3>
                                                            {item.isRequired && <span className="text-[10px] font-black bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-100 uppercase">Obligatoire</span>}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 truncate">{item.category}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicateItem(index); }}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                            title="Dupliquer"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="text-gray-400">
                                                        {expandedItem === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                {expandedItem === index && (
                                                    <div className="p-4 border-t border-gray-50 bg-gray-50/50 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question / Label</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-[#008751] outline-none"
                                                                    value={item.name}
                                                                    onChange={e => handleUpdateItem(index, { name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catégorie</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-[#008751] outline-none"
                                                                    value={item.category}
                                                                    onChange={e => handleUpdateItem(index, { category: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>

                                                        {item.type !== 'HEADER' && (
                                                            <>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructions (Optionnel)</label>
                                                                    <textarea
                                                                        className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-[#008751] outline-none resize-none"
                                                                        rows={2}
                                                                        value={item.instructions || ''}
                                                                        onChange={e => handleUpdateItem(index, { instructions: e.target.value })}
                                                                    />
                                                                </div>

                                                                <div className="flex flex-wrap gap-4 pt-2">
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded text-[#008751] focus:ring-[#008751]"
                                                                            checked={item.isRequired}
                                                                            onChange={e => handleUpdateItem(index, { isRequired: e.target.checked })}
                                                                        />
                                                                        <span className="text-xs font-bold text-gray-700">Réponse obligatoire</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded text-[#008751] focus:ring-[#008751]"
                                                                            checked={item.enableNA}
                                                                            onChange={e => handleUpdateItem(index, { enableNA: e.target.checked })}
                                                                        />
                                                                        <span className="text-xs font-bold text-gray-700">Autoriser N/A</span>
                                                                    </label>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded text-[#008751] focus:ring-[#008751]"
                                                                            checked={item.requirePhotoOnPass}
                                                                            onChange={e => handleUpdateItem(index, { requirePhotoOnPass: e.target.checked })}
                                                                        />
                                                                        <span className="text-xs font-bold text-gray-700">Photo exigée sur Pass</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded text-[#008751] focus:ring-[#008751]"
                                                                            checked={item.requirePhotoOnFail}
                                                                            onChange={e => handleUpdateItem(index, { requirePhotoOnFail: e.target.checked })}
                                                                        />
                                                                        <span className="text-xs font-bold text-gray-700">Photo exigée sur Fail</span>
                                                                    </label>
                                                                </div>

                                                                {item.type === 'PASS_FAIL' && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-1.5">
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Label Pass</label>
                                                                            <input type="text" className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg" value={item.passLabel} onChange={e => handleUpdateItem(index, { passLabel: e.target.value })} />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Label Fail</label>
                                                                            <input type="text" className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg" value={item.failLabel} onChange={e => handleUpdateItem(index, { failLabel: e.target.value })} />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {item.type === 'NUMERIC' && (
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div className="space-y-1.5">
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unité</label>
                                                                            <input type="text" className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg" value={item.unit} onChange={e => handleUpdateItem(index, { unit: e.target.value })} placeholder="ex: km, L, %" />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min</label>
                                                                            <input type="number" className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg" value={item.minRange || ''} onChange={e => handleUpdateItem(index, { minRange: e.target.value ? parseFloat(e.target.value) : undefined })} />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max</label>
                                                                            <input type="number" className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg" value={item.maxRange || ''} onChange={e => handleUpdateItem(index, { maxRange: e.target.value ? parseFloat(e.target.value) : undefined })} />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {item.type === 'MULTIPLE_CHOICE' && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Options (séparées par des virgules)</label>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg"
                                                                            value={item.options?.join(', ') || ''}
                                                                            onChange={e => handleUpdateItem(index, { options: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                                                            placeholder="Option 1, Option 2, Option 3"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {item.type === 'DATE_TIME' && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Format</label>
                                                                        <select
                                                                            className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-[#008751] outline-none"
                                                                            value={item.dateTimeType || 'DATE_ONLY'}
                                                                            onChange={e => handleUpdateItem(index, { dateTimeType: e.target.value })}
                                                                        >
                                                                            <option value="DATE_ONLY">Date seulement</option>
                                                                            <option value="DATE_TIME">Date et Heure</option>
                                                                            <option value="TIME_ONLY">Heure seulement</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right) */}
                        <div className="w-full lg:w-80 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ajouter un élément</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { type: 'PASS_FAIL', label: 'Pass/Fail', icon: CheckSquare, color: 'text-green-600 bg-green-50' },
                                        { type: 'NUMERIC', label: 'Numérique', icon: Hash, color: 'text-blue-600 bg-blue-50' },
                                        { type: 'METER', label: 'Compteur', icon: Gauge, color: 'text-orange-600 bg-orange-50' },
                                        { type: 'TEXT', label: 'Texte libre', icon: FileText, color: 'text-purple-600 bg-purple-50' },
                                        { type: 'MULTIPLE_CHOICE', label: 'Liste', icon: ListChecks, color: 'text-amber-600 bg-amber-50' },
                                        { type: 'PHOTO', label: 'Photo', icon: ImageIcon, color: 'text-pink-600 bg-pink-50' },
                                        { type: 'SIGNATURE', label: 'Signature', icon: PenTool, color: 'text-cyan-600 bg-cyan-50' },
                                        { type: 'DATE_TIME', label: 'Date/Heure', icon: CalendarClock, color: 'text-indigo-600 bg-indigo-50' },
                                    ].map((btn) => (
                                        <button
                                            key={btn.type}
                                            onClick={() => handleAddItem(btn.type)}
                                            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-[#008751] hover:shadow-md transition-all active:scale-95 group"
                                        >
                                            <div className={`p-2 rounded-lg ${btn.color} group-hover:scale-110 transition-transform`}>
                                                <btn.icon size={18} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600">{btn.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'schedules' ? (
                    <div className="space-y-6">
                        {/* New Schedule Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 italic">
                                        <CalendarClock size={16} className="text-[#008751]" />
                                        <span>AJOUTER UNE RÈGLE DE PLANIFICATION</span>
                                    </h2>
                                    <p className="text-[11px] text-gray-500 font-medium">Définissez quand cette inspection doit être effectuée</p>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Véhicules cibles</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#008751] outline-none appearance-none font-bold"
                                                value={newSchedule.ruleType}
                                                onChange={e => setNewSchedule({ ...newSchedule, ruleType: e.target.value })}
                                            >
                                                <option value="ALL_VEHICLES">Tous les véhicules</option>
                                                <option value="VEHICLE_TYPE">Par type de véhicule</option>
                                                <option value="VEHICLE_ID">Véhicule spécifique</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-900" size={16} />
                                        </div>
                                    </div>

                                    {newSchedule.ruleType !== 'ALL_VEHICLES' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valeur du filtre</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#008751] outline-none font-bold placeholder:font-medium placeholder:italic text-gray-900 shadow-sm transition-all"
                                                placeholder={newSchedule.ruleType === 'VEHICLE_TYPE' ? "ex: SUV, Truck..." : "ex: ID du véhicule"}
                                                value={newSchedule.ruleValue}
                                                onChange={e => setNewSchedule({ ...newSchedule, ruleValue: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fréquence</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <select
                                                    className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#008751] outline-none appearance-none font-bold"
                                                    value={newSchedule.frequencyType}
                                                    onChange={e => setNewSchedule({ ...newSchedule, frequencyType: e.target.value as any })}
                                                >
                                                    <option value="DAILY">Quotidien</option>
                                                    <option value="WEEKLY">Hebdomadaire</option>
                                                    <option value="MONTHLY">Mensuel</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-900" size={16} />
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-20 p-3 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#008751] outline-none font-bold"
                                                value={newSchedule.frequencyInterval}
                                                onChange={e => setNewSchedule({ ...newSchedule, frequencyInterval: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleAddSchedule}
                                        className="px-8 py-3 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Enregistrer la Règle
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Schedules List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 italic uppercase">
                                    <Clock size={16} className="text-[#008751]" />
                                    Règles de planification actives ({schedules.length})
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {schedules.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 italic font-medium">
                                        Aucune règle de planification pour ce modèle
                                    </div>
                                ) : (
                                    schedules.map((schedule) => (
                                        <div key={schedule.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className="p-3 bg-[#008751]/10 text-[#008751] rounded-2xl">
                                                    <Calendar size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black bg-gray-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                                                            {schedule.ruleType === 'ALL_VEHICLES' ? 'Tous les véhicules' : schedule.ruleValue}
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            Tous les {schedule.frequencyInterval > 1 ? schedule.frequencyInterval : ''} {
                                                                schedule.frequencyType === 'DAILY' ? 'Jours' :
                                                                    schedule.frequencyType === 'WEEKLY' ? 'Semaines' : 'Mois'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                                        <span className="flex items-center gap-1"><Car size={12} /> {schedule.ruleType}</span>
                                                        <span className="flex items-center gap-1"><RefreshCw size={12} /> {schedule.frequencyType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
