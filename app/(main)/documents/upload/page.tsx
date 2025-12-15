'use client';

import React, { useState } from 'react';
import { X, Search, Camera, Link, Image as ImageIcon, Github, Facebook, Instagram, Box, Monitor } from 'lucide-react';

interface DocumentUploadProps {
  onCancel: () => void;
}

export default function DocumentsUploadPage() {
  const [dragActive, setDragActive] = useState(false);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("Files dropped:", e.dataTransfer.files);
      // TODO: Handle file upload
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log("Files selected:", e.target.files);
      // TODO: Handle file upload
    }
  };

  const handleCancel = () => {
    console.log('Cancel upload');
    // TODO: Implement navigation back or modal close
  };

  const SourceButton = ({ icon: Icon, label, bgColor, borderColor, imageSrc }: {
    icon?: any;
    label: string;
    bgColor: string;
    borderColor?: string;
    imageSrc?: string;
  }) => (
    <button className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
      <div className={`w-8 h-8 ${bgColor} ${borderColor ? `border ${borderColor}` : ''} rounded-full flex items-center justify-center text-white`}>
        {imageSrc ? (
          <img src={imageSrc} alt={label} className="w-5 h-5" />
        ) : (
          <Icon size={16} />
        )}
      </div>
      {label}
    </button>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upload de Documents</h1>
        <button 
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 text-[#008751] font-medium">
              <Monitor size={20} /> Mon Appareil
            </div>
            <div className="overflow-y-auto flex-1">
              <SourceButton 
                icon={Facebook} 
                label="Facebook" 
                bgColor="bg-blue-600" 
              />
              <SourceButton 
                icon={Github} 
                label="Github" 
                bgColor="bg-black" 
              />
              <SourceButton 
                icon={Search} 
                label="Recherche Web" 
                bgColor="bg-gray-200" 
                borderColor="border-gray-300"
              />
              <SourceButton 
                icon={Link} 
                label="Lien (URL)" 
                bgColor="bg-gray-200" 
                borderColor="border-gray-300"
              />
              <SourceButton 
                icon={Camera} 
                label="Prendre une Photo" 
                bgColor="bg-gray-200" 
                borderColor="border-gray-300"
              />
              <SourceButton 
                label="Google Drive" 
                bgColor="bg-white" 
                borderColor="border-gray-300"
                imageSrc="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
              />
              <SourceButton 
                icon={Instagram} 
                label="Instagram" 
                bgColor="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" 
              />
              <SourceButton 
                label="Google Photos" 
                bgColor="bg-white" 
                borderColor="border-gray-300"
                imageSrc="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_Photos_icon.svg"
              />
              <SourceButton 
                icon={Box} 
                label="Box" 
                bgColor="bg-[#0061d5]" 
              />
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-[#f5f5f5] relative">
            <div 
              className={`flex items-center justify-center flex-1 p-8 ${
                dragActive ? 'bg-blue-50 border-2 border-blue-300' : ''
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
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              
              <label 
                htmlFor="file-upload" 
                className={`w-[80%] h-[80%] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-8 bg-[#f5f5f5] hover:bg-gray-50 transition-colors cursor-pointer ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="w-20 h-24 bg-gray-300 rounded-lg mb-6 flex items-center justify-center relative">
                  <div className="absolute -top-2 -right-2 bg-gray-100 w-6 h-6 transform rotate-45"></div>
                  <span className="text-white text-4xl font-light">+</span>
                </div>
                <h2 className="text-2xl text-gray-700 font-normal mb-2">Sélectionner des Fichiers à Télécharger</h2>
                <p className="text-gray-400 mb-4">ou Glisser-déposer, Copier-coller des Fichiers</p>
                <span className="text-sm text-[#008751] font-medium">Cliquez pour sélectionner des fichiers</span>
              </label>
            </div>

            {/* File preview area could go here */}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button 
          className="px-6 py-2 bg-[#008751] text-white rounded-md hover:bg-[#007043] transition-colors"
          disabled
        >
          Télécharger (0)
        </button>
      </div>
    </div>
  );
}