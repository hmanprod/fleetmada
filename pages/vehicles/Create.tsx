import React, { useState } from 'react';
import { ArrowLeft, Car, Check } from 'lucide-react';

interface VehicleCreateProps {
  onComplete: () => void;
  onCancel: () => void;
}

const VehicleCreate: React.FC<VehicleCreateProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [vin, setVin] = useState('');

  const renderProgressBar = () => (
    <div className="w-full max-w-md mx-auto mb-8">
       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
         <div 
            className="h-full bg-[#1b9a59] transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 4) * 100}%` }}
         />
       </div>
    </div>
  );

  const Step1Identity = () => (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
            <Car className="text-[#1b9a59]" size={32} />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ajouter un véhicule</h2>
      <p className="text-gray-600 mb-8">
        Les véhicules sont au cœur de FleetMada. Importez les données en quelques secondes.
      </p>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">NIV / N° de Série</label>
        <input 
          type="text" 
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder="Entrez le NIV ou le Numéro de Série"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#1b9a59] focus:border-[#1b9a59]"
        />
        <button 
          className="w-full py-3 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
        >
           <Check size={16} /> Décoder le NIV
        </button>
        
        <button 
          onClick={() => setStep(2)}
          className="text-[#1b9a59] text-sm font-medium hover:underline mt-4 block text-center"
        >
          Ajouter le véhicule manuellement
        </button>
      </div>
    </div>
  );

  const Step2Attributes = () => (
    <div className="max-w-4xl mx-auto flex gap-8">
      <div className="flex-1 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Attributs du véhicule</h2>
         <p className="text-gray-600 mb-6">Donnez un nom à ce véhicule pour référence future et ajoutez des informations de base.</p>

         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
             <input type="text" defaultValue="BT50" className="w-full p-2 border border-gray-300 rounded" />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
             <select className="w-full p-2 border border-gray-300 rounded bg-white">
                <option>Pickup</option>
                <option>Berline</option>
                <option>Fourgon</option>
             </select>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <input type="text" defaultValue="2009" className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input type="text" defaultValue="Mazda" className="w-full p-2 border border-gray-300 rounded" />
              </div>
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
             <input type="text" defaultValue="BT50" className="w-full p-2 border border-gray-300 rounded" />
           </div>

           <button 
            onClick={() => setStep(3)}
            className="w-full mt-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded"
           >
             Ajouter le véhicule à FleetMada
           </button>
         </div>
      </div>

      <div className="w-80 hidden lg:block">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-32 bg-green-200 flex items-center justify-center">
             <Car size={48} className="text-green-700" />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">BT50</h3>
            <div className="space-y-4">
               <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Détails</h4>
                  <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
               </div>
               <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Step3Meter = () => (
     <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrée compteur initiale</h2>
      <p className="text-gray-600 mb-6">
        Les données de compteur à jour sont utilisées pour suivre l'utilisation et déclencher les rappels d'entretien.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valeur compteur</label>
          <div className="relative">
             <input type="number" className="w-full p-2 border border-gray-300 rounded pr-8" placeholder="0" />
             <span className="absolute right-3 top-2 text-gray-500 text-sm">km</span>
          </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
           <input type="date" className="w-full p-2 border border-gray-300 rounded" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      <button 
        onClick={() => setStep(4)}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded"
      >
        Continuer
      </button>
    </div>
  );

    const Step4Maintenance = () => (
     <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Assigner l'entretien préventif</h2>
      <p className="text-gray-600 mb-6">
        Créez des rappels automatiques basés sur l'utilisation ou des intervalles de temps spécifiques.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du programme</label>
        <input type="text" defaultValue="Entretien Véhicule Standard" className="w-full p-2 border border-gray-300 rounded" />
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
             {/* Icon placeholder */}
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              6 Rappels d'entretien seront créés
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded mb-6">
         <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between text-sm font-medium text-gray-600">
            <span>Intervalles</span>
            <span>Tâche d'entretien</span>
         </div>
         <div className="p-3 border-b border-gray-200 flex justify-between text-sm">
            <span className="text-blue-600">Tous les 4 mois ou 5 000 km</span>
            <span>Remplacement huile moteur et filtre</span>
         </div>
         <div className="p-3 flex justify-between text-sm">
            <span className="text-blue-600">Tous les 30 000 km</span>
            <span>Remplacement filtre à air</span>
         </div>
      </div>

      <button 
        onClick={onComplete}
        className="w-full py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded mb-2"
      >
        Assigner l'entretien préventif
      </button>
       <button 
        onClick={onComplete}
        className="w-full py-2 text-[#008751] font-medium rounded hover:bg-green-50"
      >
        Passer pour l'instant
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0fcf6] p-6 pt-12 relative">
      <button 
        onClick={onCancel}
        className="absolute top-6 left-6 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
      >
        <ArrowLeft size={20} className="text-gray-600" />
      </button>

      {renderProgressBar()}

      {step === 1 && <Step1Identity />}
      {step === 2 && <Step2Attributes />}
      {step === 3 && <Step3Meter />}
      {step === 4 && <Step4Maintenance />}
    </div>
  );
};

export default VehicleCreate;