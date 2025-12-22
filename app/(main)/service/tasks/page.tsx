'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, AlertCircle, Wrench, TrendingUp, Tag, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceTasks } from '@/lib/hooks/useServiceTasks';

export default function ServiceTasksPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    system: ''
  });

  // Hook pour les tâches de service
  const {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    totalTasks,
    tasksByCategory,
    tasksBySystem,
    mostUsedTasks,
    avgTaskUsage,
    tasksWithReminders,
    tasksInPrograms,
    refresh
  } = useServiceTasks({
    search: searchTerm,
    category: filters.category || undefined,
    system: filters.system || undefined
  });

  const handleAddServiceTask = () => {
    router.push('/service/tasks/create');
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/service/tasks/${taskId}`);
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchTasks({ search: value });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchTasks(newFilters);
  };

  const getUsageBadge = (entryCount: number) => {
    if (entryCount === 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Non utilisé</span>;
    } else if (entryCount < 5) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Peu utilisé</span>;
    } else if (entryCount < 20) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Modérément utilisé</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Fréquemment utilisé</span>;
    }
  };

  const getPriorityScore = (task: any) => {
    return task.entryCount * 0.4 + task.reminderCount * 0.3 + task.programCount * 0.2 + task.woCount * 0.1;
  };

  // Tri des tâches par priorité d'utilisation
  const sortedTasks = [...tasks].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Tâches de Service</h1>
          <button className="text-[#008751] hover:underline text-sm font-medium">
            Gérer les tâches de maintenance
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50">
            <MoreHorizontal size={20} />
          </button>
          <button
            onClick={handleAddServiceTask}
            data-testid="add-task-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Nouvelle Tâche
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tâches</p>
              <p className="text-xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Utilisation</p>
              <p className="text-xl font-bold text-gray-900">{avgTaskUsage.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dans Programmes</p>
              <p className="text-xl font-bold text-gray-900">{tasksInPrograms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avec Rappels</p>
              <p className="text-xl font-bold text-gray-900">{tasksWithReminders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded">
              <Tag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Catégories</p>
              <p className="text-xl font-bold text-gray-900">{Object.keys(tasksByCategory).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded">
              <Settings className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Systèmes</p>
              <p className="text-xl font-bold text-gray-900">{Object.keys(tasksBySystem).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 text-sm font-medium border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 border-b-2 ${activeTab === 'active' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Tâches Actives
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`pb-3 border-b-2 ${activeTab === 'archived' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Archivées
        </button>
        <button
          onClick={() => setActiveTab('most-used')}
          className={`pb-3 border-b-2 ${activeTab === 'most-used' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Plus Utilisées
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher une tâche"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Type de Tâche <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Catégorie <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Système <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filtres
        </button>
        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 - 0 sur 0'}
        </div>
        <div className="flex gap-1">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
        </div>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Entrées</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Rappels</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Programmes</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Work Orders</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Système</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assemblage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.length === 0 && !loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Wrench className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche de service</h3>
                      <p className="text-gray-600 mb-4">Commencez par créer votre première tâche de service.</p>
                      <button
                        onClick={handleAddServiceTask}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                      >
                        <Plus size={20} /> Créer une tâche
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleSelectTask(task.id)}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                  </td>
                  <td
                    className="px-4 py-3 font-medium text-gray-900 underline decoration-dotted underline-offset-4 cursor-pointer"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-center gap-2">
                      {task.name}
                      {getUsageBadge(task.entryCount)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {task.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#008751]">{task.entryCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#008751]">{task.reminderCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#008751]">{task.programCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#008751]">{task.woCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {task.categoryCode || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {task.systemCode || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded max-w-xs truncate">
                      {task.assemblyCode || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}

            {/* Indicateur de chargement */}
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                    <span className="text-gray-600">Chargement des tâches...</span>
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