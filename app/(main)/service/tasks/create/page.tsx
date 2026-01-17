'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, Save, X, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceTasks } from '@/lib/hooks/useServiceTasks';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function ServiceTaskCreatePage() {
  const router = useRouter();
  const { toast, toasts, removeToast } = useToast();
  const { createTask, loading } = useServiceTasks({ enabled: false });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryCode: '',
    systemCode: '',
    assemblyCode: '',
    reasonForRepairCode: '',
    subtasks: '' // Note: subtasks are not yet supported by the backend
  });

  const handleBack = () => {
    router.push('/service/tasks');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      const result = await createTask({
        name: formData.name,
        description: formData.description || undefined,
        categoryCode: formData.categoryCode || undefined,
        systemCode: formData.systemCode || undefined,
        assemblyCode: formData.assemblyCode || undefined,
        reasonForRepairCode: formData.reasonForRepairCode || undefined,
      });

      if (result) {
        toast.success('Succès', 'La tâche de service a été créée avec succès.');
        setTimeout(() => {
          router.push('/service/tasks');
        }, 1500);
      } else {
        toast.error('Erreur', 'Impossible de créer la tâche de service.');
      }
    } catch (error) {
      toast.error('Erreur', 'Une erreur est survenue lors de la création.');
    }
  };

  const handleCancel = () => {
    router.push('/service/tasks');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStep1Valid = formData.name.trim() !== '';

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 font-medium">
              <span>Maintenance</span>
              <span className="text-gray-300">/</span>
              <span>Tâches de Service</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle Tâche de Service</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            data-testid="cancel-button"
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 border border-gray-300 rounded bg-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            data-testid="save-button"
            disabled={!isStep1Valid || loading}
            className={`px-4 py-2 font-bold rounded shadow-sm flex items-center gap-2 transition-all ${isStep1Valid && !loading
              ? 'bg-[#008751] hover:bg-[#007043] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
          <Info className="flex-shrink-0" size={20} />
          <p className="text-sm">
            Les tâches de service personnalisées vous permettent de suivre des maintenances spécifiques à votre flotte qui ne sont pas couvertes par les tâches standards.
          </p>
        </div>

        {/* Step 1: Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
            <div className="h-6 w-6 rounded-full bg-[#008751] text-white flex items-center justify-center text-sm font-bold shadow-sm">1</div>
            <h2 className="text-lg font-bold text-gray-900">Détails de la tâche</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-1">Nom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ex: Révision des 10 000 km"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  data-testid="task-name"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Décrivez les étapes ou les précautions pour cette tâche..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Catégorie</label>
                <input
                  type="text"
                  placeholder="Ex: MNT (Maintenance)"
                  value={formData.categoryCode}
                  onChange={(e) => handleInputChange('categoryCode', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Système</label>
                <input
                  type="text"
                  placeholder="Ex: 01 (Moteur)"
                  value={formData.systemCode}
                  onChange={(e) => handleInputChange('systemCode', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Assemblage</label>
                <input
                  type="text"
                  placeholder="Ex: 001 (Injection)"
                  value={formData.assemblyCode}
                  onChange={(e) => handleInputChange('assemblyCode', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Raison de Réparation</label>
                <input
                  type="text"
                  placeholder="Ex: 01 (Maintenance)"
                  value={formData.reasonForRepairCode}
                  onChange={(e) => handleInputChange('reasonForRepairCode', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-tâches (Optionnel)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.subtasks}
                    disabled
                    onChange={(e) => handleInputChange('subtasks', e.target.value)}
                    placeholder="Bientôt disponible"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Footer */}
        {/* <div className="bg-gray-100 rounded-lg p-6 text-center shadow-inner">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            Besoin d'aide pour configurer vos tâches de service ?
            <button className="text-[#008751] font-bold flex items-center gap-1 hover:underline">
              Consulter la documentation
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          </p>
        </div> */}
      </div>
    </div>
  );
}