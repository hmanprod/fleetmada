"use client";

import React, { useState } from 'react';
import { LayoutList, Search, Filter, Plus, Car, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MOCK_VEHICLES, Vehicle } from '../types';

export default function VehicleList() {
  const router = useRouter();
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Véhicules</h1>
        <button
          onClick={() => router.push('/vehicles/create')}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={20} /> Ajouter un véhicule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom ou VIN..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008751] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
            <Filter size={18} /> Filtres
          </button>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <LayoutList size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun véhicule trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium">Nom / VIN</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Statut</th>
                  <th className="p-4 font-medium">Opérateur</th>
                  <th className="p-4 font-medium">Compteur</th>
                  <th className="p-4 font-medium">Groupe</th>
                  <th className="p-4 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                          <Car size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{vehicle.name}</div>
                          <div className="text-xs text-gray-500">{vehicle.vin}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{vehicle.type}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'In Shop' ? 'bg-yellow-100 text-yellow-800' :
                            vehicle.status === 'Out of Service' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      {vehicle.operator ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {vehicle.operator.charAt(0)}
                          </div>
                          {vehicle.operator}
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-4 text-gray-700">
                      {vehicle.currentMeter?.toLocaleString()} {vehicle.primaryMeter}
                    </td>
                    <td className="p-4 text-gray-700">
                      {vehicle.group || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-4 text-gray-400">
                      <button className="p-1 hover:bg-gray-200 rounded" onClick={(e) => { e.stopPropagation(); /* Menu logic */ }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}