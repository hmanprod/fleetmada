'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Edit, MoreHorizontal, Calendar, Clock, Gauge, FileText, User, Store, Trash2, MessageSquare, Wrench, Package, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceEntry } from '@/lib/hooks/useServiceEntry';
import { serviceAPI, ServiceEntryCommentData } from '@/lib/services/service-api';
import { EntitySidebar } from '@/components/EntitySidebar';
import { useServiceEntryComments } from '@/lib/hooks/useServiceEntryComments';
import { useServiceEntryPhotos } from '@/lib/hooks/useServiceEntryPhotos';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { entry, loading, error } = useServiceEntry(params.id);
    const [showMenu, setShowMenu] = useState(false);

    // Sidebar State
    const [activePanel, setActivePanel] = useState<'comments' | 'photos' | 'documents' | null>('comments');

    // Comments Hook
    const {
        comments,
        loading: commentsLoading,
        addComment,
        fetchComments
    } = useServiceEntryComments(params.id);

    // Photos Hook
    const {
        photos,
        loading: photosLoading,
        error: photosError,
        addPhoto: addPhotoHandler,
        deletePhoto: deletePhotoHandler,
        refreshPhotos
    } = useServiceEntryPhotos(params.id);

    // Documents Hook
    const {
        documents,
        loading: documentsLoading,
        error: documentsError,
        refreshDocuments,
    } = useDocuments({
        attachedTo: 'serviceEntry',
        attachedId: params.id,
        limit: 50
    });

    const { uploadSingleDocument } = useUploadDocuments();

    // Handlers for Sidebar
    const handleAddCommentWrapper = async (message: string, attachments?: File[]) => {
        if (!entry) return;
        try {
            const commentData: ServiceEntryCommentData = {
                author: 'CurrentUser', // En prod, on récupère le nom de l'utilisateur connecté
                content: message
            };
            await addComment(params.id, commentData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddPhotoWrapper = async (files: FileList) => {
        await addPhotoHandler(files);
    };

    const handleAddDocumentWrapper = async (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            await uploadSingleDocument(files[i], {
                attachedTo: 'serviceEntry',
                attachedId: params.id,
                fileName: files[i].name,
                mimeType: files[i].type
            });
        }
        refreshDocuments();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu && !(event.target as Element).closest('.more-menu-container')) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet ordre de travail ? Cette action est irréversible.')) {
            return;
        }

        try {
            const response = await serviceAPI.deleteServiceEntry(params.id);
            if (response.success) {
                toast.success('Succès', 'Ordre de travail supprimé');
                router.push('/service/work-orders');
            } else {
                toast.error('Erreur', 'Échec de la suppression : ' + (response.error || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            toast.error('Erreur', 'Une erreur est survenue lors de la suppression');
        }
    };

    const handleBack = () => {
        router.push('/service/work-orders');
    };

    const handleEdit = () => {
        router.push(`/service/work-orders/${params.id}/edit`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
            </div>
        );
    }

    if (error || !entry) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="text-red-500 font-medium mb-2">Erreur lors du chargement de l'ordre de travail</div>
                <div className="text-gray-500 text-sm mb-4">{error || 'Ordre de travail non trouvé'}</div>
                <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Retour aux ordres de travail
                </button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const tasksTotal = entry.tasks?.reduce((sum, task) => sum + (task.cost || 0), 0) || 0;
    const partsTotal = entry.parts?.reduce((sum, part) => sum + (part.totalCost || 0), 0) || 0;
    const grandTotal = entry.totalCost || (tasksTotal + partsTotal);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED': return { color: 'bg-green-100 text-green-800', label: 'Terminé' };
            case 'IN_PROGRESS': return { color: 'bg-blue-100 text-blue-800', label: 'En cours' };
            case 'SCHEDULED': return { color: 'bg-yellow-100 text-yellow-800', label: 'Ouvert / Planifié' };
            case 'CANCELLED': return { color: 'bg-red-100 text-red-800', label: 'Annulé' };
            default: return { color: 'bg-gray-100 text-gray-800', label: status };
        }
    };

    const statusConfig = getStatusConfig(entry.status);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Retour à la liste
                    </button>
                    <div className="h-6 w-[1px] bg-gray-200 mx-2" />
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Ordre de Travail #{entry.id.slice(-8).toUpperCase()}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {entry.assignedTo && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200" title={`Assigné à: ${entry.assignedTo}`}>
                            {entry.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                    )}

                    <div className="relative more-menu-container">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded text-sm shadow-sm flex items-center justify-center min-w-[36px]"
                        >
                            <MoreHorizontal size={14} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1">
                                <button
                                    onClick={() => {/* Dupliquer logic */ }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    Dupliquer
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleEdit}
                        className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded text-sm shadow-sm flex items-center gap-2"
                    >
                        <Edit size={14} /> Modifier
                    </button>

                    {entry.status !== 'COMPLETED' && (
                        <button
                            onClick={async () => {
                                try {
                                    await serviceAPI.updateServiceEntry(entry.id, { status: 'COMPLETED' });
                                    toast.success('Succès', 'Ordre de travail terminé');
                                    router.refresh();
                                } catch (err) {
                                    toast.error('Erreur', 'Échec de la mise à jour');
                                }
                            }}
                            className="px-4 py-1.5 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded text-sm shadow-sm flex items-center gap-2"
                        >
                            Terminer
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex flex-col lg:flex-row gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6 w-full lg:w-auto">
                    <div>
                        {/* Details Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Détails</h2>
                            </div>

                            <div className="p-0">
                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">ID</div>
                                    <div className="text-sm font-mono text-gray-900 w-2/3">#{entry.id.slice(-8).toUpperCase()}</div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Statut</div>
                                    <div className="w-2/3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                </div>

                                {entry.priority && (
                                    <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Priorité</div>
                                        <div className="w-2/3">
                                            <span className={`flex items-center gap-1 text-xs font-bold ${entry.priority === 'CRITICAL' ? 'text-red-600' :
                                                entry.priority === 'HIGH' ? 'text-orange-600' :
                                                    entry.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                                                }`}>
                                                <Bell size={12} /> {entry.priority}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Véhicule</div>
                                    <div className="w-2/3">
                                        {entry.vehicle ? (
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => router.push(`/vehicles/list/${entry.vehicle?.id}`)}
                                            >
                                                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#008751] transition-colors overflow-hidden">
                                                    <Wrench size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-[#008751] group-hover:underline">{entry.vehicle.name}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">
                                                            {entry.vehicle.licensePlate || 'PAS DE PLAQUE'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{entry.vehicle.make} {entry.vehicle.model}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Date d'émission</div>
                                    <div className="text-sm font-medium text-gray-900 w-2/3">{entry.date ? formatDate(entry.date) : formatDate(entry.createdAt)}</div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Assigné à</div>
                                    <div className="text-sm text-gray-900 w-2/3">
                                        {entry.assignedToContact ? `${entry.assignedToContact.firstName} ${entry.assignedToContact.lastName}` : (entry.assignedTo || '—')}
                                    </div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Fournisseur</div>
                                    <div className="text-sm text-gray-900 w-2/3">
                                        {entry.vendorName || (typeof entry.vendor === 'object' ? entry.vendor?.name : entry.vendor) || 'Interne'}
                                    </div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Compteur</div>
                                    <div className="text-sm font-mono text-gray-900 w-2/3">{entry.meter ? `${entry.meter.toLocaleString()} km` : '—'}</div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Émis par</div>
                                    <div className="text-sm text-gray-900 w-2/3">{entry.issuedBy || entry.user?.name || '—'}</div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Début planifié</div>
                                    <div className="text-sm text-gray-900 w-2/3">
                                        {entry.scheduledStartDate ? formatDate(entry.scheduledStartDate) : (entry.date ? formatDate(entry.date) : '—')}
                                        {entry.scheduledStartTime ? ` à ${entry.scheduledStartTime}` : ''}
                                    </div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Facture #</div>
                                    <div className="text-sm text-gray-900 w-2/3">{entry.invoiceNumber || '—'}</div>
                                </div>

                                <div className="px-6 py-3 flex items-center justify-between border-b border-gray-50">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Bon de Commande (PO)</div>
                                    <div className="text-sm text-gray-900 w-2/3">{entry.poNumber || '—'}</div>
                                </div>

                                <div className="px-6 py-4 flex items-start justify-between">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3 pt-1">Notes</div>
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap w-2/3 leading-relaxed">{entry.notes || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolved Issues Placeholder */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Problèmes résolus</h2>
                        <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
                                <FileText size={24} />
                            </div>
                            <p className="text-sm text-gray-500">Aucun problème lié à cet ordre de travail.</p>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Éléments de ligne</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transition-all group-hover:w-2"></div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tâches</div>
                                <div className="text-xl font-black text-gray-900">{formatCurrency(tasksTotal)}</div>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 transition-all group-hover:w-2"></div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Pièces</div>
                                <div className="text-xl font-black text-gray-900">{formatCurrency(partsTotal)}</div>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#008751] transition-all group-hover:w-2"></div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total</div>
                                <div className="text-xl font-black text-[#008751]">{formatCurrency(grandTotal)}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Description / Article</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Prix Unitaire</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Tâches */}
                                    {entry.tasks && entry.tasks.length > 0 && entry.tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded mt-0.5">
                                                        <Wrench size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{task.serviceTask?.name || 'Tâche d\'entretien'}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{task.notes || task.serviceTask?.description || 'Entretien standard'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-600 font-medium">—</td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(task.cost || 0)}</td>
                                        </tr>
                                    ))}

                                    {/* Pièces */}
                                    {entry.parts && entry.parts.length > 0 && entry.parts.map((part) => (
                                        <tr key={part.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-orange-50 text-orange-600 rounded mt-0.5">
                                                        <Package size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{part.part?.description || 'Pièce détachée'}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            P/N: {part.part?.number} • Qté: {part.quantity}
                                                            {part.notes ? ` • ${part.notes}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-600 font-medium">{formatCurrency(part.unitCost)}</td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(part.totalCost)}</td>
                                        </tr>
                                    ))}

                                    {(!entry.tasks || entry.tasks.length === 0) && (!entry.parts || entry.parts.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Wrench size={32} className="mb-2 opacity-20" />
                                                    <p className="text-sm italic">Aucun élément de ligne enregistré</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50/50">
                                    <tr className="border-t-2 border-gray-100">
                                        <td colSpan={2} className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sous-total</td>
                                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(tasksTotal + partsTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-1 text-right text-[10px] font-medium text-gray-400 uppercase tracking-widest">Dont Tâches / Main-d'œuvre</td>
                                        <td className="px-6 py-1 text-right text-xs text-gray-500">{formatCurrency(tasksTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-6 py-1 text-right text-[10px] font-medium text-gray-400 uppercase tracking-widest">Dont Pièces</td>
                                        <td className="px-6 py-1 text-right text-xs text-gray-500">{formatCurrency(partsTotal)}</td>
                                    </tr>
                                    {entry.discountValue && entry.discountValue > 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-1 text-right text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                                Remise ({entry.discountValue}{entry.discountType || '%'})
                                            </td>
                                            <td className="px-6 py-1 text-right text-xs text-red-500">
                                                -{formatCurrency(entry.discountType === '€' ? entry.discountValue : (tasksTotal + partsTotal) * (entry.discountValue / 100))}
                                            </td>
                                        </tr>
                                    ) : null}
                                    {entry.taxValue && entry.taxValue > 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-1 text-right text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                                Taxe ({entry.taxValue}{entry.taxType || '%'})
                                            </td>
                                            <td className="px-6 py-1 text-right text-xs text-gray-500">
                                                +{formatCurrency(entry.taxType === '€' ? entry.taxValue : ((tasksTotal + partsTotal) - (entry.discountType === '€' ? (entry.discountValue || 0) : (tasksTotal + partsTotal) * ((entry.discountValue || 0) / 100))) * (entry.taxValue / 100))}
                                            </td>
                                        </tr>
                                    ) : null}
                                    <tr className="bg-gray-50/80">
                                        <td colSpan={2} className="px-6 py-6 text-right text-sm font-black text-gray-900 uppercase tracking-widest">Total TTC</td>
                                        <td className="px-6 py-6 text-right text-2xl font-black text-[#008751]">{formatCurrency(grandTotal)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Comments, Photos, Docs */}
                <div className="shrink-0 w-full lg:w-auto">
                    <EntitySidebar
                        entityType="serviceEntry"
                        entityId={entry.id}
                        activePanel={activePanel}
                        onPanelChange={setActivePanel}

                        comments={comments.map(c => ({
                            id: c.id,
                            message: c.content,
                            userName: c.author,
                            createdAt: new Date(c.createdAt),
                            entityType: 'serviceEntry',
                            entityId: entry.id,
                            userId: 'unknown',
                            updatedAt: new Date(c.createdAt),
                            isEdited: false
                        }))}
                        commentsLoading={commentsLoading}
                        onAddComment={handleAddCommentWrapper}
                        onUpdateComment={async () => { }}
                        onDeleteComment={async () => { }}
                        onRefreshComments={() => fetchComments(params.id)}

                        photos={photos}
                        photosLoading={photosLoading}
                        photosError={photosError}
                        onAddPhoto={handleAddPhotoWrapper}
                        onDeletePhoto={deletePhotoHandler}
                        onRefreshPhotos={refreshPhotos}

                        documents={documents}
                        documentsLoading={documentsLoading}
                        documentsError={documentsError}
                        onAddDocument={handleAddDocumentWrapper}
                        onDeleteDocument={async () => { }}
                        onDownloadDocument={async () => { }}
                        onRefreshDocuments={refreshDocuments}
                    />
                </div>
            </div>
        </div>
    );
}
