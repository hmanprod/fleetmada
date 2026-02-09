'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, HelpCircle, MapPin, CameraOff, Palette, FileJson, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import inspectionsAPI, { InspectionTemplateCreateData, InspectionTemplate, JsonTemplateMetadata } from '@/lib/services/inspections-api';

const COLORS = [
    { name: 'Aucune', value: undefined },
    { name: 'Rouge', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Jaune', value: '#eab308' },
    { name: 'Vert', value: '#22c55e' },
    { name: 'Bleu', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#a855f7' },
];

export default function CreateInspectionFormPage() {
    const router = useRouter();
    const { createTemplate, loading: loadingHooks } = useInspectionTemplates();
    const [submitting, setSubmitting] = useState(false);
    const [jsonTemplates, setJsonTemplates] = useState<JsonTemplateMetadata[]>([]);
    const [loadingJson, setLoadingJson] = useState(false);

    const [formData, setFormData] = useState<InspectionTemplateCreateData & { copyFromJson?: string }>({
        name: '',
        description: '',
        category: 'Général',
        color: undefined,
        enableLocationException: true,
        preventStoredPhotos: true,
        copyFromJson: '',
        items: []
    });

    useEffect(() => {
        const fetchJsonTemplates = async () => {
            setLoadingJson(true);
            try {
                const data = await inspectionsAPI.getJsonTemplates();
                setJsonTemplates(data);
            } catch (err) {
                console.error("Échec de récupération des modèles JSON :", err);
            } finally {
                setLoadingJson(false);
            }
        };
        fetchJsonTemplates();
    }, []);

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        setSubmitting(true);
        try {
            const newTemplate = await createTemplate(formData);
            // After creation, redirect to the advanced builder (edit page)
            router.push(`/inspections/forms/${newTemplate.id}/edit?created=true`);
        } catch (err) {
            console.error(err);
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center transition-all">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <button onClick={() => router.push('/inspections/forms')} className="hover:text-gray-900 transition-colors">Formulaires d’inspection</button>
                        </nav>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">Nouveau formulaire d’inspection</h1>
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
                        disabled={submitting || !formData.name}
                        className="px-6 py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-xl shadow-lg shadow-green-900/10 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <span>Enregistrer le formulaire</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                        <h2 className="text-xl font-bold text-gray-900">Détails</h2>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                Titre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-gray-400"
                                placeholder=""
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Description</label>
                            <textarea
                                rows={4}
                                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-gray-400 resize-none"
                                placeholder=""
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Copy From Template */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Copier depuis un modèle</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                                    value={formData.copyFromJson}
                                    onChange={e => {
                                        const selected = jsonTemplates.find(t => t.filename === e.target.value);
                                        setFormData({
                                            ...formData,
                                            copyFromJson: e.target.value,
                                            name: selected ? selected.title : formData.name,
                                            category: selected ? selected.category : formData.category,
                                            description: selected ? selected.description || '' : formData.description
                                        });
                                    }}
                                    disabled={loadingJson}
                                >
                                    <option value="">{loadingJson ? 'Chargement des modèles...' : 'Veuillez sélectionner'}</option>
                                    {jsonTemplates.map((template) => (
                                        <option key={template.filename} value={template.filename}>
                                            {template.title} ({template.category})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    {loadingJson ? <Loader2 size={18} className="animate-spin" /> : <FileJson size={18} />}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">Choisissez un modèle JSON standard comme point de départ (optionnel)</p>
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Palette size={16} className="text-gray-400" /> Couleur
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
                                    <p className="text-xs text-gray-500 mt-1">Permet d’enregistrer une exception si l’inspection se fait hors de la zone attendue.</p>
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
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Empêcher l’utilisation de photos stockées</p>
                                    <p className="text-xs text-gray-500 mt-1">Les utilisateurs ne pourront joindre des photos qu’en les prenant avec la caméra de l’appareil.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => router.back()}
                            className="text-sm font-bold text-[#008751] hover:text-[#007043] transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={submitting || !formData.name}
                            className="px-8 py-3 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Création…' : 'Enregistrer le formulaire'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
