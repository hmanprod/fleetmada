'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, MapPin, Phone, Globe, Mail, Store, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVendor } from '@/lib/hooks/useVendors';
import { vendorsAPI } from '@/lib/services/vendors-api';

export default function VendorDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { vendor, loading, error } = useVendor(params.id);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const handleBack = () => {
        router.push('/vendors');
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await vendorsAPI.deleteVendor(params.id);
            router.push('/vendors?deleted=true');
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            alert('Erreur lors de la suppression du fournisseur.');
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleEdit = () => {
        router.push(`/vendors/${params.id}/edit`);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008751]"></div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur lors du chargement</h2>
                <p className="text-gray-600 mb-6">{error || 'Le fournisseur demandé est introuvable.'}</p>
                <button
                    onClick={handleBack}
                    className="bg-[#008751] text-white px-6 py-2 rounded font-medium hover:bg-[#007043]"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <button onClick={handleBack} className="hover:text-gray-700 flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Fournisseurs
                    </button>
                </div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-[#008751] flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-sm overflow-hidden uppercase">
                            {vendor.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{vendor.name}</h1>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div>
                                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Classification</span>
                                    <div className="flex gap-1 mt-1">
                                        {vendor.classification.map(cls => (
                                            <span key={cls} className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{cls}</span>
                                        ))}
                                        {vendor.classification.length === 0 && <span className="font-medium text-gray-900">—</span>}
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Contact</span>
                                    <span className="block font-medium text-gray-900 mt-1">{vendor.contactName || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className={`px-3 py-1.5 border rounded text-sm font-medium transition-colors shadow-sm ${showMoreMenu ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {showMoreMenu && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button
                                            onClick={() => {
                                                setShowMoreMenu(false);
                                                setShowDeleteConfirm(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 size={16} /> Supprimer le fournisseur
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={handleEdit} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors">
                            <Edit2 size={16} /> Modifier
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-8">
                <div className="flex gap-8 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Vue d\'ensemble' },
                        { id: 'fuel', label: 'Historique de carburant' },
                        { id: 'energy', label: 'Historique d\'énergie' },
                        { id: 'service', label: 'Historique d\'entretien' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            {/* Details Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">Informations sur le fournisseur</h2>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Détails de contact</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="grid grid-cols-3 border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 font-medium">Nom du fournisseur</span>
                                            <span className="col-span-2 font-semibold text-gray-900">{vendor.name}</span>
                                        </div>
                                        <div className="grid grid-cols-3 border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 font-medium">Téléphone</span>
                                            <span className="col-span-2 text-[#008751] flex items-center gap-2 font-medium">
                                                <Phone size={14} />
                                                {vendor.phone || '—'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 font-medium">Site Web</span>
                                            <span className="col-span-2 text-[#008751] flex items-center gap-2 font-medium">
                                                <Globe size={14} />
                                                {vendor.website ? (
                                                    <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {vendor.website}
                                                    </a>
                                                ) : '—'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 font-medium">Personne à contacter</span>
                                            <span className="col-span-2 text-gray-900 font-medium">{vendor.contactName || '—'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 border-b border-gray-100 pb-3">
                                            <span className="text-gray-500 font-medium">Email de contact</span>
                                            <span className="col-span-2 text-[#008751] flex items-center gap-2 font-medium">
                                                <Mail size={14} />
                                                {vendor.contactEmail || '—'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 pb-2">
                                            <span className="text-gray-500 font-medium">Adresse</span>
                                            <span className="col-span-2 text-gray-900 flex items-center gap-2 font-medium leading-relaxed">
                                                <MapPin size={14} className="flex-shrink-0" />
                                                {vendor.address || '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Service History Summary */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">Historique d'entretien récent</h2>
                                    <button onClick={() => setActiveTab('service')} className="text-[#008751] text-xs font-bold hover:underline">Voir tout</button>
                                </div>
                                {vendor.transactions?.serviceEntries?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Véhicule</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Coût</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {vendor.transactions.serviceEntries.map((entry: any) => (
                                                    <tr key={entry.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium">{entry.vehicle?.name || '—'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(entry.totalCost)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <div className="bg-gray-100 p-4 rounded-full text-gray-300 mb-4">
                                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 font-medium">Aucun historique d'entretien trouvé</p>
                                        <p className="text-xs text-gray-400 mt-1">Les services effectués chez ce fournisseur apparaîtront ici.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'fuel' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900">Historique de carburant</h2>
                            </div>
                            {vendor.transactions?.fuelEntries?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Véhicule</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Volume</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Coût</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {vendor.transactions.fuelEntries.map((entry: any) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium">{entry.vehicle?.name || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{entry.volume} L</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(entry.cost)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">Aucune entrée de carburant trouvée.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'energy' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900">Historique d'énergie</h2>
                            </div>
                            {vendor.transactions?.chargingEntries?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Véhicule</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Énergie</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Coût</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {vendor.transactions.chargingEntries.map((entry: any) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium">{entry.vehicle?.name || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{entry.energyKwh} kWh</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(entry.cost)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">Aucune entrée d'énergie trouvée.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'service' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900">Historique d'entretien</h2>
                            </div>
                            {vendor.transactions?.serviceEntries?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Véhicule</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Coût</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {vendor.transactions.serviceEntries.map((entry: any) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium">{entry.vehicle?.name || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 italic">{entry.status}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(entry.totalCost)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">Aucun historique d'entretien trouvé.</div>
                            )}
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
                        Fournisseur créé le {new Date(vendor.createdAt).toLocaleDateString()} · Mis à jour le {new Date(vendor.updatedAt).toLocaleDateString()}
                    </div>

                </div>

                {/* Right Column - Stats & Labels */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Statistiques</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg text-center">
                                    <div className="text-xs text-blue-600 font-bold uppercase mb-1">Entretien</div>
                                    <div className="text-2xl font-bold text-blue-900">{vendor.stats?.totalServices || 0}</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg text-center">
                                    <div className="text-xs text-green-600 font-bold uppercase mb-1">Carburant</div>
                                    <div className="text-2xl font-bold text-green-900">{vendor.stats?.totalFuelEntries || 0}</div>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg text-center col-span-2">
                                    <div className="text-xs text-yellow-600 font-bold uppercase mb-1">Énergie</div>
                                    <div className="text-2xl font-bold text-yellow-900">{vendor.stats?.totalChargingEntries || 0}</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg text-center col-span-2">
                                    <div className="text-xs text-purple-600 font-bold uppercase mb-1">Dépense Totale</div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(vendor.stats?.totalValue || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Libellés</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-2 text-sm">
                                {vendor.labels?.length > 0 ? vendor.labels.map(label => (
                                    <span key={label} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                        {label}
                                    </span>
                                )) : <span className="text-gray-400 italic">Aucun libellé</span>}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Notes</h2>
                        </div>
                        <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
                            <div className="bg-gray-100 p-3 rounded-full mb-4">
                                <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium">Ajouter des notes sur ce fournisseur</p>
                        </div>
                    </div>
                </div>

                {/* Modal Confirmation Suppression */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Confirmer la suppression ?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">Cette action est irréversible. Toutes les données liées à ce fournisseur seront supprimées.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="py-2.5 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">Annuler</button>
                                <button onClick={handleDelete} disabled={deleteLoading} className="py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50">
                                    {deleteLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}