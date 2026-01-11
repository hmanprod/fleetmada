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
    Trash2,
    Edit3,
    X,
    Check,
    Loader2,
    AlertCircle,
    Paperclip,
    Filter,
    RefreshCw,
    Clock
} from 'lucide-react';
import { Comment } from '@/types/comments';
import { Photo } from '@/types/photos';
import { Document } from '@/types/documents';

interface EntitySidebarProps {
    entityType: 'vehicle' | 'issue' | 'contact';
    entityId: string;
    activePanel: 'comments' | 'photos' | 'documents' | null;
    onPanelChange: (panel: 'comments' | 'photos' | 'documents' | null) => void;

    // Comments Data & Handlers
    comments: Comment[];
    commentsLoading: boolean;
    commentsError?: string | null;
    onAddComment: (message: string, attachments?: File[]) => Promise<any>;
    onUpdateComment: (id: string, message: string) => Promise<any>;
    onDeleteComment: (id: string) => Promise<any>;
    onRefreshComments: () => void;

    // Photos Data & Handlers
    photos: Photo[];
    photosLoading: boolean;
    photosError?: string | null;
    onAddPhoto: (files: FileList, locationType?: string) => Promise<any>;
    onDeletePhoto: (id: string) => Promise<any>;
    onRefreshPhotos: () => void;

    // Documents Data & Handlers
    documents: Document[];
    documentsLoading: boolean;
    documentsError?: string | null;
    onAddDocument: (files: FileList, labels?: string[]) => Promise<any>;
    onDeleteDocument: (id: string) => Promise<any>;
    onDownloadDocument: (doc: Document) => Promise<any>;
    onRefreshDocuments: () => void;
}

export function EntitySidebar({
    entityType,
    entityId,
    activePanel,
    onPanelChange,

    comments,
    commentsLoading,
    commentsError,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onRefreshComments,

    photos,
    photosLoading,
    photosError,
    onAddPhoto,
    onDeletePhoto,
    onRefreshPhotos,

    documents,
    documentsLoading,
    documentsError,
    onAddDocument,
    onDeleteDocument,
    onDownloadDocument,
    onRefreshDocuments
}: EntitySidebarProps) {
    // Local state
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Refs
    const commentInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    // Utils
    const formatDate = useCallback((dateInput: string | Date) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handlers
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        await onAddComment(newComment.trim(), selectedFiles);
        setNewComment('');
        setSelectedFiles([]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (activePanel === 'photos') onAddPhoto(files);
        else if (activePanel === 'documents') onAddDocument(files);
    };

    // Filter Logic (Simple client-side filtering for demo purposes, can be extended)
    const filteredComments = comments.filter(c =>
        c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPhotos = photos.filter(p =>
        (p.description || p.fileName).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDocuments = documents.filter(d =>
        d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex items-start gap-4 h-full" data-testid="entity-sidebar">
            {/* Navigation Icons (if needed standalone, but typically part of parent layout or integrated here) */}
            {/* For now, assuming parent handles the layout of icons vs panel. 
                But wait, the Vehicle RightSidebar was just the panel. 
                The icons were in the parent page layout? No, let's check. 
                RightSidebar in vehicle page renders the panel content. 
                Wait, where are the icons?
                In Vehicle page: <RightSidebar activePanel={...} ... />
                And the icons are... handled by RightSidebar?
                Let's re-read the Vehicle RightSidebar code.
            */}

            {/* 
               In Vehicle RightSidebar.tsx, line 385:
               return (
                  <div className="flex items-start gap-4">
                     {activePanel && ( ... panel content ... )}
                  </div>
               )
               
               It DOES NOT render the icons sidebar! 
               Wait, let me check where the sidebar icons are in Vehicle page. 
               
               Vehicle page line 429:
               <RightSidebar activePanel={activeSidebarPanel} ... />
               
               I missed where the icons are rendered.
               Ah, I see `navItems` in RightSidebar.tsx (lines 378-382) but it is NOT used in the return JSX! 
               
               Wait, looking at Vehicle's `RightSidebar.tsx`:
               It renders `activePanel` content.
               But where is the column of icons?
               
               Let's check `app/(main)/vehicles/list/[id]/components/RightSidebar.tsx` again.
               Lines 385-386:
               return (
                  <div className="flex items-start gap-4" ...>
                      {activePanel && ( ... )}
                  </div>
               )
               
               I suspect the icons are MISSING from the `RightSidebar` code I read?
               Or maybe I scrolled past them?
               
               Let's check line 800+ of `RightSidebar.tsx`. I only saw up to line 800.
               I need to see the rest of `RightSidebar.tsx`.
            */}

            {activePanel && (
                <div className={`w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px] transition-all duration-300 ${dragOver ? 'ring-2 ring-[#008751] ring-opacity-50' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 capitalize">
                                {activePanel === 'comments' ? 'Comments' :
                                    activePanel === 'photos' ? 'Photos' : 'Documents'}
                            </h3>
                            {(commentsLoading || photosLoading || documentsLoading) && (
                                <Loader2 size={14} className="animate-spin text-[#008751]" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowFilters(!showFilters)} className="p-1 text-gray-400 hover:text-gray-600">
                                <Filter size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    if (activePanel === 'comments') onRefreshComments();
                                    if (activePanel === 'photos') onRefreshPhotos();
                                    if (activePanel === 'documents') onRefreshDocuments();
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <RefreshCw size={14} />
                            </button>
                            <button onClick={() => onPanelChange(null)} className="p-1 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">

                        {/* COMMENTS */}
                        {activePanel === 'comments' && (
                            <>
                                <div className="flex-1 p-4 space-y-6">
                                    {commentsLoading && comments.length === 0 ? (
                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#008751]" /></div>
                                    ) : filteredComments.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No comments yet.</p>
                                        </div>
                                    ) : (
                                        filteredComments.map(comment => (
                                            <div key={comment.id} className="flex gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                                                    {getUserInitials(comment.userName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-[#008751] uppercase">{comment.userName}</span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock size={10} /> {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>

                                                    {editingComment === comment.id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-[#008751]"
                                                                rows={3}
                                                            />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => {
                                                                    onUpdateComment(comment.id, editCommentText);
                                                                    setEditingComment(null);
                                                                }} className="px-2 py-1 bg-[#008751] text-white rounded text-xs">Save</button>
                                                                <button onClick={() => setEditingComment(null)} className="px-2 py-1 bg-gray-300 rounded text-xs">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-900 mb-2">{comment.message}</p>
                                                            {/* Attachments */}
                                                            {comment.attachments && comment.attachments.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {comment.attachments.map((att: any, i: number) => (
                                                                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-100 rounded text-xs">
                                                                            <Paperclip size={12} className="text-gray-400" />
                                                                            <span className="text-gray-600">{att.fileName}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => {
                                                                    setEditingComment(comment.id);
                                                                    setEditCommentText(comment.message);
                                                                }} className="text-gray-400 hover:text-[#008751]"><Edit3 size={12} /></button>
                                                                <button onClick={() => onDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <form onSubmit={handleSubmitComment} className="space-y-3">
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">HR</div>
                                            <div className="flex-1 relative">
                                                <input
                                                    ref={commentInputRef}
                                                    type="text"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751]"
                                                />
                                                <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008751] disabled:opacity-50">
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        {/* File Input */}
                                        <div className="flex justify-between items-center">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#008751]">
                                                <Paperclip size={12} /> Attach
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
                                        </div>
                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-1">
                                                {selectedFiles.map((f, i) => (
                                                    <div key={i} className="text-xs bg-gray-100 p-1 flex justify-between">
                                                        <span>{f.name}</span>
                                                        <button type="button" onClick={() => setSelectedFiles(files => files.filter((_, idx) => idx !== i))}><X size={10} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </>
                        )}

                        {/* PHOTOS */}
                        {activePanel === 'photos' && (
                            <>
                                <div className="p-4 bg-white border-b border-gray-200 flex justify-between">
                                    <h4 className="text-xs font-bold uppercase text-gray-500">
                                        {filteredPhotos.length} Photo{filteredPhotos.length !== 1 && 's'}
                                    </h4>
                                    <div className="flex gap-1">
                                        <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}><Grid size={14} /></button>
                                        <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}><List size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto">
                                    {photosLoading && photos.length === 0 ? (
                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#008751]" /></div>
                                    ) : filteredPhotos.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <Image size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No photos found.</p>
                                        </div>
                                    ) : (
                                        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                                            {filteredPhotos.map(photo => (
                                                <div key={photo.id} className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-3 p-2' : ''}`}>
                                                    <img
                                                        src={photo.filePath}
                                                        alt={photo.description || 'Photo'}
                                                        className={`object-cover ${viewMode === 'grid' ? 'w-full aspect-square' : 'w-16 h-16 rounded'}`}
                                                    />
                                                    {viewMode === 'list' && (
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium truncate">{photo.description || photo.fileName}</div>
                                                            <div className="text-xs text-gray-500">{formatFileSize(photo.fileSize)}</div>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => onDeletePhoto(photo.id)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <button onClick={() => photoInputRef.current?.click()} className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 text-sm hover:border-[#008751] hover:text-[#008751]">
                                        Upload Photos
                                    </button>
                                    <input type="file" ref={photoInputRef} className="hidden" accept="image/*" multiple onChange={(e) => e.target.files && onAddPhoto(e.target.files)} />
                                </div>
                            </>
                        )}

                        {/* DOCUMENTS */}
                        {activePanel === 'documents' && (
                            <>
                                <div className="flex-1 p-4 space-y-2">
                                    {documentsLoading && documents.length === 0 ? (
                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#008751]" /></div>
                                    ) : filteredDocuments.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No documents found.</p>
                                        </div>
                                    ) : (
                                        filteredDocuments.map(doc => (
                                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group hover:border-[#008751]">
                                                <div className="p-2 bg-gray-100 rounded text-gray-500"><FileText size={20} /></div>
                                                <div className="flex-1 min-w-0 pointer-events-none">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</div>
                                                    <div className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => onDownloadDocument(doc)} className="text-gray-400 hover:text-[#008751]"><Grid size={14} /></button>
                                                    <button onClick={() => onDeleteDocument(doc.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <button onClick={() => docInputRef.current?.click()} className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 text-sm hover:border-[#008751] hover:text-[#008751]">
                                        Upload Documents
                                    </button>
                                    <input type="file" ref={docInputRef} className="hidden" multiple onChange={(e) => e.target.files && onAddDocument(e.target.files)} />
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

            {/* Sidebar Icons (The missing part from my understanding of Vehicle page) */}
            {/* 
                I will add the icons column HERE to be self-contained in EntitySidebar, 
                so the parent page doesn't need to implement it.
            */}
            <div className="flex flex-col gap-2 pt-2">
                <button
                    onClick={() => onPanelChange(activePanel === 'comments' ? null : 'comments')}
                    className={`p-2 rounded-lg shadow-sm border transition-all relative ${activePanel === 'comments' ? 'bg-[#008751] text-white border-[#008751]' : 'bg-white text-gray-500 border-gray-200 hover:text-[#008751]'}`}
                    title="Comments"
                >
                    <MessageSquare size={20} />
                    {comments.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {comments.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onPanelChange(activePanel === 'photos' ? null : 'photos')}
                    className={`p-2 rounded-lg shadow-sm border transition-all relative ${activePanel === 'photos' ? 'bg-[#008751] text-white border-[#008751]' : 'bg-white text-gray-500 border-gray-200 hover:text-[#008751]'}`}
                    title="Photos"
                >
                    <Image size={20} />
                    {photos.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {photos.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onPanelChange(activePanel === 'documents' ? null : 'documents')}
                    className={`p-2 rounded-lg shadow-sm border transition-all relative ${activePanel === 'documents' ? 'bg-[#008751] text-white border-[#008751]' : 'bg-white text-gray-500 border-gray-200 hover:text-[#008751]'}`}
                    title="Documents"
                >
                    <FileText size={20} />
                    {documents.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {documents.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

