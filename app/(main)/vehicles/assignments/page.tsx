'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, X, Calendar, Clock, User, Car, Loader2, AlertCircle } from 'lucide-react';
import { Assignment, Vehicle } from '../types';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { type FilterCriterion } from '../components/filters/FilterCard';
import { ASSIGNMENT_FIELDS } from '../components/filters/filter-definitions';
import { type VehicleListQuery } from '@/lib/validations/vehicle-validations';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function VehicleAssignmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { token, loading: tokenLoading } = useAuthToken();

  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<VehicleListQuery>({
    page: 1,
    limit: 100, // Reduced from 500 to stay within standard limits
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);

  // Modal Form State
  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00'
  });

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 hours
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => i);
  const daysInMonth = Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);


  const fetchData = async (query?: VehicleListQuery) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      console.log(`fetching from: /api/vehicles?${params.toString()}`);

      const [vehiclesRes, assignmentsRes, contactsRes] = await Promise.all([
        fetch(`/api/vehicles?${params.toString()}`, { headers }),
        fetch('/api/assignments', { headers }),
        fetch('/api/contacts', { headers })
      ]);

      if (!vehiclesRes.ok) console.error('Vehicles API error:', vehiclesRes.status);
      if (!assignmentsRes.ok) console.error('Assignments API error:', assignmentsRes.status);
      if (!contactsRes.ok) console.error('Contacts API error:', contactsRes.status);

      const vehiclesData = await vehiclesRes.json().catch(() => ({ success: false, error: 'Invalid JSON' }));
      const assignmentsData = await assignmentsRes.json().catch(() => ({ success: false, error: 'Invalid JSON' }));
      const contactsData = await contactsRes.json().catch(() => ({ success: false, error: 'Invalid JSON' }));

      console.log('Vehicles success:', vehiclesData.success, 'Count:', vehiclesData.data?.vehicles?.length);

      if (vehiclesData.success && vehiclesData.data) {
        setVehicles(vehiclesData.data.vehicles || []);
      } else {
        console.error('Failed to fetch vehicles:', vehiclesData.error);
        setVehicles([]);
      }

      if (assignmentsData.success && Array.isArray(assignmentsData.data)) {
        const mappedAssignments = assignmentsData.data.map((a: any) => ({
          ...a,
          startDate: a.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
          startTime: a.startDate ? new Date(a.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '00:00',
          endDate: a.endDate?.split('T')[0],
          endTime: a.endDate ? new Date(a.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined
        }));
        setAssignments(mappedAssignments);
      } else {
        console.error('Failed to fetch assignments:', assignmentsData.error);
        setAssignments([]);
      }

      if (contactsData.success && contactsData.data) {
        setContacts(contactsData.data.contacts || []);
      } else {
        console.error('Failed to fetch contacts:', contactsData.error);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

    const newFilters: Partial<VehicleListQuery> = {
      status: undefined,
      type: undefined,
      ownership: undefined,
      group: undefined,
      operator: undefined,
      make: undefined,
      model: undefined,
      year: undefined,
      purchaseVendor: undefined,
    };

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value.join(',') : c.value;
      if (value) {
        // @ts-ignore
        newFilters[c.field] = value;
      }
    });

    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setIsFiltersSidebarOpen(false);
  };

  // Check if a vehicle is assigned at a specific time/date
  const getAssignmentAtSlot = (vehicleId: string, slotIndex: number) => {
    if (viewMode === 'day') {
      const todayStr = currentDate.toISOString().split('T')[0];
      return assignments.find(a => {
        if (a.vehicleId !== vehicleId) return false;
        if (a.startDate !== todayStr) return false;
        const startH = parseInt(a.startTime.split(':')[0]);
        const endH = a.endTime ? parseInt(a.endTime.split(':')[0]) : 24;
        return slotIndex >= startH && slotIndex < endH;
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const slotDate = new Date(startOfWeek);
      slotDate.setDate(startOfWeek.getDate() + slotIndex);
      const slotDateStr = slotDate.toISOString().split('T')[0];
      return assignments.find(a => a.vehicleId === vehicleId && a.startDate === slotDateStr);
    } else {
      const slotDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), slotIndex);
      const slotDateStr = slotDate.toISOString().split('T')[0];
      return assignments.find(a => a.vehicleId === vehicleId && a.startDate === slotDateStr);
    }
  };

  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const handleSaveAssignment = async () => {
    if (!assignmentForm.vehicleId || !assignmentForm.operator) return;

    setIsSaving(true);
    setAssignmentError(null);
    try {
      const method = editingAssignmentId ? 'PUT' : 'POST';
      const url = `/api/vehicles/${assignmentForm.vehicleId}/assignments`;

      const payload = {
        ...assignmentForm,
        id: editingAssignmentId,
        startDate: `${assignmentForm.startDate}T${assignmentForm.startTime}:00Z`,
        endDate: assignmentForm.endDate ? `${assignmentForm.endDate}T${assignmentForm.endTime}:00Z` : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        await fetchData(); // Refresh data from server
        handleCloseModal();
      } else {
        setAssignmentError(result.error || 'Failed to save assignment');
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      setAssignmentError('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignmentForm(assignment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAssignmentId(null);
    setAssignmentForm({
      startDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '17:00'
    });
  };

  const formatDate = (date: Date) => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#008751] animate-spin mb-2" />
        <p className="text-gray-500 font-medium">Chargement des affectations...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Affectations de véhicules</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Apprendre
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Ajouter une affectation
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher des véhicules..."
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFiltersSidebarOpen(true)}
              className="border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Filter size={14} /> Filtres
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Jour
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Mois
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium p-2 text-gray-900 bg-gray-100 rounded transition-colors hover:bg-gray-200"
            >
              Aujourd'hui
            </button>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
              <button onClick={() => navigateDate(-1)} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft size={16} /></button>

              <span className="text-sm font-medium w-32 text-center">{formatDate(currentDate)}</span>
              <button onClick={() => navigateDate(1)} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduler Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Vehicles */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-white z-10">
          <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-gray-50 text-sm font-medium text-gray-500 sticky top-0">
            Véhicule
          </div>
          {vehicles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">Aucun véhicule trouvé correspondant aux filtres.</p>
            </div>
          ) : vehicles.map(vehicle => (
            <div key={vehicle.id} className="h-16 border-b border-gray-100 px-4 flex items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                  <Car size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{vehicle.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full 
                                   ${(vehicle.status === 'Active' || vehicle.status === 'ACTIVE' || (vehicle.status as string) === 'active') ? 'bg-green-500' :
                        (vehicle.status === 'In Shop' || vehicle.status === 'MAINTENANCE' || (vehicle.status as string) === 'maintenance') ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                    {vehicle.status === 'ACTIVE' ? 'Actif' : vehicle.status === 'MAINTENANCE' ? 'En atelier' : vehicle.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative">
          {/* Time Header */}
          <div className="h-10 border-b border-gray-200 flex min-w-max sticky top-0 bg-white z-10 shadow-sm">
            {viewMode === 'day' && hours.map(hour => (
              <div key={hour} className="w-20 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
              </div>
            ))}
            {viewMode === 'week' && daysOfWeek.map(day => {
              const d = new Date(currentDate);
              d.setDate(currentDate.getDate() - currentDate.getDay() + day);
              return (
                <div key={day} className="w-32 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                  {d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </div>
              );
            })}
            {viewMode === 'month' && daysInMonth.map(day => (
              <div key={day} className="w-12 border-r border-gray-100 px-2 py-2 text-xs text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="min-w-max">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="h-16 border-b border-gray-100 flex relative">
                {viewMode === 'day' && hours.map(hour => {
                  const assignment = getAssignmentAtSlot(vehicle.id, hour);
                  const isStart = assignment && parseInt(assignment.startTime.split(':')[0]) === hour;

                  return (
                    <div key={hour} className="w-20 border-r border-gray-50 h-full relative group">
                      {isStart && (
                        <div
                          onClick={() => handleEditAssignment(assignment)}
                          className="absolute top-2 left-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded-r px-2 py-1 z-10 shadow-sm whitespace-nowrap overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors"
                          style={{ width: `calc(80px * ${parseInt(assignment.endTime?.split(':')[0] || '24') - parseInt(assignment.startTime.split(':')[0])})` }}>
                          <div className="text-xs font-bold text-blue-900">{assignment.operator}</div>
                          <div className="text-[10px] text-blue-700">{assignment.startTime} - {assignment.endTime}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {viewMode === 'week' && daysOfWeek.map(day => {
                  const assignment = getAssignmentAtSlot(vehicle.id, day);
                  return (
                    <div key={day} className="w-32 border-r border-gray-50 h-full relative group">
                      {assignment && (
                        <div
                          onClick={() => handleEditAssignment(assignment)}
                          className="absolute top-2 left-1 right-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded-r px-2 py-1 z-10 shadow-sm whitespace-nowrap overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors">
                          <div className="text-xs font-bold text-blue-900">{assignment.operator}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {viewMode === 'month' && daysInMonth.map(day => {
                  const assignment = getAssignmentAtSlot(vehicle.id, day);
                  return (
                    <div key={day} className="w-12 border-r border-gray-50 h-full relative group">
                      {assignment && (
                        <div
                          onClick={() => handleEditAssignment(assignment)}
                          className="absolute top-2 left-1 right-1 h-12 bg-blue-100 border-l-4 border-blue-500 rounded px-1 py-1 z-10 shadow-sm overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors">
                          <div className="w-full h-full bg-blue-500 rounded-sm"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Current Time Line (Only in Day view) */}
            {viewMode === 'day' && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-red-400 z-0 pointer-events-none"
                style={{ left: `calc(80px * ${new Date().getHours() + new Date().getMinutes() / 60})` }}
              >
                <div className="w-2 h-2 bg-red-400 rounded-full -ml-[5px] mt-10"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAssignmentId ? 'Modifier l\'affectation' : 'Ajouter une affectation'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {assignmentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {assignmentError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule affecté <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-[#008751] focus:border-[#008751] bg-white transition-all disabled:opacity-50"
                    value={assignmentForm.vehicleId || ''}
                    disabled={isSaving}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, vehicleId: e.target.value })}
                  >
                    <option value="">Veuillez sélectionner</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.vin})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opérateur <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-[#008751] focus:border-[#008751] bg-white transition-all disabled:opacity-50"
                    value={assignmentForm.operator || ''}
                    disabled={isSaving}
                    onChange={(e) => {
                      const selectedContact = contacts.find(c => `${c.firstName} ${c.lastName}` === e.target.value);
                      setAssignmentForm({
                        ...assignmentForm,
                        operator: e.target.value,
                        contactId: selectedContact?.id
                      });
                    }}
                  >
                    <option value="">Veuillez sélectionner</option>
                    {contacts.map(c => (
                      <option key={c.id} value={`${c.firstName} ${c.lastName}`}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date/Heure de début</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="date" className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
                        value={assignmentForm.startDate}
                        disabled={isSaving}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })} />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="time" className="w-full pl-7 pr-1 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
                        value={assignmentForm.startTime}
                        disabled={isSaving}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startTime: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date/Heure de fin</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="date" className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
                        value={assignmentForm.endDate || ''}
                        disabled={isSaving}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })} />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="time" className="w-full pl-7 pr-1 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
                        value={assignmentForm.endTime || ''}
                        disabled={isSaving}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endTime: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Ajouter un commentaire optionnel"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751] transition-all disabled:opacity-50"
                  rows={3}
                  value={assignmentForm.comments || ''}
                  disabled={isSaving}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, comments: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
              <div className="flex gap-3">
                {editingAssignmentId && (
                  <button
                    onClick={async () => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
                        setIsSaving(true);
                        try {
                          const response = await fetch(`/api/vehicles/${assignmentForm.vehicleId}/assignments?id=${editingAssignmentId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (response.ok) {
                            await fetchData();
                            handleCloseModal();
                          }
                        } catch (e) {
                          console.error('La suppression a échoué:', e);
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
                    disabled={isSaving}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveAssignment}
                  disabled={isSaving || !assignmentForm.vehicleId || !assignmentForm.operator}
                  className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {editingAssignmentId ? 'Mettre à jour l\'affectation' : 'Enregistrer l\'affectation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <FiltersSidebar
        isOpen={isFiltersSidebarOpen}
        onClose={() => setIsFiltersSidebarOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={ASSIGNMENT_FIELDS}
      />
    </div>
  );
}