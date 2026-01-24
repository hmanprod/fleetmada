'use client';

import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Package, Archive, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePartDetails } from '@/lib/hooks/usePartDetails';
import { useParts } from '@/lib/hooks/useParts';

export default function PartDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { part, loading, error, stockHistory, refresh, adjustStock, isLowStock, isOutOfStock, stockPercentage } = usePartDetails(params.id);
    const [showStockAdjustment, setShowStockAdjustment] = useState(false);
    const [adjustmentData, setAdjustmentData] = useState({ quantity: 0, reason: '', type: 'add' as 'add' | 'remove' | 'set' });
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleBack = () => {
        router.push('/parts');
    };

    const handleEdit = () => {
        router.push(`/parts/${params.id}/edit`);
    };

    const { deletePart } = useParts({ enabled: false });

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const success = await deletePart(params.id);
            if (success) {
                router.push('/parts?deleted=true');
            }
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleStockAdjustment = async () => {
        if (adjustmentData.quantity === 0) {
            alert('Veuillez entrer une quantité à ajuster.');
            return;
        }

        try {
            // Ajuster la quantité si c'est un retrait
            const finalData = {
                ...adjustmentData,
                quantity: adjustmentData.type === 'remove' ? -Math.abs(adjustmentData.quantity) : adjustmentData.quantity
            };
            await adjustStock(finalData);
            setShowStockAdjustment(false);
            setAdjustmentData({ quantity: 0, reason: '', type: 'add' });
        } catch (err) {

            console.error('Erreur lors de l\'ajustement du stock:', err);
        }
    };

    const formatCurrency = (amount: number) => {
        return `Ar ${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStockStatus = () => {
        if (!part) return null;

        if (isOutOfStock) {
            return { status: 'Rupture de stock', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
        } else if (isLowStock) {
            return { status: 'Stock faible', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle };
        } else {
            return { status: 'En stock', color: 'text-green-600', bg: 'bg-green-50', icon: Package };
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} data-testid="back-button" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Parts
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center text-gray-500">
                            <Package size={20} />
                        </div>
                        <div>
                            <h1 data-testid="page-title" className="text-2xl font-bold text-gray-900">{part?.number} <span className="text-gray-400 font-normal">{part?.description}</span></h1>
                        </div>


                    </div>
                </div>

                <div className="flex gap-2 relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={`p-2 border rounded transition-all ${showMoreMenu ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMoreMenu && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => {
                                            setShowMoreMenu(false);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={16} /> Supprimer la pièce
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={handleEdit} data-testid="edit-part-button" className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Modifier
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
                                <span className="ml-2 text-gray-500">Chargement des détails...</span>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-center py-12">
                                <AlertTriangle size={32} className="text-red-500 mb-4" />
                                <div className="text-center">
                                    <p className="text-red-500 mb-2">Erreur de chargement</p>
                                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                                    <button
                                        onClick={refresh}
                                        className="bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded"
                                    >
                                        Réessayer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Part Details */}
                    {part && (
                        <>
                            {/* Stock Status Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-gray-900">État du stock</h2>
                                    <button
                                        onClick={() => setShowStockAdjustment(true)}
                                        data-testid="adjust-stock-button"
                                        className="text-[#008751] text-sm font-medium hover:underline"
                                    >
                                        + Ajuster le stock
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div data-testid="stock-quantity" className="text-3xl font-bold text-gray-900 mb-2">{part.quantity || 0}</div>
                                            <div className="text-sm text-gray-500">Quantité en stock</div>
                                        </div>
                                        <div className="text-center">
                                            <div data-testid="stock-min" className="text-3xl font-bold text-yellow-600 mb-2">{part.minimumStock || 0}</div>
                                            <div className="text-sm text-gray-500">Stock minimum</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getStockStatus()?.bg}`}>
                                                    {React.createElement(getStockStatus()?.icon || Package, { size: 24, className: getStockStatus()?.color })}
                                                </div>
                                            </div>
                                            <div data-testid="stock-status-text" className={`text-sm font-medium ${getStockStatus()?.color}`}>
                                                {getStockStatus()?.status}
                                            </div>
                                            {isLowStock && !isOutOfStock && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {stockPercentage}% du minimum
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-gray-900">Détails</h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Numéro de pièce</div>
                                            <div className="text-sm text-gray-900 font-medium">{part.number}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Description</div>
                                            <div className="text-sm text-gray-900">{part.description || '—'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Catégorie</div>
                                            <div className="text-sm text-gray-900">{part.category || 'Non classé'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Fabricant</div>
                                            <div className="text-sm text-gray-900">{part.manufacturer || '—'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Numéro fabricant</div>
                                            <div className="text-sm text-gray-900">{part.manufacturerPartNumber || '—'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Coût unitaire</div>
                                            <div className="text-sm text-gray-900 font-medium">{formatCurrency(part.cost || 0)}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Unité de mesure</div>
                                            <div className="text-sm text-gray-900">{part.measurementUnit || 'Pièces'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">UPC</div>
                                            <div className="text-sm text-gray-900">{part.upc || '—'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Date de création</div>
                                            <div className="text-sm text-gray-900">{formatDate(part.createdAt)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock History */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-gray-900">Historique du stock</h2>
                                    <button onClick={refresh} className="text-[#008751] text-sm font-medium hover:underline flex items-center gap-1">
                                        <RefreshCw size={14} /> Actualiser
                                    </button>
                                </div>
                                <div className="p-6">
                                    {stockHistory.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>Aucun mouvement de stock enregistré.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {stockHistory.map((movement) => (
                                                <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${movement.type === 'in' ? 'bg-green-100 text-green-600' :
                                                            movement.type === 'out' ? 'bg-red-100 text-red-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {movement.type === 'in' ? <TrendingUp size={16} /> :
                                                                movement.type === 'out' ? <TrendingDown size={16} /> :
                                                                    <RefreshCw size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {movement.type === 'in' ? 'Entrée' :
                                                                    movement.type === 'out' ? 'Sortie' : 'Ajustement'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {formatDate(movement.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-gray-900">
                                                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {movement.previousQuantity} → {movement.newQuantity}
                                                        </div>
                                                        {movement.reason && (
                                                            <div className="text-xs text-gray-400 mt-1">{movement.reason}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Stock Adjustment Modal */}
                    {showStockAdjustment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Ajuster le stock</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'ajustement</label>
                                        <select
                                            value={adjustmentData.type}
                                            onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value as 'add' | 'remove' | 'set' }))}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                            data-testid="adjustment-type"
                                        >
                                            <option value="add">Ajouter</option>
                                            <option value="remove">Retirer</option>
                                            <option value="set">Définir</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                                        <input
                                            type="number"
                                            value={adjustmentData.quantity || ''}
                                            onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                            placeholder="0"
                                            data-testid="adjustment-quantity"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Raison (optionnel)</label>
                                        <textarea
                                            value={adjustmentData.reason}
                                            onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                            rows={3}
                                            placeholder="Ex: Commande reçue, casse, etc."
                                            data-testid="adjustment-reason"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowStockAdjustment(false)}
                                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white border border-gray-300"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleStockAdjustment}
                                        data-testid="confirm-adjustment-button"
                                        className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded"
                                    >
                                        Ajuster
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inventory Locations - placeholder for future implementation */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Emplacements d'inventaire</h2>
                            <button className="text-[#008751] text-sm font-medium hover:underline">+ Ajouter emplacement</button>
                        </div>
                        <div className="p-12 text-center text-gray-500">
                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>Aucun emplacement d'inventaire configuré.</p>
                            <p className="text-sm text-gray-400 mt-2">Cette fonctionnalité sera bientôt disponible.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-[350px] space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Photo</h3>
                        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-gray-400">
                            <Package size={48} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Confirmer la suppression ?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">Cette action est irréversible. Toutes les données liées à cette pièce seront supprimées.</p>
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
    );
}
