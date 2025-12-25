"use client";

import React, { useState } from 'react';
import { MessageSquare, Image, FileText, Send, Search, Grid, List, ChevronDown, Upload, ExternalLink } from 'lucide-react';

interface RightSidebarProps {
    activePanel: 'comments' | 'photos' | 'documents' | null;
    onPanelChange: (panel: 'comments' | 'photos' | 'documents' | null) => void;
    newComment: string;
    onCommentChange: (comment: string) => void;
    onAddComment: () => void;
}

export function RightSidebar({
    activePanel,
    onPanelChange,
    newComment,
    onCommentChange,
    onAddComment
}: RightSidebarProps) {
    const [comments, setComments] = useState([
        {
            id: '1',
            user: 'Hery RABOTOVAO',
            message: 'This is a comment test for this car',
            timestamp: new Date().toISOString(), // Mock "a few seconds ago"
            avatar: 'HR'
        }
    ]);

    const [photos, setPhotos] = useState<any[]>([]); // Mock empty for now or populate
    const [documents, setDocuments] = useState<any[]>([]);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            const comment = {
                id: Date.now().toString(),
                user: 'Hery RABOTOVAO',
                message: newComment,
                timestamp: new Date().toISOString(),
                avatar: 'HR'
            };
            setComments(prev => [comment, ...prev]);
            onAddComment();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate badges
    const commentCount = comments.length;
    const photoCount = photos.length;
    const docCount = documents.length;

    const navItems = [
        { id: 'comments', label: 'Comments', icon: MessageSquare, count: commentCount },
        { id: 'photos', label: 'Photos', icon: Image, count: photoCount },
        { id: 'documents', label: 'Documents', icon: FileText, count: docCount },
    ];

    return (
        <div className="flex items-start gap-4">
            {/* Panel Content (only visible if a panel is active) */}
            {activePanel && (
                <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 capitalize">{activePanel}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <ExternalLink size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">

                        {/* Comments Panel */}
                        {activePanel === 'comments' && (
                            <>
                                <div className="flex-1 p-4 space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                                                {comment.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-[#008751] uppercase">{comment.user}</span>
                                                    <span className="text-xs text-gray-400">a few seconds ago</span>
                                                </div>
                                                <p className="text-sm text-gray-900">{comment.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">
                                            No comments yet.
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <form onSubmit={handleSubmitComment} className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                                            HR
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => onCommentChange(e.target.value)}
                                                placeholder="Add a Comment"
                                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                            />
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}

                        {/* Photos Panel */}
                        {activePanel === 'photos' && (
                            <>
                                <div className="p-4 bg-white border-b border-gray-200 space-y-3">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search filename or description"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                                            Location Type <ChevronDown size={12} />
                                        </button>
                                        <div className="flex ml-auto">
                                            <button className="p-1.5 border border-gray-300 rounded-l hover:bg-gray-50">
                                                <Grid size={14} className="text-gray-600" />
                                            </button>
                                            <button className="p-1.5 border-t border-b border-r border-gray-300 rounded-r hover:bg-gray-50">
                                                <List size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto">
                                    {photos.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 mb-4">
                                                {/* Placeholder Apple logo or generic image icon as seen in screenshot */}
                                                <Image size={48} className="text-gray-300 mx-auto" />
                                            </div>
                                            <p className="text-sm text-gray-500">No photos found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {photos.map((photo) => (
                                                <div key={photo.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                                        {photo.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white border-t border-gray-200">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#008751] hover:bg-green-50 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white">
                                            <Upload size={20} className="text-gray-400 group-hover:text-[#008751]" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                                        <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Documents Panel */}
                        {activePanel === 'documents' && (
                            <>
                                <div className="p-4 bg-white border-b border-gray-200 space-y-3">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search filename or description"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                                            Location Type <ChevronDown size={12} />
                                        </button>
                                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                                            Labels <ChevronDown size={12} />
                                        </button>
                                        <div className="flex ml-auto">
                                            <button className="p-1.5 border border-gray-300 rounded-l hover:bg-gray-50">
                                                <Grid size={14} className="text-gray-600" />
                                            </button>
                                            <button className="p-1.5 border-t border-b border-r border-gray-300 rounded-r hover:bg-gray-50">
                                                <List size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto">
                                    {documents.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 mb-4">
                                                <FileText size={48} className="text-gray-300 mx-auto" strokeWidth={1} />
                                            </div>
                                            <p className="text-sm text-gray-500">No documents found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-3">
                                                    <FileText size={24} className="text-gray-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.size}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white border-t border-gray-200">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#008751] hover:bg-green-50 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white">
                                            <Upload size={20} className="text-gray-400 group-hover:text-[#008751]" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                                        <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
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
                        onClick={() => onPanelChange(activePanel === item.id ? null : (item.id as any))}
                        className={`w-10 h-10 rounded flex items-center justify-center relative transition-colors ${activePanel === item.id
                                ? 'bg-[#008751] text-white shadow-sm'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        title={item.label}
                    >
                        <item.icon size={20} strokeWidth={2} />
                        {item.count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center border border-white">
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}