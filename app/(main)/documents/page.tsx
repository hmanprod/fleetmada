'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, MoreHorizontal, Download, Eye, Edit, Trash2, FileText, Image, File, Upload, X, AlertCircle, CheckCircle, FolderOpen, ArrowLeft } from 'lucide-react';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useDocumentOperations } from '@/lib/hooks/useDocumentOperations';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { useDocumentSearch } from '@/lib/hooks/useDocumentSearch';
import { Document, formatFileSize, isImageFile, isPdfFile } from '@/types/documents';


interface DocumentCardProps {
  document: Document;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDownload, onDelete, onPreview }) => {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="text-blue-500" size={20} />;
    if (mimeType === 'application/pdf') return <FileText className="text-red-500" size={20} />;
    return <File className="text-gray-500" size={20} />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow" data-testid="document-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {getFileIcon(document.mimeType)}

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{document.fileName}</h3>
            <p className="text-sm text-gray-500">{formatFileSize(document.fileSize)}</p>
            <p className="text-xs text-gray-400">Par {document.user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-400">{formatDate(document.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPreview(document.id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Prévisualiser"
            aria-label="Prévisualiser"
            data-testid="preview-button"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => onDownload(document.id)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            title="Télécharger"
            aria-label="Télécharger"
            data-testid="download-button"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => onDelete(document.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Supprimer"
            aria-label="Supprimer"
            data-testid="delete-button"
          >
            <Trash2 size={16} />
          </button>

        </div>
      </div>

      {document.labels && document.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {document.labels.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {document.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{document.description}</p>
      )}
    </div>
  );
};

export default function DocumentsPage() {
  const router = useRouter();
  console.log('Rendering DocumentsPage', { timestamp: new Date().toISOString() });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMimeType, setSelectedMimeType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const memoizedFilters = React.useMemo(() => ({
    search: searchQuery,
    mimeType: selectedMimeType,
    limit: 20,
    sortBy,
    sortOrder,
    page: currentPage
  }), [searchQuery, selectedMimeType, sortBy, sortOrder, currentPage]);

  const { documents = [], loading, error, pagination, fetchDocuments, refreshDocuments, clearError } = useDocuments(memoizedFilters);

  const { downloadDocument, deleteDocument, loading: operationsLoading } = useDocumentOperations();
  const { uploading, uploadProgress, uploadDocuments, error: uploadError, clearError: clearUploadError } = useUploadDocuments();
  const { searchResults, searchDocuments, loading: searchLoading } = useDocumentSearch();


  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchDocuments(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchDocuments]);

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  };

  const handleFilesSelected = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv'
      ];
      return validTypes.includes(file.type) && file.size < 50 * 1024 * 1024; // 50MB max
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    fetchDocuments();
  };

  const handleRefresh = () => {
    refreshDocuments();
  };

  const handleAdd = () => {
    router.push('/documents/upload');
  };

  const handleQuickUpload = async () => {
    if (selectedFiles.length === 0) return;

    const metadata = {
      labels: ['upload-rapide'],
      isPublic: false
    };

    const results = await uploadDocuments(selectedFiles, metadata);
    if (results.every(r => r.success)) {
      setSelectedFiles([]);
      fetchDocuments();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownload = async (id: string) => {
    await downloadDocument(id, 'download');
  };

  const handlePreview = async (id: string) => {
    await downloadDocument(id, 'preview');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      const success = await deleteDocument(id);
      if (success) {
        fetchDocuments(); // Rafraîchir la liste
      }
    }
  };

  const handleCancel = () => {
    router.push('/documents');
  };

  if (error) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-medium hover:bg-red-200"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">Documents</h1>

          {pagination && (
            <span className="text-sm text-gray-500">
              {pagination.totalCount} document{pagination.totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`border rounded p-2 text-gray-600 hover:bg-gray-50 ${showFilters ? 'bg-gray-50' : ''}`}
            title="Filtres"
            aria-label="Filtres"
            data-testid="filter-button"
          >
            <Filter size={20} />
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="border rounded p-2 text-gray-600 hover:bg-gray-50"
            title="Changer la vue"
            aria-label="Changer la vue"
          >
            <FolderOpen size={20} />
          </button>
          <button
            onClick={handleAdd}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            data-testid="add-document-button"
          >
            <Plus size={20} /> Ajouter un document
          </button>

        </div>
      </div>

      {/* Zone de drag & drop */}
      {dragActive && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 border-2 border-dashed border-blue-500">
            <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <p className="text-lg font-medium text-gray-900">Déposez vos fichiers ici</p>
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div
        className={`flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center ${dragActive ? 'border-blue-400 bg-blue-50' : ''
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher des documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />

          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#008751]"></div>
            </div>
          )}
        </div>

        {showFilters && (
          <>
            <select
              value={selectedMimeType}
              onChange={(e) => setSelectedMimeType(e.target.value)}
              data-testid="mime-type-select"
              className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700"
            >

              <option value="">Tous les types</option>
              <option value="image">Images</option>
              <option value="pdf">PDF</option>
              <option value="document">Documents</option>
              <option value="text">Texte</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              data-testid="sort-by-select"
              className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700"
            >

              <option value="createdAt">Date de création</option>
              <option value="updatedAt">Date de modification</option>
              <option value="fileName">Nom de fichier</option>
              <option value="fileSize">Taille</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              data-testid="sort-order-select"
              className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700"
            >

              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </>
        )}

        <button
          onClick={handleSearch}
          disabled={loading || searchLoading}
          className="bg-[#008751] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#007043] disabled:opacity-50"
        >
          {loading || searchLoading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {/* Fichiers sélectionnés pour upload rapide */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              Upload rapide ({selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleQuickUpload}
                disabled={uploading}
                className="bg-[#008751] text-white px-4 py-2 rounded text-sm hover:bg-[#007043] disabled:opacity-50"
              >
                {uploading ? 'Téléversement…' : 'Tout téléverser'}
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  {isImageFile(file.type) ? (
                    <Image className="text-blue-500" size={16} />
                  ) : isPdfFile(file.type) ? (
                    <FileText className="text-red-500" size={16} />
                  ) : (
                    <File className="text-gray-500" size={16} />
                  )}
                  <span className="text-sm text-gray-900 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={() => removeSelectedFile(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Progress d'upload */}
          {uploading && uploadProgress.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadProgress.map((progress, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{progress.fileName}</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#008751] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                  {progress.error && (
                    <p className="text-sm text-red-600 mt-1">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-500 mb-4">Commencez par télécharger votre premier document.</p>
          <button
            onClick={handleAdd}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
          >
            <Plus size={20} /> Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="document-grid">
          {documents.map((document) => (

            <DocumentCard
              key={document.id}
              document={document}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} sur{' '}
            {pagination.totalCount} documents
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                fetchDocuments({ ...memoizedFilters, page: pagination.page - 1 });
              }}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                fetchDocuments({ ...memoizedFilters, page: pagination.page + 1 });
              }}
              disabled={!pagination.hasNext}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
