'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, AlertCircle, FileText, Clock, CheckCircle, XCircle, DollarSign, User, TrendingUp, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceWorkOrders } from '@/lib/hooks/useServiceWorkOrders';

export default function WorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    status: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | ''
    vehicleId: string
    assignedTo: string
  }>({
    status: '',
    priority: '',
    vehicleId: '',
    assignedTo: ''
  });

  // Hook pour les work orders
  const {
    workOrders,
    loading,
    error,
    pagination,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    approveWorkOrder,
    assignWorkOrder,
    completeWorkOrder,
    cancelWorkOrder,
    stats,
    approveMultiple,
    assignMultiple,
    exportWorkOrders,
    refresh
  } = useServiceWorkOrders({
    status: filters.status || undefined,
    priority: (filters.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || undefined,
    vehicleId: filters.vehicleId || undefined,
    assignedTo: filters.assignedTo || undefined
  });

  const handleAddWorkOrder = () => {
    router.push('/service/work-orders/create');
  };

  const handleWorkOrderClick = (id: string) => {
    router.push(`/service/work-orders/${id}`);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === workOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(workOrders.map(order => order.id));
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Note: La recherche sera implémentée côté backend
    fetchWorkOrders({});
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchWorkOrders(newFilters as any);
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.length === 0) return;
    
    const success = await approveMultiple(selectedOrders);
    if (success) {
      setSelectedOrders([]);
      refresh();
    }
  };

  const handleBulkAssign = async (assignedTo: string) => {
    if (selectedOrders.length === 0) return;
    
    const success = await assignMultiple(selectedOrders, assignedTo);
    if (success) {
      setSelectedOrders([]);
      refresh();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Programmé' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En cours' },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terminé' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      LOW: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      MEDIUM: { color: 'bg-blue-100 text-blue-800', label: 'Moyen' },
      HIGH: { color: 'bg-orange-100 text-orange-800', label: 'Élevé' },
      CRITICAL: { color: 'bg-red-100 text-red-800', label: 'Critique' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getFilteredOrders = () => {
    let filtered = [...workOrders];
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => {
        switch (activeTab) {
          case 'open': return order.status === 'SCHEDULED' || order.status === 'IN_PROGRESS';
          case 'pending': return order.status === 'SCHEDULED';
          case 'completed': return order.status === 'COMPLETED';
          default: return true;
        }
      });
    }
    
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Ordres de Travail</h1>
          <button className="text-[#008751] hover:underline text-sm font-medium">
            Gérer les work orders
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50">
            <MoreHorizontal size={20} />
          </button>
          <button
            onClick={handleAddWorkOrder}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Nouvel Ordre
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Work Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalCost > 0 ? workOrders.length : 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-xl font-bold text-gray-900">{stats.completedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-xl font-bold text-gray-900">{stats.inProgressCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-xl font-bold text-gray-900">{stats.overdueCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Coût Moyen</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.avgCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-800 font-medium">
                {selectedOrders.length} ordre(s) sélectionné(s)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
              >
                <CheckCircle size={16} /> Approuver
              </button>
              <button
                onClick={() => handleBulkAssign('Technicien 1')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
              >
                <User size={16} /> Assigner
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'all' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Tous
        </button>
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'open' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Ouverts
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'pending' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          En attente
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'completed' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Terminés
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Plus size={14} /> Ajouter onglet
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un ordre de travail"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            Véhicule <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            Statut <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={14} /> Filtres
          </button>
        </div>
        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 - 0 sur 0'}
        </div>
        <div className="flex gap-1">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
        </div>
        <button
          onClick={() => exportWorkOrders()}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Download size={14} /> Exporter
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâches</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Programmée</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigné à</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ordre de travail</h3>
                      <p className="text-gray-600 mb-4">Commencez par créer votre premier ordre de travail.</p>
                      <button
                        onClick={handleAddWorkOrder}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                      >
                        <Plus size={20} /> Créer un ordre
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleWorkOrderClick(order.id)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {(order.vehicle?.name || 'V').substring(0, 1)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">
                          {order.vehicle?.name || `Véhicule ${order.vehicleId}`}
                        </div>
                        <span className="text-xs text-gray-500">
                          {order.vehicle?.make} {order.vehicle?.model}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#008751] hover:underline">
                    #{order.id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(order.priority)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {order.tasks && order.tasks.length > 0 ? (
                        <ul className="list-none space-y-1">
                          {order.tasks.slice(0, 2).map((taskEntry, i) => (
                            <li key={i} className="text-xs truncate">
                              {taskEntry.serviceTask?.name || 'Tâche inconnue'}
                            </li>
                          ))}
                          {order.tasks.length > 2 && (
                            <li className="text-gray-500 text-xs">+{order.tasks.length - 2} autres</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-500 text-xs">Aucune tâche</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.assignedTo || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(order.totalCost || 0)}
                  </td>
                </tr>
              ))
            )}
            
            {/* Indicateur de chargement */}
            {loading && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                    <span className="text-gray-600">Chargement des ordres de travail...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}