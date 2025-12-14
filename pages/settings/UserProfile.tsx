import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const UserProfile: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-bold text-gray-900 mb-2">Photo</label>
               <div className="flex items-center gap-2">
                  <button className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-medium px-4 py-2 rounded">Choisir un fichier</button>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded border border-gray-300 border-dashed">Ou glisser un fichier ici</button>
               </div>
               <p className="mt-2 text-sm text-gray-500 italic">Aucun fichier sélectionné</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
               <div className="relative">
                   <input type="text" defaultValue="Hery" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                   <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
               <input type="text" defaultValue="RABOTOVAO" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
               <input type="email" defaultValue="hmanprod@gmail.com" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
               <p className="mt-1 text-xs text-gray-500">C'est ici que vous recevrez les emails de notification pour votre compte actuel</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionnez comment vous souhaitez voir les valeurs d'économie de carburant dans FleetMada. <span className="text-red-500">*</span></label>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input type="radio" name="economy" className="text-[#008751] focus:ring-[#008751]" />
                     <span className="text-sm text-gray-700">mpg (US) · g/hr (US) · Gallons (US)</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input type="radio" name="economy" className="text-[#008751] focus:ring-[#008751]" />
                     <span className="text-sm text-gray-700">mpg (UK) · g/hr (UK) · Gallons (UK)</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input type="radio" name="economy" className="text-[#008751] focus:ring-[#008751]" defaultChecked />
                     <span className="text-sm text-gray-700">L/100km · L/100hr · Litres</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input type="radio" name="economy" className="text-[#008751] focus:ring-[#008751]" />
                     <span className="text-sm text-gray-700">km/L · L/hr · Litres</span>
                  </label>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Éléments par page <span className="text-red-500">*</span></label>
               <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                  <option>50</option>
               </select>
               <p className="mt-1 text-xs text-gray-500">Nombre d'éléments par défaut sur les listes et rapports.</p>
            </div>
         </div>
      </div>

      <div className="flex justify-end">
          <button className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm">Enregistrer</button>
      </div>
    </div>
  );
};

export default UserProfile;