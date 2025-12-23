'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Image, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { DocumentMetadata } from '@/types/documents';
import { useRouter } from 'next/navigation';

export default function DocumentsUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Partial<DocumentMetadata>>({
    labels: [],
    isPublic: false
  });
  const [labelInput, setLabelInput] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [description, setDescription] = useState('');
  const [attachedTo, setAttachedTo] = useState('');
  const [attachedId, setAttachedId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadProgress, error, uploadDocuments, clearError } = useUploadDocuments();
  const router = useRouter();

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFilesSelected(files);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    // Filtrer les fichiers déjà sélectionnés
    const newFiles = files.filter(file =>
      !selectedFiles.some(selectedFile =>
        selectedFile.name === file.name && selectedFile.size === file.size
      )
    );

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLabel = () => {
    if (labelInput.trim() && !metadata.labels?.includes(labelInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        labels: [...(prev.labels || []), labelInput.trim()]
      }));
      setLabelInput('');
    }
  };

  const removeLabel = (label: string) => {
    setMetadata(prev => ({
      ...prev,
      labels: prev.labels?.filter(l => l !== label) || []
    }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins un fichier');
      return;
    }

    const uploadMetadata = {
      ...metadata,
      description: description || undefined,
      attachedTo: attachedTo || undefined,
      attachedId: attachedId || undefined
    };

    try {
      const results = await uploadDocuments(selectedFiles, uploadMetadata);

      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        setUploadSuccess(true);
        setTimeout(() => {
          router.push('/documents');
        }, 2000);
      }

      if (failedUploads.length > 0) {
        alert(`Échec de l'upload de ${failedUploads.length} fichier(s)`);
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
    }
  };

  const handleCancel = () => {
    router.push('/documents');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="text-blue-500" size={20} />;
    if (file.type === 'application/pdf') return <FileText className="text-red-500" size={20} />;
    return <FileText className="text-gray-500" size={20} />;
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload réussi !</h2>
          <p className="text-gray-600">Redirection vers la liste des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload de Documents</h1>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone d'upload */}
        <div className="lg:col-span-2">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              data-testid="file-input"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"

            />

            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionner des fichiers
              </h3>
              <p className="text-gray-500 mb-4">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#008751] hover:bg-[#007043]">
                Choisir des fichiers
              </span>
            </label>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Fichiers sélectionnés ({selectedFiles.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progrès d'upload */}
          {uploading && uploadProgress.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Progrès d'upload</h3>
              </div>
              <div className="p-4 space-y-3">
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
            </div>
          )}
        </div>

        {/* Métadonnées */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Métadonnées</h3>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="description-textarea"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#008751] focus:border-[#008751]"
                placeholder="Description du document..."

              />
            </div>

            {/* Étiquettes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Étiquettes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                  data-testid="label-input"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="Ajouter une étiquette..."

                />
                <button
                  onClick={addLabel}
                  data-testid="add-label-button"
                  className="px-3 py-2 bg-[#008751] text-white rounded-md hover:bg-[#007043]"
                >
                  <Plus size={16} />
                </button>

              </div>
              {metadata.labels && metadata.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadata.labels.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {label}
                      <button
                        onClick={() => removeLabel(label)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Attachement */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attaché à
              </label>
              <select
                value={attachedTo}
                onChange={(e) => setAttachedTo(e.target.value)}
                data-testid="attached-to-select"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#008751] focus:border-[#008751]"
              >

                <option value="">Sélectionner...</option>
                <option value="vehicle">Véhicule</option>
                <option value="service">Service</option>
                <option value="issue">Problème</option>
                <option value="part">Pièce</option>
                <option value="fuel">Carburant</option>
                <option value="contact">Contact</option>
                <option value="reminder">Rappel</option>
              </select>
            </div>

            {attachedTo && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID de l'élément
                </label>
                <input
                  type="text"
                  value={attachedId}
                  onChange={(e) => setAttachedId(e.target.value)}
                  data-testid="attached-id-input"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="ID de l'élément..."
                />

              </div>
            )}

            {/* Public */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={metadata.isPublic}
                  onChange={(e) => setMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
                <span className="ml-2 text-sm text-gray-700">Document public</span>
              </label>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm text-red-800 underline hover:no-underline"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              data-testid="cancel-button"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              data-testid="upload-button"
              className="flex-1 px-4 py-2 bg-[#008751] text-white rounded-md hover:bg-[#007043] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Upload...' : `Télécharger (${selectedFiles.length})`}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}