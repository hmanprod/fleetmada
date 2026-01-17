'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Edit, MoreHorizontal, Sparkles, Calendar, Clock, Gauge, FileText, User, Store, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceEntry } from '@/lib/hooks/useServiceEntry';
import { serviceAPI, ServiceEntryCommentData } from '@/lib/services/service-api';
import { EntitySidebar } from '@/components/EntitySidebar';
import { useServiceEntryComments } from '@/lib/hooks/useServiceEntryComments';
import { useServiceEntryPhotos } from '@/lib/hooks/useServiceEntryPhotos';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';

export default function ServiceEntryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
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
                author: 'CurrentUser',
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
        if (!confirm('Are you sure you want to delete this service entry? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await serviceAPI.deleteServiceEntry(params.id);
            if (response.success) {
                router.push('/service/history');
            } else {
                alert('Failed to delete service entry: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('An error occurred while deleting the entry');
        }
    };

    const handleBack = () => {
        router.push('/service/history');
    };

    const handleEdit = () => {
        router.push(`/service/history/${params.id}/edit`);
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
                <div className="text-red-500 font-medium mb-2">Error loading service entry</div>
                <div className="text-gray-500 text-sm mb-4">{error || 'Service entry not found'}</div>
                <button onClick={handleBack} className="text-[#008751] hover:underline">
                    Back to History
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

    // Calculate totals from tasks since we don't have separate parts/labor breakdown in the API response structure typically used here yet
    // Assuming task.cost is the total line item cost
    const tasksTotal = entry.tasks?.reduce((sum, task) => sum + (task.cost || 0), 0) || 0;

    // Check if we have parts cost (if using separate parts model in future)
    const partsTotal = entry.parts?.reduce((sum, part) => sum + (part.totalCost || 0), 0) || 0;

    const grandTotal = entry.totalCost || (tasksTotal + partsTotal);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mr-2">
                        <ArrowLeft size={16} /> Journal d'Entretien
                    </button>
                </div>

                <div className="flex gap-2">
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
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded text-sm shadow-sm flex items-center gap-2"
                    >
                        <Edit size={14} /> Modifier
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">Entrée de Service #{entry.id.slice(-8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${entry.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                entry.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {entry.status}
                            </span>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">TOUS LES CHAMPS</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center border-b border-gray-50 pb-3 last:border-0">
                                    <div className="text-sm text-gray-500 flex items-center gap-2"><Gauge size={14} /> Véhicule</div>
                                    <div className="flex items-center gap-2">
                                        {entry.vehicle ? (
                                            <>
                                                <span className="text-sm font-medium text-[#008751] hover:underline cursor-pointer">{entry.vehicle.name}</span>
                                                <span className="text-xs text-gray-500">({entry.vehicle.licensePlate || 'Pas de plaque'})</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-400">Véhicule inconnu</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center border-b border-gray-50 pb-3 last:border-0">
                                    <div className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={14} /> Date</div>
                                    <div className="text-sm text-gray-900">{formatDate(entry.date)}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center border-b border-gray-50 pb-3 last:border-0">
                                    <div className="text-sm text-gray-500 flex items-center gap-2"><Gauge size={14} /> Compteur</div>
                                    <div className="text-sm text-gray-900">{entry.meter ? `${entry.meter.toLocaleString()} km` : '—'}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center border-b border-gray-50 pb-3 last:border-0">
                                    <div className="text-sm text-gray-500 flex items-center gap-2"><Store size={14} /> Fournisseur</div>
                                    <div className="text-sm text-gray-900">
                                        {entry.vendorName || (typeof entry.vendor === 'object' ? entry.vendor?.name : entry.vendor) || '—'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center border-b border-gray-50 pb-3 last:border-0">
                                    <div className="text-sm text-gray-500 flex items-center gap-2"><FileText size={14} /> Notes</div>
                                    <div className="text-sm text-gray-900 whitespace-pre-wrap">{entry.notes || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Lignes d'Articles</h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Coût des tâches</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">€{tasksTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Coût des pièces</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">€{partsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-xs font-bold text-gray-500 uppercase">Total</div>
                                <div className="text-xl font-bold text-[#008751] mt-1">€{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Article</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Notes</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Coût</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {entry.tasks && entry.tasks.length > 0 ? (
                                        entry.tasks.map((task) => (
                                            <tr key={task.id}>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-sm">{task.serviceTask?.name || 'Tâche inconnue'}</div>
                                                    {task.serviceTask?.description && (
                                                        <div className="text-xs text-gray-500 mt-1">{task.serviceTask.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                    {task.notes || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                                    €{(task.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                                Aucune tâche enregistrée
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-[#008751]">
                                            €{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
                                Créé le {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Entity Sidebar */}
                <div className="shrink-0">
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
