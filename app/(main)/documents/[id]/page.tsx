'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  FileText, 
  Image, 
  Calendar,
  User,
  Tag,
  Hash,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useDocument } from '@/lib/hooks/useDocument';
import { useDocumentOperations } from '@/lib/hooks/useDocumentOperations';
import { Document, formatFileSize, getMimeTypeCategory, isImageFile, isPdfFile } from '@/types/documents';

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Document>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { document, loading, error, fetchDocument, clearError } = useDocument();
  const { 
    downloadDocument, 
    deleteDocument, 
    updateDocument, 
    shareDocument, 
    loading: operationsLoading,
    error: operationsError,
    clearError: clearOperationsError 
  } = useDocumentOperations();

  // Charger le document au montage
  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId);
    }
  }, [documentId, fetchDocument]);

  // Initialiser les données d'édition
  useEffect(() => {
    if (document && isEditing) {
      setEditData({
        description: document.description || '',
        labels: [...document.labels],
        isPublic: document.isPublic
      });
    }
  }, [document, isEditing]);

  const handleBack = () => {
    router.push('/documents');
  };

  const handleDownload = async (action: 'download' | 'preview' = 'download') => {
    await downloadDocument(documentId, action);
  };

  const handleDelete = async () => {
    const success = await deleteDocument(documentId);
    if (success) {
      router.push('/documents');
    }
  };

  const handleEdit = async () => {
    if (!editData) return;

    const success = await updateDocument(documentId, {
      description: editData.description,
      labels: editData.labels,
      isPublic: editData.isPublic
    });

    if (success) {
      setIsEditing(false);
      fetchDocument(documentId); // Recharger les données
    }
  };

  const handleShare = async () => {
    const email = prompt('Email du destinataire:');
    if (!email) return;

    const permission = window.confirm('Donner les permissions d\'écriture? (OK = écriture, Annuler = lecture)');
    const success = await shareDocument(documentId, email, permission ? 'write' : 'read');
    
    if (success) {
      alert('Document partagé avec succès!');
    }
  };

  const addLabel = (label: string) => {
    if (label.trim() && !editData.labels?.includes(label.trim())) {
      setEditData(prev => ({
        ...prev,
        labels: [...(prev.labels || []), label.trim()]
      }));
    }
  };

  const removeLabel = (label: string) => {
    setEditData(prev => ({
      ...prev,
      labels: prev.labels?.filter(l => l !== label) || []
    }));
  };

  const getFileIcon = (mimeType: string) => {
    if (isImageFile(mimeType)) return <Image className="text-blue-500" size={48} />;
    if (isPdfFile(mimeType)) return <FileText className="text-red-500" size={48} />;
    return <FileText className="text-gray-500" size={48} />;
  };

  const getMimeTypeCategoryDisplay = (mimeType: string) => {
    const category = getMimeTypeCategory(mimeType);
    const colors = {
      IMAGE: 'bg-blue-100 text-blue-800',
      PDF: 'bg-red-100 text-red-800',
      DOCUMENT: 'bg-green-100 text-green-800',
      TEXT: 'bg-purple-100 text-purple-800',
      ARCHIVE: 'bg-yellow-100 text-yellow-800',
      AUDIO: 'bg-pink-100 text-pink-800',
      VIDEO: 'bg-indigo-100 text-indigo-800',
      Autre: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.Autre;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Erreur</h3>
          </div>
          <p className="text-red-700 mb-4">{error || 'Document introuvable'}</p>
          <div className="flex gap-2">
            <button
              onClick={clearError}
              className="bg-red-100 text-red-800 px-4 py-2 rounded text-sm font-medium hover:bg-red-200"
            >
              Réessayer
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
            >
              Retour aux documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 truncate">{document.fileName}</h1>
            <p className="text-gray-500">Document #{document.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload('preview')}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Prévisualiser"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => handleDownload('download')}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
            title="Télécharger"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Partager"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
            title="Modifier"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Supprimer"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Erreurs d'opération */}
      {(operationsError) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{operationsError}</p>
              <button
                onClick={clearOperationsError}
                className="mt-1 text-sm text-red-800 underline hover:no-underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aperçu du fichier */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu</h3>
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
              {getFileIcon(document.mimeType)}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Type: {getMimeTypeCategory(document.mimeType)} ({document.mimeType})
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#008751] focus:border-[#008751]"
                  rows={4}
                  placeholder="Description du document..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    disabled={operationsLoading}
                    className="bg-[#008751] text-white px-4 py-2 rounded-md hover:bg-[#007043] disabled:opacity-50"
                  >
                    {operationsLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{document.description || 'Aucune description'}</p>
            )}
          </div>

          {/* Historique */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Document créé</p>
                  <p className="text-xs text-gray-500">{formatDate(document.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Dernière modification</p>
                  <p className="text-xs text-gray-500">{formatDate(document.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Métadonnées */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Métadonnées</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText size={16} className="inline mr-1" />
                  Nom du fichier
                </label>
                <p className="text-sm text-gray-900 break-all">{document.fileName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash size={16} className="inline mr-1" />
                  Taille
                </label>
                <p className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de fichier
                </label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMimeTypeCategoryDisplay(document.mimeType)}`}>
                  {getMimeTypeCategory(document.mimeType)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={16} className="inline mr-1" />
                  Propriétaire
                </label>
                <p className="text-sm text-gray-900">{document.user.name}</p>
                <p className="text-xs text-gray-500">{document.user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={16} className="inline mr-1" />
                  Créé le
                </label>
                <p className="text-sm text-gray-900">{formatDate(document.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <p className="text-sm text-gray-900">v{document.version}</p>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={document.isPublic}
                    disabled={!isEditing}
                    onChange={(e) => isEditing && setEditData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Document public</span>
                </label>
              </div>
            </div>
          </div>

          {/* Étiquettes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <Tag size={16} className="inline mr-1" />
              Étiquettes
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addLabel((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                    placeholder="Ajouter une étiquette..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editData.labels || document.labels).map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {label}
                      <button
                        onClick={() => removeLabel(label)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {document.labels.length > 0 ? (
                  document.labels.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Aucune étiquette</p>
                )}
              </div>
            )}
          </div>

          {/* Attachements */}
          {document.attachedTo && document.attachedId && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attaché à</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{document.attachedTo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900 font-mono">{document.attachedId}</p>
                </div>
                <button className="mt-2 text-sm text-[#008751] hover:text-[#007043] flex items-center gap-1">
                  <ExternalLink size={14} />
                  Voir l'élément
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={operationsLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {operationsLoading ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}