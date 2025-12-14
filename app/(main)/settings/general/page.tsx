"use client";

import React from 'react';
import { AlignLeft, MoreHorizontal } from 'lucide-react';

export default function GeneralSettings() {
  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres généraux</h1>

      {/* Sample Data Banner */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4">
         <div className="mt-1">
            <AlignLeft className="text-green-600" size={24} />
         </div>
         <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-gray-900">Les données démo sont <span className="text-green-600">ACTIVÉES</span></span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
               Les véhicules et autres enregistrements étiquetés <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">Exemple</span> sont disponibles pour vous aider à explorer le fonctionnement de FleetMada pendant votre essai.
            </p>
            <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium">
               Désactiver les données démo
            </button>
         </div>
      </div>

      {/* General Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Général</h2>
         </div>
         <div className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise <span className="text-red-500">*</span></label>
               <div className="relative">
                   <input type="text" defaultValue="ONNO" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                   <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
               </div>
               <p className="mt-1 text-xs text-gray-500">Veuillez fournir le nom légal de votre entreprise.</p>
            </div>
         </div>
      </div>
      
      <div className="flex justify-end">
          <button className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm">Enregistrer le compte</button>
      </div>
    </div>
  );
}