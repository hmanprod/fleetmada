import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const LoginPassword: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Identifiant & Mot de passe</h1>

      <div className="flex gap-4 border-b border-gray-200">
         <button className="px-4 py-2 bg-[#008751] text-white text-sm font-medium rounded-t-md">Informations de connexion</button>
         <button className="px-4 py-2 text-[#008751] text-sm font-medium hover:bg-green-50 rounded-t-md">Changer le mot de passe</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur <span className="text-red-500">*</span></label>
               <div className="relative">
                   <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                   <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
               </div>
               <p className="mt-1 text-xs text-gray-500">Vous pouvez vous connecter à FleetMada avec votre nom d'utilisateur ou votre email.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
               <div className="relative">
                   <input type="email" defaultValue="hmanprod@gmail.com" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                   <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
               </div>
            </div>

            <div className="flex items-start gap-3">
               <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" defaultChecked />
               <span className="text-sm text-gray-700">M'envoyer des emails marketing à propos de FleetMada</span>
            </div>

            <div>
               <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow-sm">Déconnecter votre compte Google</button>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
               <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                  <option>(GMT+03:00) Antananarivo</option>
               </select>
               <p className="mt-1 text-xs text-gray-500">Fuseau horaire préféré pour l'affichage des dates et heures.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
               <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                  <option>Français</option>
                  <option>English</option>
               </select>
            </div>
         </div>
      </div>

      <div className="flex justify-end">
          <button className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm">Enregistrer</button>
      </div>
    </div>
  );
};

export default LoginPassword;