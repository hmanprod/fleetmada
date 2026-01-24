'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Loader2, Package, Search, AlertCircle } from 'lucide-react';
import { partsAPI, Category } from '@/lib/services/parts-api';

export default function PartCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await partsAPI.getCategories();
            if (response.success) {
                const data = Array.isArray(response.data)
                    ? response.data
                    : (response.data as any).categories || [];
                setCategories(data);
            }
        } catch (err) {
            setError('Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSaving(true);
        try {
            if (editingCategory) {
                await partsAPI.updateCategory(editingCategory.id, formData);
            } else {
                await partsAPI.createCategory(formData);
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            setError('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            await partsAPI.deleteCategory(id);
            fetchCategories();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
    };

    const filteredCategories = Array.isArray(categories) ? categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Catégories de pièces</h1>
                    <p className="text-gray-500 text-sm">Gérez les types de pièces utilisées dans votre flotte.</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingCategory(null);
                        setFormData({ name: '', description: '' });
                    }}
                    className="bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                    <Plus size={20} /> Nouvelle catégorie
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une catégorie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin text-[#008751] mx-auto mb-4" size={32} />
                            <p className="text-gray-500 font-medium">Chargement des catégories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Aucune catégorie trouvée</p>
                        </div>
                    ) : (
                        filteredCategories.map((category) => (
                            <div key={category.id} className="p-4 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-50 text-[#008751] rounded-lg flex items-center justify-center">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{category.description || 'Aucune description'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => {
                                            setEditingCategory(category);
                                            setFormData({ name: category.name, description: category.description || '' });
                                            setShowForm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-6">
                            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom de la catégorie *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                                    placeholder="Ex: Moteur, Filtration..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                                    placeholder="Détails sur cette catégorie..."
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || !formData.name}
                                    className="py-3 bg-[#008751] text-white font-bold rounded-2xl hover:bg-[#007043] transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : editingCategory ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
