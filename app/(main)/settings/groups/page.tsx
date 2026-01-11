"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, ArrowLeft, Loader2, Info, Check } from 'lucide-react';
import Link from 'next/link';
import { useGroups, Group } from '@/lib/hooks/useGroups';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function GroupsManagementPage() {
    const { toast, toasts, removeToast } = useToast();
    const { groups, loading, error, createGroup, updateGroup, deleteGroup } = useGroups();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState('');
    const [groupColor, setGroupColor] = useState('#008751');
    const [isSaving, setIsSaving] = useState(false);

    const COLOR_PALETTE = [
        '#008751', // Default Fleetmada
        '#2563eb', // Blue
        '#4f46e5', // Indigo
        '#7c3aed', // Violet
        '#db2777', // Pink
        '#dc2626', // Red
        '#ea580c', // Orange
        '#ca8a04', // Yellow
        '#0d9488', // Teal
        // '#4b5563', // Gray
    ];

    const handleOpenModal = (group?: Group) => {
        if (group) {
            setEditingGroup(group);
            setGroupName(group.name);
            setGroupColor(group.color || '#008751');
        } else {
            setEditingGroup(null);
            setGroupName('');
            setGroupColor('#008751');
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        setIsSaving(true);
        try {
            let result;
            if (editingGroup) {
                result = await updateGroup(editingGroup.id, groupName, groupColor);
            } else {
                result = await createGroup(groupName, groupColor);
            }

            if (result.success) {
                toast.success(editingGroup ? 'Groupe mis à jour' : 'Groupe créé');
                setIsModalOpen(false);
            } else {
                toast.error(result.error || 'Une erreur est survenue');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${name}" ?`)) {
            const result = await deleteGroup(id);
            if (result.success) {
                toast.success('Groupe supprimé');
            } else {
                toast.error(result.error || 'Erreur lors de la suppression');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gérer les groupes</h1>
                    <p className="text-gray-500 text-sm mt-1">Organisez vos contacts en groupes personnalisés</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[#008751] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#007043] transition-colors"
                >
                    <Plus size={18} /> Nouveau groupe
                </button>
            </div>

            {loading && groups.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#008751]" size={32} />
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-700 flex items-start gap-3">
                    <Info size={18} className="mt-0.5" />
                    <p>{error}</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Aucun groupe pour le moment</p>
                    <button onClick={() => handleOpenModal()} className="text-[#008751] font-semibold mt-2 hover:underline">
                        Créer votre premier groupe
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom du groupe</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Couleur</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacts</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {groups.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#008751' }} />
                                            <span className="font-medium text-gray-900">{group.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {group.color || '#008751'}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {group._count?.contacts || 0} contact(s)
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(group)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id, group.name)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        Nom du groupe <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-[#008751] outline-none"
                                        placeholder="Ex: Équipe Maintenance"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        Couleur
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setGroupColor(color)}
                                                className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center transition-all
                                                    hover:scale-110 active:scale-95
                                                    ${groupColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                                                `}
                                                style={{ backgroundColor: color }}
                                            >
                                                {groupColor === color && (
                                                    <Check size={14} className="text-white drop-shadow-sm" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex gap-2 items-center">
                                        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: groupColor }} />
                                        <input
                                            type="text"
                                            value={groupColor}
                                            onChange={(e) => setGroupColor(e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-md text-xs font-mono"
                                            placeholder="#HEXCODE"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || !groupName.trim()}
                                    className="px-6 py-2 bg-[#008751] text-white font-bold rounded shadow-sm hover:bg-[#007043] disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                                    {editingGroup ? 'Mettre à jour' : 'Créer le groupe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
