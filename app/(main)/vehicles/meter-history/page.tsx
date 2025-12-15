'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, X, Calendar, AlertCircle } from 'lucide-react';
import { MOCK_VEHICLES, MOCK_METER_ENTRIES, MeterEntry } from '../types';

export default function VehicleMeterPage() {
  const [entries, setEntries] = useState<MeterEntry[]>(MOCK_METER_ENTRIES);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MeterEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MeterEntry>>({
    date: new Date().toISOString().split('T')[0],
    isVoid: false,
    type: 'Primary',
    unit: 'hrs' // Default from screenshot
  });

  const getVehicleName = (id: string) => {
    return MOCK_VEHICLES.find(v => v.id === id)?.name || 'Unknown Vehicle';
  };

  const filteredEntries = entries.filter(entry => {
    const vehicleName = getVehicleName(entry.vehicleId).toLowerCase();
    return vehicleName.includes(searchTerm.toLowerCase());
  });

  const handleSave = () => {
    if (!formData.vehicleId || !formData.date || !formData.value) return;

    if (editingEntry) {
      // Update existing
      setEntries(entries.map(e => e.id === editingEntry.id ? { ...e, ...formData } as MeterEntry : e));
    } else {
      // Create new
      const newEntry: MeterEntry = {
        id: Math.random().toString(36).substr(2, 9),
        vehicleId: formData.vehicleId,
        date: formData.date,
        value: Number(formData.value),
        type: 'Primary',
        unit: 'hr', // Mock unit
        isVoid: formData.isVoid || false,
        source: 'Manual',
        voidStatus: '-',
        autoVoidReason: '-'
      };
      setEntries([newEntry, ...entries]);
    }
    closeModal();
  };

  const openAddModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      isVoid: false,
      type: 'Primary',
      unit: 'hr'
    });
    setEditingEntry(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (entry: MeterEntry) => {
    setFormData({ ...entry });
    setEditingEntry(entry);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingEntry(null);
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Meter History</h1>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={openAddModal}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Meter Reading
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search meter readings..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200 font-medium">
              <th className="p-4 w-8"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Meter Date</th>
              <th className="p-4">Meter Value</th>
              <th className="p-4">Meter Type</th>
              <th className="p-4">Void</th>
              <th className="p-4">Source</th>
              <th className="p-4">Void Status</th>
              <th className="p-4">Auto-Void Reason</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {filteredEntries.map((entry) => (
              <tr
                key={entry.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => openEditModal(entry)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="p-4 font-medium text-[#008751] hover:underline">{getVehicleName(entry.vehicleId)}</td>
                <td className="p-4 text-gray-700 underline decoration-dotted">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="p-4 text-gray-900 font-medium">{entry.value.toLocaleString()} {entry.unit}</td>
                <td className="p-4 text-gray-500">{entry.type}</td>
                <td className="p-4 text-gray-500">{entry.isVoid ? 'Yes' : '—'}</td>
                <td className="p-4 text-[#008751] hover:underline">{entry.source || '—'}</td>
                <td className="p-4 text-gray-400">{entry.voidStatus || '—'}</td>
                <td className="p-4 text-gray-400">{entry.autoVoidReason || '—'}</td>
              </tr>
            ))}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center text-gray-500">
                  No meter readings found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{editingEntry ? 'Edit Meter Entry' : 'Add Meter Entry'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                {editingEntry ? (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded text-sm text-gray-900">
                    <span className="bg-gray-300 text-gray-600 px-1 rounded text-xs">Vehicle</span>
                    {getVehicleName(formData.vehicleId || '')}
                  </div>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                    value={formData.vehicleId || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  >
                    <option value="">Please select</option>
                    {MOCK_VEHICLES.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.vin})</option>
                    ))}
                  </select>
                )}
              </div>

              {editingEntry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <div className="text-[#008751] text-sm font-medium">{formData.source}</div>
                </div>
              )}

              {editingEntry && (
                <div className="bg-blue-50 border border-blue-100 rounded p-4 flex gap-3">
                  <AlertCircle className="text-blue-500 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">As a reference, here are some existing Meter Entries around {new Date(formData.date || '').toDateString()}:</p>
                    <ul className="list-disc pl-4 space-y-1 text-blue-800">
                      <li>Thu, Dec 11, 2025 → 62</li>
                      <li>Fri, Dec 12, 2025 → 70</li>
                    </ul>
                    <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">View all Meter History for this Vehicle</a>
                  </div>
                </div>
              )}

              {/* Meter Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingEntry ? 'Meter Value' : 'Primary Meter'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">hr</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                      checked={formData.isVoid || false}
                      onChange={(e) => setFormData({ ...formData, isVoid: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Void</span>
                  </label>
                </div>
                {!editingEntry && <p className="text-xs text-gray-500 mt-1">Last updated: 80 hr (a day ago)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meter Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={closeModal}
                className={`px-4 py-2 hover:bg-gray-100 rounded font-medium text-gray-700 ${editingEntry ? 'border border-green-600 text-green-700 bg-white hover:bg-green-50' : ''}`}
              >
                {editingEntry ? 'Close' : 'Cancel'}
              </button>
              {!editingEntry && (
                <button
                  className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50"
                >
                  Save and Add Another
                </button>
              )}
              <button
                onClick={handleSave}
                className={`bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm ${editingEntry ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed' : ''}`}
              >
                Save {editingEntry ? '' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}