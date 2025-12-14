import React, { useState } from 'react';
import { Search, Filter, Plus, ChevronRight, X, ChevronLeft } from 'lucide-react';

const Assignments: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const mockVehicles = [
    { id: 'AB103', name: 'AB103', type: 'Bobcat', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?truck,construction&sig=1' },
    { id: 'AB104', name: 'AB104', type: 'Bobcat', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?truck,construction&sig=2' },
    { id: 'AC101', name: 'AC101', type: 'Voiture', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?car&sig=3' },
    { id: 'AG102', name: 'AG102', type: 'Voiturette', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?golfcart&sig=4' },
    { id: 'AG103', name: 'AG103', type: 'Voiturette', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?golfcart&sig=5' },
    { id: 'AM101', name: 'AM101', type: 'Tondeuse', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?mower&sig=6' },
    { id: 'AP101', name: 'AP101', type: 'Pickup', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?truck&sig=7' },
    { id: 'AS101', name: 'AS101', type: 'Nacelle', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?construction&sig=8' },
    { id: 'AT101', name: 'AT101', type: 'Remorque', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?trailer&sig=9' },
    { id: 'AV101', name: 'AV101', type: 'Fourgon', location: 'Atlanta', status: 'Actif', image: 'https://source.unsplash.com/random/50x50/?van&sig=10' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f9fafb]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-bold text-gray-900">Affectations de Véhicules</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2 flex items-center gap-1">
             <span className="text-yellow-500">💡</span> Aide
           </button>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={20} /> Nouvelle Affectation
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Rechercher" className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm w-64 focus:ring-[#008751] focus:border-[#008751]" />
             </div>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
               <Filter size={16} /> Filtres
             </button>
         </div>
         <div className="flex items-center gap-3">
             <div className="flex items-center text-gray-900 font-medium text-lg">
                 <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={20}/></button>
                 <span className="mx-2">14 Décembre 2025</span>
                 <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={20}/></button>
             </div>
             <div className="flex bg-gray-100 rounded p-0.5 border border-gray-200">
                 <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded">Auj.</button>
                 <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm text-gray-900 rounded">Jour</button>
             </div>
             <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-green-700 bg-green-50">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
             </button>
         </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Vehicles */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Véhicule <ChevronRight size={16} className="inline rotate-90"/></span>
                  <button className="p-1 hover:bg-gray-100 rounded border border-gray-200"><span className="text-xs font-bold text-gray-500">A-Z</span></button>
              </div>
              {mockVehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 h-16">
                      <img src={vehicle.image} className="w-10 h-10 rounded object-cover" alt="" />
                      <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-sm truncate">{vehicle.name}</div>
                          <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                              {vehicle.status} · {vehicle.type} · {vehicle.location}
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Right Column - Timeline Grid */}
          <div className="flex-1 bg-white flex flex-col overflow-x-auto overflow-y-hidden">
              {/* Header Row */}
              <div className="flex border-b border-gray-200 h-14 bg-white shrink-0 sticky top-0 z-10 min-w-max">
                  {/* Mocking the day/hour columns roughly */}
                  {['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((time) => (
                      <div key={time} className="w-48 border-r border-gray-100 px-2 py-3 text-xs text-gray-500 font-medium text-center">
                          {time}
                      </div>
                  ))}
                  <div className="w-64 border-l border-gray-200 bg-white flex flex-col sticky right-0">
                      <div className="flex justify-between items-center px-2 py-1 border-b border-gray-100">
                          <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={12}/></button>
                          <span className="text-xs font-bold">Décembre</span>
                          <span className="text-xs border border-gray-200 rounded px-1">2025</span>
                          <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={12}/></button>
                      </div>
                      <div className="grid grid-cols-7 gap-0 text-[10px] text-center p-1">
                          <span className="text-gray-400">Dim</span>
                          <span className="text-gray-400">Lun</span>
                          <span className="text-gray-400">Mar</span>
                          <span className="text-gray-400">Mer</span>
                          <span className="text-gray-400">Jeu</span>
                          <span className="text-gray-400">Ven</span>
                          <span className="text-gray-400">Sam</span>
                          {/* Calendar Days Mockup */}
                          {[30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(d => (
                              <span key={d} className="py-0.5">{d}</span>
                          ))}
                          <span className="bg-orange-100 text-orange-800 rounded font-bold py-0.5">14</span>
                          {[15, 16, 17, 18, 19, 20].map(d => (
                              <span key={d} className="py-0.5">{d}</span>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Grid Body */}
              <div className="flex-1 overflow-y-auto min-w-max relative">
                  {/* Current Time Indicator Line */}
                  <div className="absolute top-0 bottom-0 left-48 border-r-2 border-red-400 z-10 pointer-events-none">
                      <div className="w-2 h-2 bg-red-400 rounded-full -ml-[5px] -mt-1"></div>
                  </div>

                  {mockVehicles.map(vehicle => (
                      <div key={vehicle.id} className="flex h-16 border-b border-gray-100 relative group hover:bg-gray-50">
                          {/* Grid Lines */}
                          {Array.from({length: 8}).map((_, i) => (
                              <div key={i} className="w-48 border-r border-gray-100 h-full shrink-0"></div>
                          ))}
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Ajouter une affectation</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Véhicule assigné <span className="text-red-500">*</span></label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                            <option>Veuillez sélectionner</option>
                            {mockVehicles.map(v => <option key={v.id} value={v.id}>{v.name} - {v.type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Opérateur <span className="text-red-500">*</span></label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                            <option>Veuillez sélectionner</option>
                            <option>Hery RABOTOVAO</option>
                            <option>Allison Curtis</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date/Heure de début</label>
                        <div className="flex gap-2">
                            <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                            <input type="time" defaultValue="16:38" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Quand l'affectation commence. Laissez vide si l'affectation a toujours existé.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date/Heure de fin</label>
                        <div className="flex gap-2">
                            <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                            <input type="time" defaultValue="16:38" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Quand cette affectation se termine-t-elle ? Peut être passée ou future.</p>
                    </div>
                    <div>
                        <textarea placeholder="Ajouter un commentaire optionnel" className="w-full p-2.5 border border-gray-300 rounded-md h-24 focus:ring-[#008751] focus:border-[#008751]"></textarea>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                    <button onClick={() => setShowAddModal(false)} className="text-[#008751] font-medium hover:underline">Annuler</button>
                    <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 text-gray-400 font-bold rounded cursor-not-allowed">Enregistrer</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;