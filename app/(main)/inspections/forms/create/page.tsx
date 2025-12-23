'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, AlertCircle, LayoutGrid, Type, ListChecks, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import type { InspectionTemplateCreateData, InspectionTemplateItem } from '@/lib/services/inspections-api';

export default function CreateInspectionFormPage() {
    const router = useRouter();
    const { createTemplate, loading, error, clearError } = useInspectionTemplates();

    const [formData, setFormData] = useState<InspectionTemplateCreateData>({
        name: '',
        description: '',
        category: 'Général',
        isActive: true,
        items: []
    });

    const [newItem, setNewItem] = useState<{ name: string; category: string; isRequired: boolean }>({
        name: '',
        category: 'Général',
        isRequired: true
    });

    const handleAddItem = () => {
        if (!newItem.name.trim()) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...newItem, sortOrder: prev.items.length } as any]
        }));
        setNewItem({ name: '', category: 'Général', isRequired: true });
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        try {
            await createTemplate(formData);
            router.push('/inspections/forms');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Nouveau Formulaire d'Inspection</h1>
                        <p className="text-sm text-gray-500">Concevez votre processus de vérification</p>
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
                        Enregistrer
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Type size={18} className="text-[#008751]" /> Informations Générales
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom du Formulaire</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                                    placeholder="ex: Inspection Quotidienne"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Catégorie</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Général">Général</option>
                                    <option value="Sécurité">Sécurité</option>
                                    <option value="Mécanique">Mécanique</option>
                                    <option value="Électrique">Électrique</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                                    placeholder="À quoi sert ce formulaire ?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Items Builder */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Item Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-[#008751]" /> Ajouter un Point de Contrôle
                        </h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    placeholder="Libellé du point de contrôle..."
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                >
                                    <option value="Général">Général</option>
                                    <option value="Sécurité">Sécurité</option>
                                    <option value="Mécanique">Mécanique</option>
                                    <option value="Carrosserie">Carrosserie</option>
                                    <option value="Intérieur">Intérieur</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAddItem}
                                className="bg-gray-900 text-white p-3 rounded-xl hover:bg-black transition-colors"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ListChecks size={18} className="text-[#008751]" /> Points de Contrôle ({formData.items.length})
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {formData.items.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Star size={40} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-500">Aucun point de contrôle ajouté pour le moment.</p>
                                </div>
                            ) : (
                                formData.items.map((item, index) => (
                                    <div key={index} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Catégorie: {item.category}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
