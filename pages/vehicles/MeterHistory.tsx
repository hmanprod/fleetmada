import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, ChevronRight, Settings, Plus, X } from 'lucide-react';
import { MeterEntry } from '../../types';

const mockMeterHistory: MeterEntry[] = [
  { id: 1, vehicle: 'BT50', date: '13/12/2025', value: 120000, type: 'Primary', source: 'Manuel', void: false },
  { id: 2, vehicle: 'HC101', date: '13/12/2025', value: 80116, type: 'Primary', source: 'Samsara', void: false },
  { id: 3, vehicle: 'AC101', date: '13/12/2025', value: 79247, type: 'Primary', source: 'Samsara', void: false },
  { id: 4, vehicle: 'AC101', date: '13/12/2025', value: 75200, type: 'Primary', source: 'Entrée carburant #195960788', void: false },
  { id: 5, vehicle: 'HC101', date: '13/12/2025', value: 75200, type: 'Primary', source: 'Entrée carburant #195960884', void: false },
  { id: 6, vehicle: 'RP101', date: '13/12/2025', value: 57622, type: 'Primary', source: 'Geotab', void: false },
  { id: 7, vehicle: 'AP101', date: '13/12/2025', value: 56287, type: 'Primary', source: 'Geotab', void: false },
  { id: 8, vehicle: 'RP101', date: '13/12/2025', value: 56287, type: 'Primary', source: 'Geotab', void: false },
  { id: 9, vehicle: 'AP101', date: '13/12/2025', value: 56287, type: 'Primary', source: 'Geotab', void: false },
  { id: 10, vehicle: 'HV101', date: '13/12/2025', value: 56287, type: 'Primary', source: 'Geotab', void: false },
  { id: 11, vehicle: 'AV101', date: '13/12/2025', value: 45225, type: 'Primary', source: 'Entrée carburant #195960836', void: false },
  { id: 12, vehicle: 'BS101', date: '13/12/2025', value: 4043, type: 'Primary', source: 'Geotab', void: false },
];

const MeterHistory: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MeterEntry | null>(null);

  const handleEdit = (entry: MeterEntry) => {
      setSelectedEntry(entry);
      setShowEditModal(true);
  }

  const Modal = ({ title, onClose, isEdit }: { title: string, onClose: () => void, isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            
            {isEdit && selectedEntry && (
                <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Pour référence, voici quelques entrées existantes autour du Sam 13 Déc 2025 :</p>
                        <p className="ml-2">Jeu 11 Déc 2025 → <strong>62</strong></p>
                        <p className="ml-2">Ven 12 Déc 2025 → <strong>70</strong></p>
                        <button className="text-[#008751] hover:underline mt-1 font-medium">Voir tout l'historique</button>
                    </div>
                </div>
            )}

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
                    {isEdit ? (
                        <div className="flex items-center gap-2">
                            <span className="bg-gray-400 text-white text-xs font-bold px-1 rounded uppercase w-8 h-6 flex items-center justify-center">GOL</span>
                            <span className="text-[#008751] font-bold">AG103</span>
                            <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">Exemple</span>
                        </div>
                    ) : (
                        <div className="relative">
                            <input type="text" defaultValue="AB103" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                            <div className="absolute right-3 top-3 text-gray-400"><X size={16}/></div>
                        </div>
                    )}
                </div>

                {isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <div className="text-[#008751]">Entrée carburant #195960968</div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'Valeur compteur' : 'Compteur principal'} {isEdit && <span className="text-red-500">*</span>}</label>
                    <div className="relative">
                        <input type="number" defaultValue={isEdit ? 78.0 : ''} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                        {!isEdit && <span className="absolute right-12 top-3 text-gray-500 text-sm">hr</span>}
                        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                             {!isEdit && (
                                <div className="flex items-center gap-2 border-l pl-3 ml-2 border-gray-300 h-6">
                                    <input type="checkbox" id="void" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
                                    <label htmlFor="void" className="text-sm text-gray-700 cursor-pointer">Annuler</label>
                                </div>
                             )}
                             {isEdit && (
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="void" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
                                    <label htmlFor="void" className="text-sm text-gray-700 cursor-pointer decoration-dotted underline">Annuler</label>
                                </div>
                             )}
                        </div>
                    </div>
                    {!isEdit && <p className="text-xs text-gray-500 mt-1">Dernière maj : 80 hr (il y a un jour)</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date compteur {isEdit && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}</label>
                    <div className="relative">
                        <input type="date" defaultValue={isEdit ? "2025-12-13" : "2025-12-14"} className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} disabled={isEdit} />
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                <button onClick={onClose} className={`text-[#008751] font-medium hover:underline ${isEdit ? 'px-4 py-2 border border-[#008751] rounded bg-white' : ''}`}>{isEdit ? 'Fermer' : 'Annuler'}</button>
                {!isEdit && <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Enregistrer et ajouter</button>}
                <button onClick={onClose} className={`px-4 py-2 bg-${isEdit ? 'gray-200 text-gray-400' : '[#008751] text-white'} font-bold rounded shadow-sm`}>{isEdit ? 'Enregistrer' : 'Enregistrer'}</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {showAddModal && <Modal title="Ajouter une entrée compteur" onClose={() => setShowAddModal(false)} />}
      {showEditModal && <Modal title="Modifier l'entrée compteur" onClose={() => setShowEditModal(false)} isEdit />}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Historique Compteur</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2 flex items-center gap-1">
             <span className="text-yellow-500">💡</span> Aide
           </button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Ajouter entrée
           </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Rechercher" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         {['Date', 'Véhicule', 'Type', 'Statut'].map((filter) => (
             <button key={filter} className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               {filter} <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
             </button>
         ))}
         <button className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2">
           <span className="bg-green-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">1</span> Filtres
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 50 sur 502
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
         <button className="bg-white border border-gray-300 px-2 py-1.5 rounded text-gray-700 hover:bg-gray-50">
             <Settings size={16} />
         </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white">
            <tr>
              <th className="w-8 px-6 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date ▼</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Annulé</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Statut Annulation</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Raison Auto-Annulation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockMeterHistory.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEdit(entry)}>
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <span className="bg-gray-400 text-white text-xs font-bold px-1 rounded uppercase w-8 h-6 flex items-center justify-center">{entry.vehicle.substring(0,3)}</span>
                      <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">{entry.vehicle}</div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Exemple</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 underline decoration-dotted underline-offset-4">
                   {entry.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                   <div>{entry.value.toLocaleString()} km</div>
                   {entry.value > 100000 && <div className="text-xs text-gray-500">Odomètre actuel</div>}
                   {entry.value < 100000 && entry.value > 1000 && <div className="text-xs text-gray-500">il y a 4,916 km</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                   {entry.type === 'Primary' ? 'Principal' : 'Secondaire'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                   —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#008751] hover:underline">
                   {entry.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                   —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                   —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeterHistory;