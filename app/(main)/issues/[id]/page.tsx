'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Bell, MessageSquare, MapPin, Check, EyeOff, AlertCircle, Send, Plus, ListPlus, Wrench, CheckCircle2, XCircle, Trash2, ArrowRight } from 'lucide-react';
import { serviceAPI } from '@/lib/services/service-api';
import type { Issue } from '@/lib/services/issues-api';
import { useRouter } from 'next/navigation';
import { useIssueDetails } from '@/lib/hooks/useIssueDetails';
import { useIssueComments } from '@/lib/hooks/useIssueComments';
import { EntitySidebar } from '@/components/EntitySidebar';
import { useIssuePhotos } from '@/lib/hooks/useIssuePhotos';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { useContacts } from '@/lib/hooks/useContacts';
import type { IssueCommentData } from '@/lib/services/issues-api';
import type { Contact } from '@/lib/services/contacts-api';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Hooks pour les données
    const {
        issue,
        loading,
        error,
        fetchIssue,
        updateIssueStatus,
        assignIssue,
        clearError
    } = useIssueDetails(params.id);

    // Fetch contacts for mapping IDs to names
    const { contacts } = useContacts({ limit: 1000 });

    const contactMap = useMemo(() => {
        return contacts.reduce((acc, contact) => {
            acc[contact.id] = contact;
            return acc;
        }, {} as Record<string, Contact>);
    }, [contacts]);

    const {
        comments,
        loading: commentsLoading,
        fetchComments,
        addComment,
        clearError: clearCommentsError
    } = useIssueComments(params.id);

    // État pour l'ajout de commentaires
    // État pour l'ajout de commentaires (legacy - handled by Sidebar now)
    // const [newComment, setNewComment] = useState(''); 
    // const [submittingComment, setSubmittingComment] = useState(false);

    // Sidebar State
    const [activePanel, setActivePanel] = useState<'comments' | 'photos' | 'documents' | null>('comments');

    // Photos Hook
    const {
        photos,
        loading: photosLoading,
        error: photosError,
        addPhoto: addPhotoHandler,
        deletePhoto: deletePhotoHandler,
        refreshPhotos
    } = useIssuePhotos(params.id);

    // Documents Hook
    const {
        documents,
        loading: documentsLoading,
        error: documentsError,
        refreshDocuments,
    } = useDocuments({
        attachedTo: 'issue',
        attachedId: params.id,
        limit: 50
    });

    const { uploadSingleDocument } = useUploadDocuments();

    // Handlers for Sidebar
    const handleAddCommentWrapper = async (message: string, attachments?: File[]) => {
        if (!issue) return;
        try {
            // Note: Current API doesn't support attachments for comments yet in the hook interface? 
            // Checking addComment signature: (id, data) -> data has { content, author }
            // The hook useIssueComments calls addIssueComment(id, {author, content}). It doesn't seem to support attachments in the hook.
            // Be careful here. 'useVehicleComments' supported attachments. 'useIssueComments' might not.
            // I'll just send the text for now.
            const commentData: IssueCommentData = {
                author: 'CurrentUser', // Placeholder
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
        // Upload one by one
        for (let i = 0; i < files.length; i++) {
            await uploadSingleDocument(files[i], {
                attachedTo: 'issue',
                attachedId: params.id,
                fileName: files[i].name,
                mimeType: files[i].type
            });
        }
        refreshDocuments();
    };


    const [showDropdown, setShowDropdown] = useState(false);
    const [modalType, setModalType] = useState<'service_entry' | 'work_order' | 'resolve' | null>(null);
    const [resolveNote, setResolveNote] = useState('');
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const [searchContact, setSearchContact] = useState('');

    const filteredContacts = useMemo(() => {
        if (!searchContact.trim()) return contacts;
        const search = searchContact.toLowerCase();
        return contacts.filter(c =>
            c.firstName.toLowerCase().includes(search) ||
            c.lastName.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search)
        );
    }, [contacts, searchContact]);

    const handleToggleAssign = async (userId: string) => {
        if (!issue) return;
        const currentAssigned = issue.assignedTo || [];
        const isAssigned = currentAssigned.includes(userId);
        const newAssigned = isAssigned
            ? currentAssigned.filter(id => id !== userId)
            : [...currentAssigned, userId];

        try {
            await assignIssue(params.id, newAssigned);
        } catch (err) {
            console.error('Failed to update assignment:', err);
        }
    };

    // Charger les données au montage
    useEffect(() => {
        if (params.id) {
            fetchIssue(params.id);
            fetchComments(params.id);
        }
    }, [params.id, fetchIssue, fetchComments]);

    const handleBack = () => {
        router.push('/issues');
    };

    const handleEdit = () => {
        router.push(`/issues/${params.id}/edit`);
    };



    // Legacy handleAddComment removed/commented as Sidebar handles it
    /* 
    const handleAddComment = async () => { ... } 
    */

    const handleCloseIssue = async () => {
        if (!issue) return;
        try {
            await updateIssueStatus(params.id, 'CLOSED');
            setShowDropdown(false);
        } catch (err) {
            console.error('Failed to close issue:', err);
        }
    };

    const handleDeleteIssue = async () => {
        if (!issue) return;
        if (window.confirm('Are you sure you want to delete this issue?')) {
            try {
                // In a real app we'd call an API here.
                router.push('/issues');
            } catch (err) {
                console.error('Failed to delete issue:', err);
            }
        }
    };

    const handleAddRecords = async (type: 'service_entry' | 'work_order') => {
        if (!issue) return;
        try {
            await serviceAPI.createServiceEntry({
                vehicleId: issue.vehicleId || '',
                date: new Date().toISOString(),
                isWorkOrder: type === 'work_order',
                notes: `Created from issue: ${issue.summary}`,
                status: 'SCHEDULED'
            });
            setModalType(null);
        } catch (err) {
            console.error(`Failed to create ${type}:`, err);
        }
    };

    const handleResolveWithNote = async () => {
        if (!issue || !resolveNote.trim()) return;
        try {
            await updateIssueStatus(params.id, 'RESOLVED');
            setModalType(null);
            setResolveNote('');
        } catch (err) {
            console.error('Failed to resolve issue:', err);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateRelative = (date: Date | string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Aujourd\'hui';
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
        return `Il y a ${Math.floor(diffDays / 365)} ans`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-600';
            case 'HIGH': return 'text-orange-600';
            case 'MEDIUM': return 'text-yellow-600';
            case 'LOW': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-400 text-yellow-900';
            case 'CLOSED': return 'bg-gray-500 text-white';
            case 'RESOLVED': return 'bg-green-600 text-white';
            case 'IN_PROGRESS': return 'bg-blue-500 text-white';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    // État de chargement
    if (loading) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Chargement du problème...</p>
                    </div>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => {
                            clearError();
                            clearCommentsError();
                            fetchIssue(params.id);
                            fetchComments(params.id);
                        }}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Issue non trouvée
    if (!issue) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Problème non trouvé</h2>
                    <p className="text-gray-500 mb-4">Le problème demandé n'existe pas ou a été supprimé.</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-[#008751] text-white rounded hover:bg-[#007043]"
                    >
                        Retour aux problèmes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Problèmes
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{issue.summary}</h1>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center -space-x-2 mr-4 relative">
                        {issue.assignedTo && issue.assignedTo.length > 0 ? (
                            issue.assignedTo.map((userId) => {
                                const contact = contactMap[userId];
                                const initials = contact
                                    ? `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase()
                                    : '?';
                                return (
                                    <div
                                        key={userId}
                                        title={contact ? `${contact.firstName} ${contact.lastName}` : 'Contact inconnu'}
                                        onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                                        className="bg-purple-200 text-purple-700 text-[10px] font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white ring-1 ring-gray-100 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                                    >
                                        {initials}
                                    </div>
                                );
                            })
                        ) : null}

                        <button
                            onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                            className="bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white ring-1 ring-gray-100 shadow-sm hover:bg-gray-200 transition-colors"
                            title="Assigner des contacts"
                        >
                            <Plus size={12} />
                        </button>

                        {showAssignDropdown && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowAssignDropdown(false)}></div>
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Rechercher un contact..."
                                            className="w-full text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
                                            value={searchContact}
                                            onChange={(e) => setSearchContact(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredContacts.length > 0 ? (
                                            filteredContacts.map(contact => {
                                                const isAssigned = issue.assignedTo?.includes(contact.id);
                                                return (
                                                    <div
                                                        key={contact.id}
                                                        onClick={() => handleToggleAssign(contact.id)}
                                                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-gray-900 leading-none">
                                                                    {contact.firstName} {contact.lastName}
                                                                </span>
                                                                <span className="text-[10px] text-gray-500">
                                                                    {contact.jobTitle || 'Contact'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {isAssigned && <Check size={14} className="text-[#008751]" />}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 text-center text-xs text-gray-400">
                                                Aucun contact trouvé
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {/* <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <EyeOff size={16} /> Unwatch
                    </button> */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 flex items-center"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDropdown(false)}
                                ></div>
                                <div
                                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden"
                                    style={{ position: 'absolute', right: 0, top: '100%' }}
                                >
                                    <div className="py-1 flex flex-col" role="menu">
                                        <button
                                            onClick={() => {
                                                setModalType('service_entry');
                                                setShowDropdown(false);
                                            }}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Ajouter au Journal d'Entretien <ListPlus size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setModalType('work_order');
                                                setShowDropdown(false);
                                            }}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Ajouter au Bon de Travail <Wrench size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={handleCloseIssue}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-t border-gray-100"
                                        >
                                            Fermer <XCircle size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={handleDeleteIssue}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                        >
                                            Supprimer <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={handleEdit} className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Modifier
                    </button>
                    <button
                        onClick={() => setModalType('resolve')}
                        disabled={issue.status === 'RESOLVED' || issue.status === 'CLOSED'}
                        className="px-3 py-2 bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white font-bold rounded flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Check size={16} /> Résoudre
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Détails</h2>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">Tous les champs</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Issue #</div>
                                    <div className="text-sm text-gray-900">#{issue.id.slice(-6)}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Statut</div>
                                    <div><span data-testid="issue-status" className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(issue.status)}`}>{issue.status}</span></div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Résumé</div>
                                    <div className="text-sm text-gray-900">{issue.summary}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Priorité</div>
                                    <div className="flex items-center gap-2">
                                        <div data-testid="issue-priority" className={`font-bold text-sm ${getPriorityColor(issue.priority)}`}>! {issue.priority}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Véhicule</div>
                                    <div className="flex items-center gap-2" data-testid="issue-vehicle">
                                        {issue.vehicle ? (
                                            <>
                                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.vehicle.id}`} className="w-full h-full object-cover" alt="Véhicule" />
                                                </div>
                                                <span className="text-[#008751] font-medium hover:underline cursor-pointer">
                                                    {issue.vehicle.make} {issue.vehicle.model}
                                                </span>
                                                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{issue.vehicle.vin}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Date de signalement</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">{formatDate(issue.reportedDate)}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Signalé par</div>
                                    <div className="text-sm text-gray-900">{issue.user?.name || '—'}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Assigné à</div>
                                    <div className="text-sm text-gray-900">
                                        {issue.assignedTo && issue.assignedTo.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(issue.assignedTo) ? issue.assignedTo : [issue.assignedTo]).map((userId) => {
                                                    const contact = contactMap[userId];
                                                    return (
                                                        <span key={userId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            {contact ? `${contact.firstName} ${contact.lastName}` : userId.substring(0, 8) + '...'}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </div>
                                </div>

                                {issue.labels.length > 0 && (
                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Étiquettes</div>
                                        <div className="flex flex-wrap gap-1">
                                            {issue.labels.map((label, index) => (
                                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">{label}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Source</div>
                                    <div className="text-sm text-gray-900">FleetMada</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-[#008751] cursor-pointer hover:underline mb-8">
                        Créé {formatDateRelative(issue.createdAt)} · Mis à jour {formatDateRelative(issue.updatedAt)}
                    </div>

                    {/* Timeline moved to main column */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Chronologie</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1">
                                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold">!</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-gray-900 text-sm">Problème ouvert</span>
                                        <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Entity Sidebar */}
                <div className="shrink-0">
                    <EntitySidebar
                        entityType="issue"
                        entityId={issue.id}
                        activePanel={activePanel}
                        onPanelChange={setActivePanel}

                        comments={comments.map(c => ({
                            id: c.id,
                            message: c.content,
                            userName: c.author,
                            createdAt: c.createdAt,
                            entityType: 'issue',
                            entityId: issue.id,
                            userId: 'unknown',
                            updatedAt: c.createdAt,
                            isEdited: false
                        }))}
                        commentsLoading={commentsLoading}
                        onAddComment={handleAddCommentWrapper}
                        onUpdateComment={async () => { }} // Not impl yet
                        onDeleteComment={async () => { }} // Not impl yet
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
                        onDeleteDocument={async () => { }} // Need generic document delete
                        onDownloadDocument={async () => { }} // Need generic download
                        onRefreshDocuments={refreshDocuments}
                    />
                </div>
            </div>
            {/* Modals */}
            {modalType && issue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalType === 'service_entry' ? 'Ajouter au Journal d\'Entretien' :
                                    modalType === 'work_order' ? 'Ajouter à un Bon de Travail' :
                                        `Résoudre le Problème #${issue.id.slice(-6)}`}
                            </h2>
                            <button
                                onClick={() => { setModalType(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Vehicle Info */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-500 w-24">Véhicule</span>
                                <div className="flex items-center gap-2">
                                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.id}`} className="w-8 h-8 rounded object-cover" alt="" />
                                    <span className="text-[#008751] font-bold">{issue.vehicle?.make} {issue.vehicle?.model}</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Sample</span>
                                </div>
                            </div>

                            {modalType === 'resolve' ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-500 w-24">Résumé</span>
                                        <span className="text-gray-900">{issue.summary}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-500">Note <span className="text-red-500">*</span></label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                                            placeholder="Décrivez les travaux effectués pour résoudre ce problème."
                                            value={resolveNote}
                                            onChange={(e) => setResolveNote(e.target.value)}
                                        ></textarea>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-4">
                                        <span className="text-sm font-medium text-gray-500 w-24 pt-1">Problèmes</span>
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 rounded-sm">1</span>
                                                <span className="text-sm font-medium">Le problème sera ajouté</span>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded p-3 flex items-start gap-3">
                                                <input type="checkbox" checked readOnly className="mt-1 rounded border-gray-300 text-[#008751]" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded-sm uppercase">OUVERT</span>
                                                        <span className="text-sm font-bold">1 - {issue.summary}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">Signalé le {formatDate(issue.reportedDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-500 w-24">{modalType === 'service_entry' ? 'Journal d\'Entretien' : 'Bon de Travail'}</span>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="entry_type" checked readOnly className="text-[#008751] focus:ring-[#008751]" />
                                                <span className="text-sm">Ajouter à un Nouveau {modalType === 'service_entry' ? 'Journal d\'Entretien' : 'Bon de Travail'}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer opacity-50">
                                                <input type="radio" name="entry_type" disabled className="text-[#008751] focus:ring-[#008751]" />
                                                <span className="text-sm">Ajouter à un existant {modalType === 'service_entry' ? 'Journal d\'Entretien' : 'Bon de Travail'}</span>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => { setModalType(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    if (modalType === 'resolve') handleResolveWithNote();
                                    else handleAddRecords(modalType as any);
                                }}
                                className="px-4 py-2 text-sm font-bold text-white bg-[#008751] hover:bg-[#007043] rounded"
                            >
                                {modalType === 'resolve' ? 'Résoudre le problème' : 'Continuer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
