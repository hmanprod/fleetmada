"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Car, 
  User, 
  MapPin,
  MoreHorizontal,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import MetricCard from './MetricCard';

interface UpcomingInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate?: string;
  vehicleImage?: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'OVERDUE' | 'IN_PROGRESS' | 'UPCOMING';
  inspectorName: string;
  templateName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  estimatedDuration?: number; // en minutes
  complianceRisk?: 'low' | 'medium' | 'high';
}

interface UpcomingInspectionsProps {
  loading?: boolean;
  inspections: UpcomingInspection[];
  summary?: {
    totalUpcoming: number;
    overdueCount: number;
    todayCount: number;
    thisWeekCount: number;
    criticalCount: number;
  };
  showFilters?: boolean;
  maxItems?: number;
  onInspectionClick?: (id: string) => void;
  onCreateInspection?: () => void;
}

const statusConfig = {
  SCHEDULED: {
    color: 'blue',
    icon: Clock,
    label: 'Planifiée',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  OVERDUE: {
    color: 'red',
    icon: AlertTriangle,
    label: 'En retard',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  IN_PROGRESS: {
    color: 'yellow',
    icon: Clock,
    label: 'En cours',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  UPCOMING: {
    color: 'green',
    icon: CheckCircle,
    label: 'À venir',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  }
};

const priorityConfig = {
  low: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    label: 'Faible'
  },
  medium: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Moyenne'
  },
  high: {
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    label: 'Haute'
  },
  critical: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Critique'
  }
};

export default function UpcomingInspections({
  loading = false,
  inspections,
  summary,
  showFilters = true,
  maxItems = 10,
  onInspectionClick,
  onCreateInspection
}: UpcomingInspectionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filtrer les inspections
  const filteredInspections = inspections
    .filter(inspection => {
      const matchesSearch = !searchQuery || 
        inspection.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.inspectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.templateName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || inspection.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .slice(0, maxItems);

  // Calculer le temps restant
  const getTimeRemaining = (scheduledDate: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff < 0) {
      const daysOverdue = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return { text: `${daysOverdue} jour${daysOverdue > 1 ? 's' : ''} de retard`, isOverdue: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 7) {
      const weeks = Math.floor(days / 7);
      return { text: `dans ${weeks} semaine${weeks > 1 ? 's' : ''}`, isOverdue: false };
    } else if (days > 0) {
      return { text: `dans ${days} jour${days > 1 ? 's' : ''}`, isOverdue: false };
    } else {
      return { text: `dans ${hours}h`, isOverdue: false };
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (isTomorrow) return `Demain ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.icon : Clock;
  };

  // Obtenir les couleurs de statut
  const getStatusColors = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config || statusConfig.SCHEDULED;
  };

  // Statistiques par défaut si non fournies
  const defaultSummary = {
    totalUpcoming: inspections.length,
    overdueCount: inspections.filter(i => i.status === 'OVERDUE').length,
    todayCount: inspections.filter(i => {
      const today = new Date().toDateString();
      return new Date(i.scheduledDate).toDateString() === today;
    }).length,
    thisWeekCount: inspections.filter(i => {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const inspectionDate = new Date(i.scheduledDate);
      return inspectionDate >= now && inspectionDate <= weekFromNow;
    }).length,
    criticalCount: inspections.filter(i => i.priority === 'critical').length
  };

  const displaySummary = summary || defaultSummary;

  return (
    <div className="space-y-6">
      {/* Métriques de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          title="Total à venir"
          value={displaySummary.totalUpcoming}
          icon={Calendar}
          color="blue"
          loading={loading}
        />
        
        <MetricCard
          title="Aujourd'hui"
          value={displaySummary.todayCount}
          icon={Clock}
          color={displaySummary.todayCount > 0 ? 'green' : 'gray'}
          loading={loading}
        />
        
        <MetricCard
          title="Cette semaine"
          value={displaySummary.thisWeekCount}
          icon={Calendar}
          color="purple"
          loading={loading}
        />
        
        <MetricCard
          title="En retard"
          value={displaySummary.overdueCount}
          icon={AlertTriangle}
          color={displaySummary.overdueCount > 0 ? 'red' : 'green'}
          loading={loading}
        />
        
        <MetricCard
          title="Critiques"
          value={displaySummary.criticalCount}
          icon={AlertTriangle}
          color={displaySummary.criticalCount > 0 ? 'red' : 'gray'}
          loading={loading}
        />
      </div>

      {/* Filtres et recherche */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un véhicule, inspecteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
              />
            </div>
            
            {/* Filtre statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="SCHEDULED">Planifiées</option>
              <option value="OVERDUE">En retard</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="UPCOMING">À venir</option>
            </select>
            
            {/* Filtre priorité */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            >
              <option value="all">Toutes priorités</option>
              <option value="critical">Critique</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
            
            {/* Bouton créer */}
            {onCreateInspection && (
              <button
                onClick={onCreateInspection}
                className="px-4 py-2 bg-[#008751] text-white rounded-md hover:bg-[#007043] transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Nouvelle inspection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Liste des inspections */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prochaines Inspections
            </h3>
            <span className="text-sm text-gray-500">
              {filteredInspections.length} inspection{filteredInspections.length > 1 ? 's' : ''} 
              {maxItems && inspections.length > maxItems && ` (affichage des ${maxItems} premières)`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {inspections.length === 0 
                ? "Aucune inspection planifiée"
                : "Aucune inspection ne correspond aux filtres"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInspections.map((inspection) => {
              const timeRemaining = getTimeRemaining(inspection.scheduledDate);
              const statusColors = getStatusColors(inspection.status);
              const StatusIcon = getStatusIcon(inspection.status);
              const priorityColors = priorityConfig[inspection.priority];
              
              return (
                <div
                  key={inspection.id}
                  onClick={() => onInspectionClick?.(inspection.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    onInspectionClick ? 'cursor-pointer' : ''
                  } ${statusColors.borderColor} ${
                    inspection.status === 'OVERDUE' ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar véhicule */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {inspection.vehicleImage ? (
                          <img 
                            src={inspection.vehicleImage} 
                            alt={inspection.vehicleName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Car className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      
                      {/* Informations principales */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {inspection.vehicleName}
                          </h4>
                          {inspection.vehiclePlate && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {inspection.vehiclePlate}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {inspection.inspectorName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(inspection.scheduledDate)}
                          </div>
                          {inspection.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {inspection.location}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-600">
                            {inspection.templateName}
                          </span>
                          {inspection.estimatedDuration && (
                            <span className="text-xs text-gray-500">
                              • {inspection.estimatedDuration}min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions et statut */}
                    <div className="flex items-center space-x-3">
                      {/* Priorité */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors.bg} ${priorityColors.color}`}>
                        {priorityColors.label}
                      </span>
                      
                      {/* Statut */}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors.bgColor} ${statusColors.textColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusColors.label}
                      </div>
                      
                      {/* Temps restant */}
                      <div className={`text-right ${timeRemaining.isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                        <div className="text-xs font-medium">
                          {timeRemaining.text}
                        </div>
                      </div>
                      
                      {/* Flèche */}
                      {onInspectionClick && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alertes critiques */}
      {displaySummary.overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-red-900">
                Attention : Inspections en retard
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {displaySummary.overdueCount} inspection{displaySummary.overdueCount > 1 ? 's' : ''} 
                {displaySummary.overdueCount > 1 ? 'sont' : 'est'} en retard et nécessitent une attention immédiate.
              </p>
            </div>
          </div>
        </div>
      )}

      {displaySummary.criticalCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-orange-900">
                Inspections critiques
              </h4>
              <p className="text-sm text-orange-700 mt-1">
                {displaySummary.criticalCount} inspection{displaySummary.criticalCount > 1 ? 's' : ''} 
                critique{displaySummary.criticalCount > 1 ? 's' : ''} planifiée{displaySummary.criticalCount > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}