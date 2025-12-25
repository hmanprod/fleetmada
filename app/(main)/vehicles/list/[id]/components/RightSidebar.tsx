"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    MessageSquare,
    Image,
    FileText,
    Send,
    Search,
    Grid,
    List,
    ChevronDown,
    Upload,
    ExternalLink,
    Trash2,
    Edit3,
    X,
    Check,
    Loader2,
    AlertCircle,
    Download,
    Filter,
    Clock,
    User,
    Paperclip,
    Camera,
    Folder,
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react';
import { useVehicleComments } from '@/lib/hooks/useVehicleComments';
import { useVehiclePhotos } from '@/lib/hooks/useVehiclePhotos';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import {
    Document,
    DocumentFilters
} from '@/types/documents';
import {
    Photo,
    PhotoUploadData
} from '@/types/photos';
import {
    formatFileSize,
    getMimeTypeCategory,
    isImageFile,
    isPdfFile
} from '@/types/documents';
import {
    formatFileSize as formatPhotoFileSize,
    getLocationTypeLabel
} from '@/types/photos';
import { Comment, CreateCommentData } from '@/types/comments';

interface RightSidebarProps {
    activePanel: 'comments' | 'photos' | 'documents' | null;
    onPanelChange: (panel: 'comments' | 'photos' | 'documents' | null) => void;
    vehicleId: string;
}

export function RightSidebar({
    activePanel,
    onPanelChange,
    vehicleId
}: RightSidebarProps) {
    // États globaux
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationTypeFilter, setLocationTypeFilter] = useState<string>('');
    const [labelFilter, setLabelFilter] = useState<string>('');

    // Hooks
    const { token: authToken } = useAuthToken();
    const {
        comments,
        loading: commentsLoading,
        error: commentsError,
        addComment,
        updateComment,
        deleteComment,
        refreshComments,
        clearError: clearCommentsError,
        totalCount: commentsCount
    } = useVehicleComments(vehicleId);

    const {
        photos,
        loading: photosLoading,
        error: photosError,
        uploading: photosUploading,
        uploadProgress,
        viewMode: photosViewMode,
        filters: photoFilters,
        addPhoto,
        deletePhoto,
        refreshPhotos,
        setViewMode: setPhotosViewMode,
        setFilters: setPhotoFilters,
        clearError: clearPhotosError,
        totalCount: photosCount
    } = useVehiclePhotos(vehicleId);

    // Mise à jour des filtres photos avec attachedId
    // Retiré pour éviter la boucle infinie de re-rendus
    // React.useEffect(() => {
    //     setPhotoFilters({
    //         ...photoFilters,
    //         attachedId: vehicleId,
    //         entityType: 'vehicle',
    //         entityId: vehicleId
    //     });
    // }, [vehicleId, photoFilters, setPhotoFilters]);

    const {
        documents,
        loading: documentsLoading,
        error: documentsError,
        pagination: documentsPagination,
        refreshDocuments,
        clearError: clearDocumentsError
    } = useDocuments({
        attachedTo: 'vehicle',
        attachedId: vehicleId,
        limit: 50
    });

    const {
        uploadSingleDocument,
        uploading: documentsUploading,
        clearError: clearUploadError
    } = useUploadDocuments();

    // Références pour les inputs
    const commentInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Utilitaires
    const formatDate = useCallback((dateInput: string | Date) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'À l\'instant';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }, []);

    const getUserInitials = (userName: string) => {
        return userName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Gestion des commentaires
    const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !vehicleId) return;

        const commentData: CreateCommentData = {
            message: newComment.trim(),
            entityType: 'vehicle',
            entityId: vehicleId,
            attachments: selectedFiles.length > 0 ? selectedFiles : undefined
        };

        const result = await addComment(commentData);
        if (result) {
            setNewComment('');
            setSelectedFiles([]);
        }
    }, [newComment, vehicleId, selectedFiles, addComment]);

    const handleEditComment = useCallback(async (commentId: string) => {
        if (!editCommentText.trim()) return;

        const result = await updateComment(commentId, { message: editCommentText.trim() });
        if (result) {
            setEditingComment(null);
            setEditCommentText('');
        }
    }, [editCommentText, updateComment]);

    const handleDeleteComment = useCallback(async (commentId: string) => {
        try {
            const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?');
            if (confirmed) {
                const success = await deleteComment(commentId);
                if (success) {
                    console.log('Commentaire supprimé avec succès');
                } else {
                    console.error('Erreur lors de la suppression du commentaire');
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du commentaire:', error);
        }
    }, [deleteComment]);

    // Gestion des photos
    const handlePhotoUpload = useCallback(async (files: FileList) => {
        if (!files.length || !vehicleId) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner un fichier image valide.');
            return;
        }

        const photoData: PhotoUploadData = {
            file,
            entityType: 'vehicle',
            entityId: vehicleId,
            locationType: (locationTypeFilter as 'interior' | 'exterior' | 'engine' | 'dashboard' | 'other') || undefined
        };

        await addPhoto(photoData);
    }, [vehicleId, locationTypeFilter, addPhoto]);

    const handleDeletePhoto = useCallback(async (photoId: string) => {
        try {
            const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?');
            if (confirmed) {
                const success = await deletePhoto(photoId);
                if (success) {
                    console.log('Photo supprimée avec succès');
                } else {
                    console.error('Erreur lors de la suppression de la photo');
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
        }
    }, [deletePhoto]);

    // Gestion des documents
    const handleDocumentUpload = useCallback(async (files: FileList) => {
        if (!files.length || !vehicleId) return;

        const documentsToUpload = Array.from(files).map(file => ({
            file,
            metadata: {
                fileName: file.name,
                mimeType: file.type,
                attachedTo: 'vehicle',
                attachedId: vehicleId,
                labels: labelFilter ? [labelFilter] : []
            }
        }));

        // Upload des documents un par un
        for (const docData of documentsToUpload) {
            await uploadSingleDocument(docData.file, docData.metadata);
        }
        refreshDocuments();
    }, [vehicleId, labelFilter, uploadSingleDocument, refreshDocuments]);

    const handleDeleteDocument = useCallback(async (documentId: string) => {
        try {
            const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?');
            if (confirmed) {
                const response = await fetch(`/api/documents/${documentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    refreshDocuments();
                    console.log('Document supprimé avec succès');
                } else {
                    const errorData = await response.json();
                    console.error('Erreur lors de la suppression du document:', errorData.error || response.statusText);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
        }
    }, [authToken, refreshDocuments]);

    const handleDownloadDocument = useCallback(async (document: Document) => {
        try {
            const response = await fetch(`/api/documents/${document.id}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.fileName;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
        }
    }, [authToken]);

    // Gestion du drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = e.dataTransfer.files;
        if (activePanel === 'photos') {
            handlePhotoUpload(files);
        } else if (activePanel === 'documents') {
            handleDocumentUpload(files);
        }
    }, [activePanel, handlePhotoUpload, handleDocumentUpload]);

    // Gestion des filtres
    const applyPhotoFilters = useCallback(() => {
        setPhotoFilters({
            ...photoFilters,
            search: searchQuery || undefined,
            locationType: (locationTypeFilter as 'interior' | 'exterior' | 'engine' | 'dashboard' | 'other') || undefined,
            attachedId: vehicleId
        });
        refreshPhotos();
    }, [photoFilters, searchQuery, locationTypeFilter, setPhotoFilters, vehicleId, refreshPhotos]);

    const applyDocumentFilters = useCallback(() => {
        // Les documents utilisent les filtres intégrés du hook useDocuments
        refreshDocuments();
    }, [refreshDocuments]);

    // Calcul des badges avec useMemo pour optimiser
    const commentCount = React.useMemo(() => comments.length, [comments]);
    const photoCount = React.useMemo(() => photos.length, [photos]);
    const docCount = React.useMemo(() => documents.length, [documents]);

    const navItems = React.useMemo(() => [
        { id: 'comments', label: 'Commentaires', icon: MessageSquare, count: commentCount },
        { id: 'photos', label: 'Photos', icon: Image, count: photoCount },
        { id: 'documents', label: 'Documents', icon: FileText, count: docCount },
    ], [commentCount, photoCount, docCount]);

    return (
        <div className="flex items-start gap-4" data-testid="right-sidebar">
            {/* Panel Content */}
            {activePanel && (
                <div
                    data-testid="sidebar-panel-content"
                    className={`w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px] transition-all duration-300 ${dragOver ? 'ring-2 ring-[#008751] ring-opacity-50' : ''
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 capitalize">
                                {activePanel === 'comments' ? 'Commentaires' :
                                    activePanel === 'photos' ? 'Photos' : 'Documents'}
                            </h3>
                            {(commentsLoading || photosLoading || documentsLoading) && (
                                <Loader2 size={14} className="animate-spin text-[#008751]" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Filtres"
                            >
                                <Filter size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    if (activePanel === 'comments') refreshComments();
                                    else if (activePanel === 'photos') refreshPhotos();
                                    else if (activePanel === 'documents') refreshDocuments();
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Rafraîchir"
                            >
                                <RefreshCw size={14} />
                            </button>
                            {/* <button className="text-gray-400 hover:text-gray-600">
                                <ExternalLink size={14} />
                            </button> */}
                        </div>
                    </div>

                    {/* Filtres */}
                    {showFilters && (
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 space-y-3">
                            {/* Barre de recherche */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>

                            {/* Filtres spécifiques */}
                            {activePanel === 'photos' && (
                                <div className="flex gap-2">
                                    <select
                                        value={locationTypeFilter}
                                        onChange={(e) => setLocationTypeFilter(e.target.value)}
                                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                    >
                                        <option value="">Tous les emplacements</option>
                                        <option value="interior">Intérieur</option>
                                        <option value="exterior">Extérieur</option>
                                        <option value="engine">Moteur</option>
                                        <option value="dashboard">Tableau de bord</option>
                                        <option value="other">Autre</option>
                                    </select>
                                    <button
                                        onClick={applyPhotoFilters}
                                        className="px-3 py-1.5 bg-[#008751] text-white rounded text-xs hover:bg-[#006638] transition-colors"
                                    >
                                        Appliquer
                                    </button>
                                </div>
                            )}

                            {activePanel === 'documents' && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={labelFilter}
                                        onChange={(e) => setLabelFilter(e.target.value)}
                                        placeholder="Etiquettes..."
                                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                    />
                                    <button
                                        onClick={applyDocumentFilters}
                                        className="px-3 py-1.5 bg-[#008751] text-white rounded text-xs hover:bg-[#006638] transition-colors"
                                    >
                                        Appliquer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Messages */}
                    {(commentsError || photosError || documentsError) && (
                        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle size={14} />
                                <span className="text-sm">
                                    {commentsError || photosError || documentsError}
                                </span>
                                <button
                                    onClick={() => {
                                        clearCommentsError();
                                        clearPhotosError();
                                        clearDocumentsError();
                                    }}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">

                        {/* Comments Panel */}
                        {activePanel === 'comments' && (
                            <>
                                <div className="flex-1 p-4 space-y-6">
                                    {commentsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-[#008751]" size={24} />
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>Aucun commentaire pour le moment.</p>
                                            <p className="text-sm mt-1">Soyez le premier à commenter !</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                                                    {getUserInitials(comment.userName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-[#008751] uppercase">
                                                            {comment.userName}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {formatDate(comment.createdAt.toString())}
                                                        </span>
                                                    </div>

                                                    {editingComment === comment.id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751] resize-none"
                                                                rows={3}
                                                                placeholder="Modifier le commentaire..."
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditComment(comment.id)}
                                                                    className="px-2 py-1 bg-[#008751] text-white rounded text-xs hover:bg-[#006638] transition-colors flex items-center gap-1"
                                                                >
                                                                    <Check size={10} />
                                                                    Sauvegarder
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingComment(null);
                                                                        setEditCommentText('');
                                                                    }}
                                                                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors flex items-center gap-1"
                                                                >
                                                                    <X size={10} />
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-900 mb-2">{comment.message}</p>

                                                            {/* Pièces jointes */}
                                                            {comment.attachments && comment.attachments.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {comment.attachments.map((attachment, index) => (
                                                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded text-xs">
                                                                            <Paperclip size={12} className="text-gray-400" />
                                                                            <span className="text-gray-600">{attachment.fileName}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingComment(comment.id);
                                                                        setEditCommentText(comment.message);
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-[#008751] transition-colors"
                                                                    title="Modifier"
                                                                >
                                                                    <Edit3 size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Formulaire d'ajout */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <form onSubmit={handleSubmitComment} className="space-y-3">
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                                                HR
                                            </div>
                                            <div className="flex-1 relative">
                                                <input
                                                    ref={commentInputRef}
                                                    data-testid="comment-input"
                                                    type="text"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Ajouter un commentaire..."
                                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                                />
                                                <button
                                                    data-testid="comment-submit-btn"
                                                    type="submit"
                                                    disabled={!newComment.trim() || commentsLoading}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-[#008751] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fichiers sélectionnés */}
                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-1">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded text-xs">
                                                        <Paperclip size={12} className="text-gray-400" />
                                                        <span className="text-gray-600 flex-1 truncate">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))}
                                                multiple
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-[#008751] transition-colors"
                                            >
                                                <Paperclip size={12} />
                                                Joindre
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim() || commentsLoading}
                                                className="px-3 py-1 bg-[#008751] text-white rounded text-xs hover:bg-[#006638] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {commentsLoading ? 'Envoi...' : 'Publier'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}

                        {/* Photos Panel */}
                        {activePanel === 'photos' && (
                            <>
                                {/* Barre d'outils */}
                                <div className="p-4 bg-white border-b border-gray-200 space-y-3">
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                                            {getLocationTypeLabel(locationTypeFilter) || 'Type d\'emplacement'} <ChevronDown size={12} />
                                        </button>
                                        <div className="flex ml-auto border border-gray-300 rounded overflow-hidden">
                                            <button
                                                onClick={() => setPhotosViewMode('grid')}
                                                className={`p-1.5 ${photosViewMode === 'grid' ? 'bg-[#008751] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <Grid size={14} />
                                            </button>
                                            <button
                                                onClick={() => setPhotosViewMode('list')}
                                                className={`p-1.5 ${photosViewMode === 'list' ? 'bg-[#008751] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <List size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto">
                                    {photosLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-[#008751]" size={24} />
                                        </div>
                                    ) : photos.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 mb-4">
                                                <Image size={48} className="text-gray-300 mx-auto" />
                                            </div>
                                            <p className="text-sm text-gray-500">Aucune photo trouvée</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Glissez-déposez des images ou cliquez pour uploader
                                            </p>
                                        </div>
                                    ) : (
                                        <div className={photosViewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                                            {photos.map((photo) => (
                                                <div key={photo.id} className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden group ${photosViewMode === 'list' ? 'flex items-center gap-3 p-3' : 'aspect-square'}`}>
                                                    <img
                                                        src={photo.filePath}
                                                        alt={photo.description || photo.fileName}
                                                        className={`object-cover ${photosViewMode === 'grid' ? 'w-full h-full' : 'w-16 h-16 rounded'}`}
                                                    />

                                                    {photosViewMode === 'grid' && (
                                                        <>
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                                                                {photo.description || photo.fileName}
                                                            </div>
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}

                                                    {photosViewMode === 'list' && (
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {photo.description || photo.fileName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatPhotoFileSize(photo.fileSize)} • {getLocationTypeLabel(photo.locationType)}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Zone d'upload */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <input
                                        type="file"
                                        ref={photoInputRef}
                                        onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                    />

                                    <div
                                        data-testid="upload-area-photos"
                                        onClick={() => photoInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#008751] hover:bg-green-50 transition-colors cursor-pointer group"
                                    >
                                        {photosUploading ? (
                                            <div className="space-y-2">
                                                <Loader2 className="animate-spin text-[#008751] mx-auto" size={24} />
                                                <p className="text-sm text-gray-600">Upload en cours... {uploadProgress}%</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-[#008751] h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white transition-colors">
                                                    <Camera size={20} className="text-gray-400 group-hover:text-[#008751]" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">Glissez-déposez ou cliquez pour uploader</p>
                                                <p className="text-xs text-gray-500 mt-1">Images jusqu'à 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Documents Panel */}
                        {activePanel === 'documents' && (
                            <>
                                {/* Barre d'outils */}
                                <div className="p-4 bg-white border-b border-gray-200 space-y-3">
                                    <div className="flex gap-2 flex-wrap">
                                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                                            {labelFilter || 'Etiquettes'} <ChevronDown size={12} />
                                        </button>
                                        {/* <div className="flex ml-auto border border-gray-300 rounded overflow-hidden">
                                            <button className="p-1.5 bg-[#008751] text-white">
                                                <Grid size={14} />
                                            </button>
                                            <button className="p-1.5 bg-white text-gray-400 hover:bg-gray-50">
                                                <List size={14} />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto">
                                    {documentsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-[#008751]" size={24} />
                                        </div>
                                    ) : documents.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 mb-4">
                                                <FileText size={48} className="text-gray-300 mx-auto" strokeWidth={1} />
                                            </div>
                                            <p className="text-sm text-gray-500">Aucun document trouvé</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Glissez-déposez des fichiers ou cliquez pour uploader
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-3 group hover:border-[#008751] transition-colors">
                                                    <FileText size={24} className="text-gray-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(doc.fileSize)} • {getMimeTypeCategory(doc.mimeType)}
                                                        </p>
                                                        {doc.description && (
                                                            <p className="text-xs text-gray-400 mt-1 truncate">{doc.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleDownloadDocument(doc)}
                                                            className="p-1 text-gray-400 hover:text-[#008751] transition-colors"
                                                            title="Télécharger"
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Zone d'upload */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                                        multiple
                                        className="hidden"
                                    />

                                    <div
                                        data-testid="upload-area-documents"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#008751] hover:bg-green-50 transition-colors cursor-pointer group"
                                    >
                                        {documentsUploading ? (
                                            <div className="space-y-2">
                                                <Loader2 className="animate-spin text-[#008751] mx-auto" size={24} />
                                                <p className="text-sm text-gray-600">Upload en cours...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white transition-colors">
                                                    <Folder size={20} className="text-gray-400 group-hover:text-[#008751]" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">Glissez-déposez ou cliquez pour uploader</p>
                                                <p className="text-xs text-gray-500 mt-1">Tous types de fichiers jusqu'à 50MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Vertical Icon Strip */}
            <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        data-testid={`sidebar-${item.id}-btn`}
                        onClick={() => onPanelChange(activePanel === item.id ? null : (item.id as any))}
                        className={`w-10 h-10 rounded flex items-center justify-center relative transition-all duration-200 ${activePanel === item.id
                            ? 'bg-[#008751] text-white shadow-sm transform scale-105'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700 hover:shadow-sm'
                            }`}
                        title={item.label}
                    >
                        <item.icon size={20} strokeWidth={2} />
                        {item.count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                                {item.count > 99 ? '99+' : item.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}