'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, MoreHorizontal, X,
  Calendar, AlertCircle, Trash2, History, Ban, Edit2,
  Loader2, ChevronLeft, ChevronRight, Car
} from 'lucide-react';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { type MeterEntry, type Vehicle } from '../types';
import { type MeterEntriesQuery } from '@/lib/validations/vehicle-validations';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { type FilterCriterion } from '../components/filters/FilterCard';
import { METER_HISTORY_FIELDS } from '../components/filters/filter-definitions';

export default function VehicleMeterPage() {
  const { token } = useAuthToken();
  const [entries, setEntries] = useState<(MeterEntry & { vehicle?: any })[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [filters, setFilters] = useState<MeterEntriesQuery>({
    page: 1,
    limit: 50,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MeterEntry | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<MeterEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MeterEntry>>({
    date: new Date().toISOString().split('T')[0],
    isVoid: false,
    type: 'Primary',
    unit: 'mi'
  });

  const fetchData = async (currentFilters: MeterEntriesQuery) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const [entriesRes, vehiclesRes] = await Promise.all([
        fetch(`/api/meter-entries?${params.toString()}`, { headers }),
        fetch('/api/vehicles?limit=500', { headers })
      ]);

      const entriesData = await entriesRes.json();
      const vehiclesData = await vehiclesRes.json();

      if (entriesData.success) {
        setEntries(entriesData.data.meterEntries);
      }
      if (vehiclesData.success) {
        setVehicles(vehiclesData.data.vehicles);
      }
    } catch (err) {
      console.error('Error fetching meter data:', err);
      setError('Failed to load meter history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(filters);
    }
  }, [token, filters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);

    // Convert criteria to query parameters
    const newFilters: any = {};

    criteria.forEach(c => {
      const key = c.field;
      const value = c.value;
      const operator = c.operator;

      if (operator === 'between') {
        if (value.from) newFilters[`${key}_gte`] = value.from;
        if (value.to) newFilters[`${key}_lte`] = value.to;
      } else if (operator === 'is' || operator === 'contains') {
        newFilters[key] = value;
      } else if (operator === 'is_any_of') {
        newFilters[key] = Array.isArray(value) ? value.join(',') : value;
      } else {
        // Handle other operators as needed, potentially by passing operator suffix
        newFilters[`${key}_${operator}`] = value;
      }
    });

    setFilters(prev => ({
      ...prev,
      // Reset common filters that might have been cleared
      type: newFilters.type,
      void: newFilters.void,
      ...newFilters,
      page: 1
    }));
    setIsFiltersSidebarOpen(false);
  };

  const getVehicleName = (id: string, vehicleData?: any) => {
    if (vehicleData?.name) return vehicleData.name;
    return vehicles.find(v => v.id === id)?.name || 'Unknown Vehicle';
  };

  const handleSave = async () => {
    if (!formData.vehicleId || !formData.date || formData.value === undefined || formData.value === null || !token) return;

    setIsSaving(true);
    setError(null);
    try {
      const method = editingEntry ? 'PUT' : 'POST';
      const url = editingEntry
        ? `/api/vehicles/${formData.vehicleId}/meter-entries/${editingEntry.id}`
        : `/api/vehicles/${formData.vehicleId}/meter-entries`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          void: formData.isVoid, // Map isVoid to void for the API
          date: new Date(formData.date || '').toISOString(),
          value: Number(formData.value),
          type: 'MILEAGE'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchData(filters);
        closeModal();
      } else {
        setError(data.error || 'Failed to save meter entry');
      }
    } catch (err) {
      console.error('Error saving meter entry:', err);
      setError('Failed to save meter entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoid = async (entry: any) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/vehicles/${entry.vehicleId}/meter-entries/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          void: !entry.isVoid
        })
      });

      if (response.ok) {
        fetchData(filters);
      }
    } catch (err) {
      console.error('Error voiding entry:', err);
    }
    setActiveMenu(null);
  };

  const handleDelete = async (entryId: string) => {
    if (!token) return;
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    try {
      const response = await fetch(`/api/vehicles/${entry.vehicleId}/meter-entries/${entryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData(filters);
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
    setIsDeleteConfirmOpen(null);
    setActiveMenu(null);
  };

  const openAddModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      isVoid: false,
      type: 'Primary',
      unit: 'hrs'
    });
    setEditingEntry(null);
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (entry: MeterEntry) => {
    setFormData({
      ...entry,
      date: new Date(entry.date).toISOString().split('T')[0]
    });
    setEditingEntry(entry);
    setError(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingEntry(null);
    setError(null);
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
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFiltersSidebarOpen(true)}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-[#008751]" size={32} />
          </div>
        )}
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
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {entries.length > 0 ? entries.map((entry) => (
              <tr
                key={entry.id}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${entry.isVoid ? 'opacity-60 bg-gray-50' : ''}`}
                onClick={() => openEditModal(entry)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className={`p-4 font-medium text-[#008751] hover:underline ${entry.isVoid ? 'line-through text-gray-400' : ''}`}>
                  {getVehicleName(entry.vehicleId, entry.vehicle)}
                </td>
                <td className={`p-4 text-gray-700 underline decoration-dotted ${entry.isVoid ? 'line-through' : ''}`}>
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className={`p-4 text-gray-900 font-medium ${entry.isVoid ? 'line-through' : ''}`}>
                  {entry.value.toLocaleString()} {entry.unit || 'hrs'}
                </td>
                <td className="p-4 text-gray-500">{entry.type}</td>
                <td className="p-4 text-gray-500">
                  {entry.isVoid ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Void
                    </span>
                  ) : '—'}
                </td>
                <td className="p-4 text-[#008751] hover:underline">{entry.source || 'Manual'}</td>
                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === entry.id ? null : entry.id)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenu === entry.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 text-left">
                        <button
                          onClick={() => openEditModal(entry)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 size={14} className="mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleVoid(entry)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Ban size={14} className="mr-2" /> {entry.isVoid ? 'Unvoid' : 'Void'}
                        </button>
                        <button
                          onClick={() => setIsHistoryModalOpen(entry)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <History size={14} className="mr-2" /> View record history
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => setIsDeleteConfirmOpen(entry.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : !isLoading && (
              <tr>
                <td colSpan={10} className="p-12 text-center text-gray-500">
                  No meter readings found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>Showing {entries.length} entries</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
        </div>
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
                    <Car size={16} className="text-gray-400" />
                    {getVehicleName(formData.vehicleId || '')}
                  </div>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                    value={formData.vehicleId || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  >
                    <option value="">Please select</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.vin})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Meter Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meter Value <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{formData.unit || 'hrs'}</span>
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
                className="px-4 py-2 hover:bg-gray-100 rounded font-medium text-gray-700 border border-gray-300 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this meter reading? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeleteConfirmOpen)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <FiltersSidebar
        isOpen={isFiltersSidebarOpen}
        onClose={() => setIsFiltersSidebarOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={METER_HISTORY_FIELDS}
      />
    </div>
  );
}