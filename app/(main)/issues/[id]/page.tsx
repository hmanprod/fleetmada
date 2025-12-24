'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Bell, MessageSquare, MapPin, Check, EyeOff, AlertCircle, Send, Plus, ListPlus, Wrench, CheckCircle2, XCircle, Trash2, ArrowRight } from 'lucide-react';
import { serviceAPI } from '@/lib/services/service-api';
import type { Issue } from '@/lib/services/issues-api';
import { useRouter } from 'next/navigation';
import { useIssueDetails } from '@/lib/hooks/useIssueDetails';
import { useIssueComments } from '@/lib/hooks/useIssueComments';
import type { IssueCommentData } from '@/lib/services/issues-api';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Hooks pour les données
    const {
        issue,
        loading,
        error,
        fetchIssue,
        updateIssueStatus,
        clearError
    } = useIssueDetails(params.id);

    const {
        comments,
        loading: commentsLoading,
        fetchComments,
        addComment,
        clearError: clearCommentsError
    } = useIssueComments(params.id);

    // État pour l'ajout de commentaires
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [modalType, setModalType] = useState<'service_entry' | 'work_order' | 'resolve' | null>(null);
    const [resolveNote, setResolveNote] = useState('');

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

    const handleResolve = async () => {
        if (!issue) return;

        try {
            setResolving(true);
            await updateIssueStatus(params.id, 'RESOLVED');
        } catch (err) {
            console.error('Erreur lors de la résolution:', err);
        } finally {
            setResolving(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !issue) return;

        try {
            setSubmittingComment(true);
            const commentData: IssueCommentData = {
                author: 'Utilisateur actuel', // TODO: Récupérer depuis le contexte d'auth
                content: newComment.trim()
            };

            await addComment(params.id, commentData);
            setNewComment('');
        } catch (err) {
            console.error('Erreur lors de l\'ajout du commentaire:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

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
        return d.toLocaleDateString('en-US', {
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

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
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
                        <ArrowLeft size={16} /> Issues
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{issue.summary}</h1>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-2 mr-2">
                        {issue.user && (
                            <div className="bg-purple-200 text-purple-700 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {issue.user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="bg-gray-200 text-gray-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">+</div>
                    </div>
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <EyeOff size={16} /> Unwatch
                    </button>
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
                                            Add to Service Entry <ListPlus size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setModalType('work_order');
                                                setShowDropdown(false);
                                            }}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Add to Work Order <Wrench size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setModalType('resolve');
                                                setShowDropdown(false);
                                            }}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-t border-gray-100"
                                        >
                                            Resolve with Note <CheckCircle2 size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={handleCloseIssue}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Close <XCircle size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={handleDeleteIssue}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                        >
                                            Delete <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={handleEdit} className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Edit
                    </button>
                    <button
                        onClick={handleResolve}
                        disabled={resolving || issue.status === 'RESOLVED' || issue.status === 'CLOSED'}
                        className="px-3 py-2 bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white font-bold rounded flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Check size={16} /> {resolving ? 'Résolution...' : 'Resolve'}
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Details</h2>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">All Fields</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Issue #</div>
                                    <div className="text-sm text-gray-900">#{issue.id.slice(-6)}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div><span data-testid="issue-status" className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(issue.status)}`}>{issue.status}</span></div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Summary</div>
                                    <div className="text-sm text-gray-900">{issue.summary}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Priority</div>
                                    <div className="flex items-center gap-2">
                                        <div data-testid="issue-priority" className={`font-bold text-sm ${getPriorityColor(issue.priority)}`}>! {issue.priority}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Vehicle</div>
                                    <div className="flex items-center gap-2" data-testid="issue-vehicle">
                                        {issue.vehicle ? (
                                            <>
                                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.vehicle.id}`} className="w-full h-full object-cover" alt="Vehicle" />
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
                                    <div className="text-sm text-gray-500">Reported Date</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">{formatDate(issue.reportedDate)}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Reported By</div>
                                    <div className="text-sm text-gray-900">{issue.user?.name || '—'}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Assigned To</div>
                                    <div className="text-sm text-gray-900">{issue.assignedTo || '—'}</div>
                                </div>

                                {issue.labels.length > 0 && (
                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                        <div className="text-sm text-gray-500">Labels</div>
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
                        Created {formatDateRelative(issue.createdAt)} · Updated {formatDateRelative(issue.updatedAt)}
                    </div>
                </div>

                {/* Right Sidebar - Timeline & Comments */}
                <div className="w-[400px] space-y-6">
                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Timeline</h2>
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
                                        <span className="font-bold text-gray-900 text-sm">Issue Opened</span>
                                        <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Comments</h2>
                            <div className="flex bg-gray-100 p-1 rounded">
                                <button className="p-1 hover:bg-white rounded shadow-sm relative"><MessageSquare size={14} /><span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-3 h-3 rounded-full flex items-center justify-center">{comments.length}</span></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400 relative"><MapPin size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><Bell size={14} /></button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {commentsLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                                    <p>Aucun commentaire</p>
                                </div>
                            ) : (
                                <div className="space-y-4" data-testid="comments-list">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3" data-testid="comment-item">
                                            <div className="w-8 h-8 rounded-full bg-purple-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                                                {comment.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex gap-2 items-baseline">
                                                    <span className="font-bold text-[#008751] text-sm">{comment.author}</span>
                                                    <span className="text-xs text-gray-500">{formatDateRelative(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1" data-testid="comment-content">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">U</div>
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a Comment"
                                    data-testid="comment-input"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                />
                                <button
                                    onClick={handleAddComment}
                                    data-testid="send-comment-button"
                                    disabled={!newComment.trim() || submittingComment}
                                    className="px-3 py-2 bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white rounded text-sm flex items-center gap-1"
                                >
                                    <Send size={14} /> Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals */}
            {modalType && issue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalType === 'service_entry' ? 'Add to Service Entry' :
                                    modalType === 'work_order' ? 'Add to Work Order' :
                                        `Resolve Issue #${issue.id.slice(-6)}`}
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
                                <span className="text-sm font-medium text-gray-500 w-24">Vehicle</span>
                                <div className="flex items-center gap-2">
                                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.id}`} className="w-8 h-8 rounded object-cover" alt="" />
                                    <span className="text-[#008751] font-bold">{issue.vehicle?.make} {issue.vehicle?.model}</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Sample</span>
                                </div>
                            </div>

                            {modalType === 'resolve' ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-500 w-24">Summary</span>
                                        <span className="text-gray-900">{issue.summary}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-500">Note <span className="text-red-500">*</span></label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                                            placeholder="Describe what work was performed to resolve the issue."
                                            value={resolveNote}
                                            onChange={(e) => setResolveNote(e.target.value)}
                                        ></textarea>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-4">
                                        <span className="text-sm font-medium text-gray-500 w-24 pt-1">Issues</span>
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 rounded-sm">1</span>
                                                <span className="text-sm font-medium">Issue will be added</span>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded p-3 flex items-start gap-3">
                                                <input type="checkbox" checked readOnly className="mt-1 rounded border-gray-300 text-[#008751]" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded-sm uppercase">Open</span>
                                                        <span className="text-sm font-bold">1 - {issue.summary}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">Reported {formatDate(issue.reportedDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-500 w-24">{modalType === 'service_entry' ? 'Service Entry' : 'Work Order'}</span>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="entry_type" checked readOnly className="text-[#008751] focus:ring-[#008751]" />
                                                <span className="text-sm">Add to New {modalType === 'service_entry' ? 'Service Entry' : 'Work Order'}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer opacity-50">
                                                <input type="radio" name="entry_type" disabled className="text-[#008751] focus:ring-[#008751]" />
                                                <span className="text-sm">Add to Existing {modalType === 'service_entry' ? 'Service Entry' : 'Work Order'}</span>
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
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (modalType === 'resolve') handleResolveWithNote();
                                    else handleAddRecords(modalType as any);
                                }}
                                className="px-4 py-2 text-sm font-bold text-white bg-[#008751] hover:bg-[#007043] rounded"
                            >
                                {modalType === 'resolve' ? 'Resolve Issue' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
