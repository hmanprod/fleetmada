'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Loader2, Factory, Search, AlertCircle, Globe } from 'lucide-react';
import { partsAPI, Manufacturer } from '@/lib/services/parts-api';

export default function ManufacturerSettingsPage() {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', website: '' });

    const fetchManufacturers = async () => {
        setLoading(true);
        try {
            const response = await partsAPI.getManufacturers();
            if (response.success) {
                setManufacturers(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des fabricants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManufacturers();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSaving(true);
        try {
            if (editingManufacturer) {
                await partsAPI.updateManufacturer(editingManufacturer.id, formData);
            } else {
                await partsAPI.createManufacturer(formData);
            }
            setShowForm(false);
            setEditingManufacturer(null);
            setFormData({ name: '', description: '', website: '' });
            fetchManufacturers();
        } catch (err) {
            setError('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce fabricant ?')) return;

        try {
            await partsAPI.deleteManufacturer(id);
            fetchManufacturers();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
    };

    const filteredManufacturers = manufacturers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.website?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fabricants de pièces</h1>
                    <p className="text-gray-500 text-sm">Gérez la liste des fabricants et fournisseurs de pièces.</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingManufacturer(null);
                        setFormData({ name: '', description: '', website: '' });
                    }}
                    className="bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                    <Plus size={20} /> Nouveau fabricant
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
                            placeholder="Rechercher un fabricant..."
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
                            <p className="text-gray-500 font-medium">Chargement des fabricants...</p>
                        </div>
                    ) : filteredManufacturers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Factory className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Aucun fabricant trouvé</p>
                        </div>
                    ) : (
                        filteredManufacturers.map((m) => (
                            <div key={m.id} className="p-4 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <Factory size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{m.name}</h3>
                                        <div className="flex items-center gap-4 mt-0.5">
                                            <p className="text-xs text-gray-500 line-clamp-1">{m.description || 'Aucune description'}</p>
                                            {m.website && (
                                                <a href={m.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline">
                                                    <Globe size={10} /> SITE WEB
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => {
                                            setEditingManufacturer(m);
                                            setFormData({
                                                name: m.name,
                                                description: m.description || '',
                                                website: m.website || ''
                                            });
                                            setShowForm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(m.id)}
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
                            {editingManufacturer ? 'Modifier le fabricant' : 'Nouveau fabricant'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom du fabricant *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                                    placeholder="Ex: Bosch, Continental..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Site Web</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                                        placeholder="https://www.bosch.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                                    placeholder="Détails sur ce fabricant..."
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
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : editingManufacturer ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
