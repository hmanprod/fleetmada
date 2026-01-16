'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, MoreHorizontal, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { MOCK_VEHICLES, MOCK_EXPENSE_ENTRIES } from '../../types';
import { EntitySidebar } from '@/components/EntitySidebar';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { Comment } from '@/types/comments';
import { Photo } from '@/types/photos';

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const entry = MOCK_EXPENSE_ENTRIES.find(e => e.id === params.id) || MOCK_EXPENSE_ENTRIES[0]; // Fallback for dev

    if (!entry) return <div>Entry not found</div>;

    const vehicle = MOCK_VEHICLES.find(v => v.id === entry.vehicleId);

    // Sidebar State
    const [activePanel, setActivePanel] = useState<'comments' | 'photos' | 'documents' | null>('comments');

    // Comments State (Mock implementation for now)
    const [comments, setComments] = useState<Comment[]>([]);

    // Documents Hook
    const {
        documents,
        loading: documentsLoading,
        error: documentsError,
        refreshDocuments,
    } = useDocuments({
        attachedTo: 'expense',
        attachedId: params.id,
        limit: 50
    });

    const { uploadSingleDocument } = useUploadDocuments();

    // Mock Handlers
    const handleAddComment = async (message: string, attachments?: File[]) => {
        const commentId = Math.random().toString(36).substr(2, 9);
        const newComment: Comment = {
            id: commentId,
            message: message,
            userName: 'Current User',
            userId: 'current-user',
            entityType: 'expense',
            entityId: params.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isEdited: false,
            attachments: attachments ? Array.from(attachments).map((f, index) => ({
                id: `${commentId}-att-${index}`,
                commentId: commentId,
                fileName: f.name,
                fileSize: f.size,
                mimeType: f.type,
                filePath: '', // Mock path
                createdAt: new Date()
            })) : []
        };
        setComments(prev => [newComment, ...prev]);
        return Promise.resolve();
    };

    const handleAddDocument = async (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            await uploadSingleDocument(files[i], {
                attachedTo: 'expense',
                attachedId: params.id,
                fileName: files[i].name,
                mimeType: files[i].type
            });
        }
        refreshDocuments();
    };

    // Photos - Filtering from documents for now as a simple implementation since uploads go to documents
    const photos: Photo[] = documents
        .filter(d => d.mimeType.startsWith('image/'))
        .map(d => ({
            id: d.id,
            fileName: d.fileName,
            description: d.description,
            filePath: d.filePath,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
            userId: d.userId,
            userName: d.user?.name || 'Unknown',
            entityType: 'expense',
            entityId: params.id,
            isPublic: d.isPublic || false,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
            // Optional fields
            thumbnailPath: undefined,
            width: undefined,
            height: undefined,
            locationType: undefined,
            tags: []
        }));

    const handleAddPhoto = async (files: FileList) => {
        return handleAddDocument(files);
    };


    const handleBack = () => {
        router.push('/vehicles/expense');
    };

    const handleEdit = () => {
        router.push(`/vehicles/expense/${params.id}/edit`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Expense Entries
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Expense Entry #{entry.id}</h1>
                </div>

                <div className="flex gap-2">
                    {/* <div className="relative">
                        <button className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 flex items-center">
                            <MoreHorizontal size={20} />
                        </button>
                    </div> */}
                    <button onClick={handleEdit} className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Edit
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Details</h2>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">All Fields</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Vehicle</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {/* Placeholder for vehicle image if needed */}
                                            <div className="w-full h-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-xs">{vehicle?.name?.substring(0, 2)}</div>
                                        </div>
                                        <Link href={`/vehicles/${vehicle?.id}`} className="text-[#008751] font-medium hover:underline">
                                            {vehicle?.name}
                                        </Link>
                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Date</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted">{entry.date}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Type</div>
                                    <div className="text-sm text-gray-900">{entry.type}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Source</div>
                                    <div className="text-sm text-gray-900">{entry.source}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Vendor</div>
                                    <div className="text-sm text-gray-900">{entry.vendor || '—'}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Amount</div>
                                    <div className="text-sm text-gray-900 font-medium">{entry.amount} {entry.currency}</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Notes</div>
                                    <div className="text-sm text-gray-900">{entry.notes || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Actions */}
                <div className="shrink-0">
                    <EntitySidebar
                        entityType="expense"
                        entityId={params.id}
                        activePanel={activePanel}
                        onPanelChange={setActivePanel}

                        comments={comments}
                        commentsLoading={false}
                        onAddComment={handleAddComment}
                        onUpdateComment={async () => { }}
                        onDeleteComment={async () => { }}
                        onRefreshComments={() => { }}

                        photos={photos}
                        photosLoading={documentsLoading}
                        onAddPhoto={handleAddPhoto}
                        onDeletePhoto={async () => { }}
                        onRefreshPhotos={refreshDocuments}

                        documents={documents}
                        documentsLoading={documentsLoading}
                        documentsError={documentsError}
                        onAddDocument={handleAddDocument}
                        onDeleteDocument={async () => { }}
                        onDownloadDocument={async () => { }}
                        onRefreshDocuments={refreshDocuments}
                    />
                </div>
            </div>
        </div>
    );
}
