'use client';

import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function ServiceProgramCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [primaryMeter, setPrimaryMeter] = useState('Kilometers');
  const [secondaryMeter, setSecondaryMeter] = useState(false);
  const [template, setTemplate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/service/programs');
  };

  const handleSave = async () => {
    if (!name) {
      setError('Le nom est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/service/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name,
          frequency: '10000 km', // Default frequency as it's required by API
          description: `Modèle : ${template}`,
          active: true,
          tasks: [] // Could be extended to select tasks
        })
      });


      const result = await response.json();

      if (result.success) {
        router.push('/service/programs');
      } else {
        setError(result.error || 'Échec de l’enregistrement du programme');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l’enregistrement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/service/programs');
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <span className="hover:underline cursor-pointer" onClick={handleBack}>Programmes d'entretien</span> <span className="text-gray-300">/</span> Nouveau
          </div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-gray-900">Nouveau programme d'entretien</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCancel} data-testid="cancel-button" className="px-4 py-2 text-[#008751] font-medium hover:underline" disabled={loading}>Annuler</button>
          <button
            onClick={handleSave}
            data-testid="save-button"
            className={`px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : "Enregistrer le programme"}
          </button>
        </div>

      </div>

      <div className="max-w-3xl mx-auto py-8 px-4">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Nom <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="program-name"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              data-testid="program-template"
              className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
            >
              <option value="">Veuillez sélectionner</option>
              <option value="basic">Entretien véhicule (basique)</option>
              <option value="heavy">Service intensif</option>
              <option value="custom">Modèle personnalisé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <div className="flex items-center gap-2">
              <button className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-bold px-4 py-2.5 rounded">Choisir un fichier</button>
              <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded border border-gray-300 border-dashed">Ou glisser un fichier ici</button>
            </div>
            <p className="mt-2 text-sm text-gray-500 italic">Aucun fichier sélectionné</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">
              Compteur principal <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">Choisissez comment mesurer l'utilisation pour ce programme d'entretien.</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryMeter"
                  checked={primaryMeter === 'Miles'}
                  onChange={() => setPrimaryMeter('Miles')}
                  data-testid="primary-meter-miles"
                  className="text-[#008751] focus:ring-[#008751] w-4 h-4 border-gray-300"
                />
                <span className="text-sm text-gray-900 font-medium">Miles</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryMeter"
                  checked={primaryMeter === 'Kilometers'}
                  onChange={() => setPrimaryMeter('Kilometers')}
                  className="text-[#008751] focus:ring-[#008751] w-4 h-4 border-gray-300"
                />
                <span className="text-sm text-gray-900 font-medium">Kilomètres</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryMeter"
                  checked={primaryMeter === 'Hours'}
                  onChange={() => setPrimaryMeter('Hours')}
                  className="text-[#008751] focus:ring-[#008751] w-4 h-4 border-gray-300"
                />
                <span className="text-sm text-gray-900 font-medium">Heures</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-start gap-4">
              <div className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  id="secondaryMeter"
                  checked={secondaryMeter}
                  onChange={(e) => setSecondaryMeter(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]"></div>
              </div>
              <div>
                <label htmlFor="secondaryMeter" className="block text-sm font-bold text-gray-900 mb-1 cursor-pointer">Compteur secondaire</label>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Activez cette option pour utiliser un compteur supplémentaire sur ce programme d'entretien. Utile pour suivre l'entretien lié aux heures moteur ou à des équipements attachés (bétonnière, remorque, etc.).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={handleCancel} className="text-[#008751] font-medium hover:underline" disabled={loading}>Annuler</button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : "Enregistrer le programme"}
          </button>
        </div>

      </div>
    </div>
  );
}
