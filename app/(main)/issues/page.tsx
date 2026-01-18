'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, Lightbulb, Zap, AlertCircle, Eye, Edit2, PlusSquare, Wrench, CheckCircle2, XCircle, Trash2, ArrowRight, ListPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useIssues from '@/lib/hooks/useIssues';
import { useContacts } from '@/lib/hooks/useContacts';
import type { Issue, IssueFilters } from '@/lib/services/issues-api';
import type { Contact } from '@/lib/services/contacts-api';
import { serviceAPI } from '@/lib/services/service-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { FiltersSidebar } from '../inspections/components/filters/FiltersSidebar';
import { FilterCriterion } from '../inspections/components/filters/FilterCard';
import { ISSUE_FILTER_FIELDS } from './components/filters/issue-filter-definitions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { groupsAPI, type Group } from '@/lib/services/contacts-api';

export default function IssuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast, toasts, removeToast } = useToast();

  const {
    issues,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchIssues,
    clearError,
    updateIssueStatus,
    deleteIssue
  } = useIssues({
    page: 1,
    limit: 20,
    status: (searchParams.get('status') as any) || 'OPEN',
    search: searchParams.get('search') || undefined,
    priority: (searchParams.get('priority') as any) || undefined,
    assignedTo: searchParams.get('assignedTo') || undefined,
    labels: searchParams.get('labels') || undefined,
    groupId: searchParams.get('groupId') || undefined
  });

  // Fetch contacts for mapping IDs to names
  const { contacts } = useContacts({ limit: 1000 });

  const contactMap = useMemo(() => {
    return contacts.reduce((acc, contact) => {
      acc[contact.id] = contact;
      return acc;
    }, {} as Record<string, Contact>);
  }, [contacts]);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [modalType, setModalType] = useState<'service_entry' | 'work_order' | 'resolve' | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  // Advanced Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);
  const { vehicles } = useVehicles();
  const [groups, setGroups] = useState<Group[]>([]);

  // Charger les groupes
  useEffect(() => {
    groupsAPI.getGroups().then(setGroups);
  }, []);

  // Populate dynamic options for filter fields
  const populatedFilterFields = useMemo(() => {
    return ISSUE_FILTER_FIELDS.map(field => {
      if (field.id === 'assignedTo') {
        return {
          ...field,
          options: contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
        };
      }
      if (field.id === 'vehicleId') {
        return {
          ...field,
          options: vehicles.map(v => ({ value: v.id, label: `${v.make} ${v.model} (${v.name})` }))
        };
      }
      if (field.id === 'groupId') {
        return {
          ...field,
          options: groups.map(g => ({ value: g.id, label: g.name }))
        };
      }
      return field;
    });
  }, [contacts, vehicles, groups]);

  const handleAdd = () => {
    router.push('/issues/create');
  };

  const handleRowClick = (id: string) => {
    router.push(`/issues/${id}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, search: query || undefined };
    setFilters(newFilters);
    fetchIssues(newFilters);

    // Mettre à jour l'URL
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (query) params.set('search', query);

    router.replace(`/issues?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<IssueFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchIssues(updatedFilters);

    // Mettre à jour l'URL pour refléter les filtres
    const params = new URLSearchParams();

    const relevantKeys: (keyof IssueFilters)[] = ['status', 'search', 'priority', 'assignedTo', 'labels', 'groupId', 'startDate', 'endDate'];
    relevantKeys.forEach(key => {
      const val = updatedFilters[key];
      if (val) {
        params.set(key, String(val));
      }
    });

    router.replace(`/issues?${params.toString()}`);
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);

    // On part d'un état "clean" pour les filtres avancés mais on garde status
    const newFilters: Partial<IssueFilters> = {
      status: filters.status || 'OPEN',
      search: undefined,
      priority: undefined,
      assignedTo: undefined,
      vehicleId: undefined,
      groupId: undefined,
      labels: undefined,
      startDate: undefined,
      endDate: undefined
    };

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;

      if (c.field === 'labels') {
        newFilters.labels = Array.isArray(c.value) ? c.value.join(',') : c.value;
      } else if (c.field === 'summary') {
        newFilters.search = value;
      } else if (c.field === 'reportedDate') {
        // Si c'est un filter range (between)
        if (c.operator === 'between' && typeof c.value === 'object') {
          newFilters.startDate = c.value.from;
          newFilters.endDate = c.value.to;
        } else {
          newFilters.startDate = value;
          newFilters.endDate = value;
        }
      } else {
        // @ts-ignore
        newFilters[c.field] = value;
      }
    });

    handleFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveCriteria([]);
    setSearchQuery('');
    handleFilterChange({
      status: 'OPEN',
      priority: undefined,
      assignedTo: undefined,
      vehicleId: undefined,
      groupId: undefined,
      labels: undefined,
      search: undefined
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/issues/${id}/edit`);
  };

  const handleClose = async (id: string) => {
    try {
      await updateIssueStatus(id, 'CLOSED');
      toast.success('Problème fermé avec succès');
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to close issue:', err);
      toast.error('Échec de la fermeture du problème');
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce problème ?')) {
      try {
        await deleteIssue(id);
        toast.success('Problème supprimé avec succès');
        setActiveDropdown(null);
      } catch (err) {
        console.error('Failed to delete issue:', err);
        toast.error('Échec de la suppression du problème');
      }
    }
  };

  const handleResolve = async () => {
    if (!selectedIssue || !resolveNote.trim()) return;
    try {
      await updateIssueStatus(selectedIssue.id, 'RESOLVED');
      // In a real app we'd also save the note
      setModalType(null);
      setResolveNote('');
      setSelectedIssue(null);
      toast.success('Problème résolu avec succès');
    } catch (err) {
      console.error('Failed to resolve issue:', err);
      toast.error('Échec de la résolution du problème');
    }
  };

  const handleAddRecords = async (type: 'service_entry' | 'work_order') => {
    if (!selectedIssue) return;
    try {
      await serviceAPI.createServiceEntry({
        vehicleId: selectedIssue.vehicleId || '',
        date: new Date().toISOString(),
        isWorkOrder: type === 'work_order',
        notes: `Created from issue: ${selectedIssue.summary}`,
        status: 'SCHEDULED'
      });
      setModalType(null);
      setSelectedIssue(null);
      toast.success(`${type === 'work_order' ? 'Ordre de travail' : 'Entrée de service'} créé avec succès`);
    } catch (err) {
      console.error(`Failed to create ${type}:`, err);
      toast.error(`Échec de la création de ${type === 'work_order' ? "l'ordre de travail" : "l'entrée de service"}`);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-400 text-yellow-900 border-yellow-500';
      case 'CLOSED': return 'bg-gray-500 text-white border-gray-600';
      case 'RESOLVED': return 'bg-green-600 text-white border-green-700';
      case 'IN_PROGRESS': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-orange-400';
      case 'LOW': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Handle loading state
  if (loading && issues.length === 0) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des problèmes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative">
      <FiltersSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={populatedFilterFields as any}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Problèmes</h1>
          {/* <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2 flex items-center gap-1">
            <Lightbulb size={12} /> En savoir plus
          </button> */}
        </div>

        <div className="flex gap-2">
          {/* <button className="text-[#008751] hover:bg-green-50 font-medium py-2 px-3 rounded flex items-center gap-1 text-sm bg-transparent">
            <Zap size={16} /> Automations <ChevronDown size={14} />
          </button> */}
          {/* <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button> */}
          <button
            onClick={handleAdd}
            data-testid="add-issue-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Nouveau Problème
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        <button className={`pb-3 border-b-2 ${filters.status === undefined ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'} flex items-center gap-1`} onClick={() => handleFilterChange({ status: undefined })}>Tous <MoreHorizontal size={14} /></button>
        <button className={`pb-3 border-b-2 ${filters.status === 'OPEN' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`} data-testid="status-tab-OPEN" onClick={() => handleFilterChange({ status: 'OPEN' })}>Ouverts</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-gray-700 text-gray-500">En retard</button>
        <button className={`pb-3 border-b-2 ${filters.status === 'RESOLVED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`} data-testid="status-tab-RESOLVED" onClick={() => handleFilterChange({ status: 'RESOLVED' })}>Résolus</button>
        <button className={`pb-3 border-b-2 ${filters.status === 'CLOSED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`} onClick={() => handleFilterChange({ status: 'CLOSED' })}>Fermés</button>
        {/* <button className="pb-3 border-b-2 border-transparent hover:text-green-700 text-[#008751] flex items-center gap-1"><Plus size={14} /> Add Tab</button> */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center" data-testid="issues-filters">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher"
            data-testid="search-input"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] text-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none"
          value={filters.assignedTo || ''}
          onChange={(e) => handleFilterChange({ assignedTo: e.target.value || undefined })}
        >
          <option value="">Assigné à</option>
          {contacts.map(c => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
          ))}
        </select>

        <select
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none"
          value={filters.groupId || ''}
          onChange={(e) => handleFilterChange({ groupId: e.target.value || undefined })}
        >
          <option value="">Groupe : Tous</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <button
          onClick={() => setIsFiltersOpen(true)}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter size={14} /> Filtres
          {activeCriteria.length > 0 && (
            <span className="bg-[#008751] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeCriteria.length}
            </span>
          )}
        </button>

        {(filters.assignedTo || filters.groupId || filters.labels || filters.priority || activeCriteria.length > 0) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
          >
            Effacer
          </button>
        )}

        {/* <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${pagination.page * pagination.limit - pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount}` : '0'}
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"
            disabled={!pagination?.hasPrev}
          >
            <ChevronRight className="rotate-180" size={16} />
          </button>
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"
            disabled={!pagination?.hasNext}
          >
            <ChevronRight size={16} />
          </button>
        </div> */}

        {/* <button className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white"><Settings size={16} /></button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Save View <ChevronDown size={14} />
        </button> */}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm" data-testid="issues-list">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Priorité</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Nom</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer flex items-center gap-1">Problème ▲</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Résumé</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Statut</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Source</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Date de signalement</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Assigné</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Étiquettes</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Observateurs</th>
              <th className="px-4"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map(issue => (
              <tr key={issue.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(issue.id)}>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium">
                    <div className={`${getPriorityIconColor(issue.priority)}`}><ChevronRight className="-rotate-90" size={14} strokeWidth={3} /></div>
                    <span className="text-gray-700">{issue.priority}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                    <div className="flex flex-col">
                      <span className="text-[#008751] font-bold hover:underline cursor-pointer">
                        {issue.vehicle ? `${issue.vehicle.make} ${issue.vehicle.model}` : 'N/A'}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded w-fit">
                        {issue.vehicle?.vin || 'No VIN'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">Vehicle</td>
                <td className="px-4 py-3 font-medium text-gray-900">#{issue.id.slice(-6)} <span className="text-xs bg-gray-100 px-1 rounded text-gray-500 font-normal">FleetMada</span></td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {issue.summary}
                  {issue.labels.length > 0 && (
                    <span className="ml-2 text-[#008751] text-xs hover:underline cursor-pointer">{issue.labels[0]}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getStatusColor(issue.status)}`}>{issue.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">FleetMada</td>
                <td className="px-4 py-3 text-gray-900 underline decoration-dotted underline-offset-4">{formatDate(issue.reportedDate)}</td>
                <td className="px-4 py-3 text-gray-400">
                  {issue.assignedTo && issue.assignedTo.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {(Array.isArray(issue.assignedTo) ? issue.assignedTo : [issue.assignedTo]).map((userId) => {
                        const contact = contactMap[userId];
                        return (
                          <div key={userId} className="text-sm">
                            {contact ? (
                              <span className="text-gray-900 font-medium">
                                {contact.firstName} {contact.lastName}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">{userId.substring(0, 8)}...</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  {issue.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((label, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">{label}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hover:text-[#008751] hover:underline">
                  {issue.watchers > 0 ? `${issue.watchers} observateur${issue.watchers > 1 ? 's' : ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-right sticky right-0 bg-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(issue.id);
                    }}
                    className="text-gray-400 hover:text-[#008751] p-1"
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {
        modalType && selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'service_entry' ? 'Ajouter à une entrée de service' :
                    modalType === 'work_order' ? 'Ajouter à un ordre de travail' :
                      `Résoudre le problème #${selectedIssue.id.slice(-6)}`}
                </h2>
                <button
                  onClick={() => { setModalType(null); setSelectedIssue(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Vehicle Info */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500 w-24">Véhicule</span>
                  <div className="flex items-center gap-2">
                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${selectedIssue.id}`} className="w-8 h-8 rounded object-cover" alt="" />
                    <span className="text-[#008751] font-bold">{selectedIssue.vehicle?.make} {selectedIssue.vehicle?.model}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Échantillon</span>
                  </div>
                </div>

                {modalType === 'resolve' ? (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-500 w-24">Résumé</span>
                      <span className="text-gray-900">{selectedIssue.summary}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-500">Note <span className="text-red-500">*</span></label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        placeholder="Décrivez le travail effectué pour résoudre le problème."
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                      ></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <span className="text-sm font-medium text-gray-500 w-24 pt-1">Problèmes</span>
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 rounded-sm">1</span>
                          <span className="text-sm font-medium">Le problème sera ajouté</span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded p-3 flex items-start gap-3">
                          <input type="checkbox" checked readOnly className="mt-1 rounded border-gray-300 text-[#008751]" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded-sm uppercase">Ouvert</span>
                              <span className="text-sm font-bold">1 - {selectedIssue.summary}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Signalé le {formatDate(selectedIssue.reportedDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-500 w-24">{modalType === 'service_entry' ? 'Entrée de service' : 'Ordre de travail'}</span>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="entry_type" checked readOnly className="text-[#008751] focus:ring-[#008751]" />
                          <span className="text-sm">Ajouter à une nouvelle {modalType === 'service_entry' ? 'entrée de service' : 'ordre de travail'}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer opacity-50">
                          <input type="radio" name="entry_type" disabled className="text-[#008751] focus:ring-[#008751]" />
                          <span className="text-sm">Ajouter à une {modalType === 'service_entry' ? 'entrée de service' : 'ordre de travail'} existante</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => { setModalType(null); setSelectedIssue(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (modalType === 'resolve') handleResolve();
                    else handleAddRecords(modalType as any);
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#008751] hover:bg-[#007043] rounded"
                >
                  {modalType === 'resolve' ? 'Résoudre le problème' : 'Continuer'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}