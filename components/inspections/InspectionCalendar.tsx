"use client";

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  MapPin,
  User
} from 'lucide-react';

interface InspectionEvent {
  id: string;
  title: string;
  date: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  vehicleName: string;
  vehicleId: string;
  inspectorName: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complianceScore?: number;
}

interface InspectionCalendarProps {
  inspections: InspectionEvent[];
  onDateSelect?: (date: Date) => void;
  onInspectionClick?: (inspectionId: string) => void;
  onCreateInspection?: (date?: Date) => void;
  loading?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
}

const statusConfig = {
  SCHEDULED: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    label: 'Planifiée'
  },
  IN_PROGRESS: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    label: 'En cours'
  },
  COMPLETED: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: 'Terminée'
  },
  OVERDUE: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
    label: 'En retard'
  }
};

const priorityConfig = {
  low: { color: 'border-gray-400', bg: 'bg-gray-50' },
  medium: { color: 'border-blue-400', bg: 'bg-blue-50' },
  high: { color: 'border-orange-400', bg: 'bg-orange-50' },
  critical: { color: 'border-red-400', bg: 'bg-red-50' }
};

// Fonctions utilitaires pour les dates
const formatDate = (date: Date, format: string) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'dd MMMM yyyy':
      const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      return `${day} ${months[date.getMonth()]} ${year}`;
    case 'MMMM yyyy':
      const monthsLong = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      return `${monthsLong[date.getMonth()]} ${year}`;
    case 'd':
      return day;
    default:
      return date.toISOString().split('T')[0];
  }
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const isSameMonth = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth();
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const subMonths = (date: Date, months: number) => {
  return addMonths(date, -months);
};

const startOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const eachDayOfInterval = (start: Date, end: Date) => {
  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

export default function InspectionCalendar({
  inspections,
  onDateSelect,
  onInspectionClick,
  onCreateInspection,
  loading = false,
  showFilters = true,
  maxHeight = '600px'
}: InspectionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Calculer les jours à afficher
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval(monthStart, monthEnd);

  // Filtrer les inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || inspection.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [inspections, statusFilter, priorityFilter]);

  // Grouper les inspections par date
  const inspectionsByDate = useMemo(() => {
    const grouped: Record<string, InspectionEvent[]> = {};

    filteredInspections.forEach(inspection => {
      const dateKey = formatDate(inspection.date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(inspection);
    });

    return grouped;
  }, [filteredInspections]);

  // Obtenir les inspections pour une date donnée
  const getInspectionsForDate = (date: Date) => {
    const dateKey = formatDate(date, 'yyyy-MM-dd');
    return inspectionsByDate[dateKey] || [];
  };

  // Navigation calendrier
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  // Sélection de date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // Navigation clavier
  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDateClick(date);
    }
  };

  // Formater l'affichage d'une inspection
  const renderInspection = (inspection: InspectionEvent) => {
    const statusConf = statusConfig[inspection.status];
    const priorityConf = priorityConfig[inspection.priority];
    const StatusIcon = statusConf.icon;

    return (
      <div
        key={inspection.id}
        onClick={() => onInspectionClick?.(inspection.id)}
        className={`
          text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-all
          ${statusConf.color} ${priorityConf.bg}
        `}
        style={{ borderLeftWidth: '3px', borderLeftColor: priorityConf.color.split(' ')[1] }}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium truncate" title={inspection.title}>
            {inspection.title}
          </span>
          <StatusIcon className="w-3 h-3 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
          <User className="w-3 h-3" />
          <span className="truncate">{inspection.inspectorName}</span>
        </div>
        {inspection.location && (
          <div className="flex items-center gap-1 text-xs opacity-75">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{inspection.location}</span>
          </div>
        )}
        {inspection.complianceScore && (
          <div className="text-xs mt-1">
            Score: {inspection.complianceScore}%
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200" style={{ maxHeight }}>
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendrier des Inspections
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-medium text-gray-900 min-w-[120px] text-center">
              {formatDate(currentDate, 'MMMM yyyy')}
            </span>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton nouvelle inspection */}
          <button
            onClick={() => onCreateInspection?.(selectedDate || new Date())}
            className="flex items-center gap-2 px-3 py-2 bg-[#008751] text-white rounded-lg hover:bg-[#007043] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Planifier une Inspection
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="SCHEDULED">Planifiées</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminées</option>
              <option value="OVERDUE">En retard</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            >
              <option value="all">Toutes priorités</option>
              <option value="critical">Critique</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </div>
      )}

      {/* Grille du calendrier */}
      <div className="p-4">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const dayInspections = getInspectionsForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = isSameMonth(date, currentDate);

            return (
              <div
                key={date.toISOString()}
                className={`
                  min-h-[100px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all
                  ${isSelected ? 'ring-2 ring-[#008751] bg-green-50' : 'hover:bg-gray-50'}
                  ${!isCurrentMonth ? 'opacity-50 bg-gray-25' : 'bg-white'}
                  ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                `}
                onClick={() => handleDateClick(date)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                tabIndex={0}
                role="button"
                aria-label={`${formatDate(date, 'dd MMMM yyyy')} - ${dayInspections.length} inspection(s)`}
              >
                {/* Numéro du jour */}
                <div className={`
                  text-sm font-medium mb-1
                  ${isToday ? 'text-blue-600 font-bold' : 'text-gray-900'}
                  ${!isCurrentMonth ? 'text-gray-400' : ''}
                `}>
                  {formatDate(date, 'd')}
                </div>

                {/* Inspections du jour */}
                <div className="space-y-1">
                  {dayInspections.slice(0, 3).map(renderInspection)}
                  {dayInspections.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayInspections.length - 3} autre{dayInspections.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panneau latéral avec détails du jour sélectionné */}
      {selectedDate && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">
            Inspections du {formatDate(selectedDate, 'dd MMMM yyyy')}
          </h3>

          <div className="space-y-2">
            {getInspectionsForDate(selectedDate).length > 0 ? (
              getInspectionsForDate(selectedDate).map((inspection) => {
                const statusConf = statusConfig[inspection.status];
                const StatusIcon = statusConf.icon;

                return (
                  <div
                    key={inspection.id}
                    onClick={() => onInspectionClick?.(inspection.id)}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusConf.color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{inspection.title}</h4>
                        <p className="text-sm text-gray-600">{inspection.vehicleName}</p>
                        <p className="text-xs text-gray-500">{inspection.inspectorName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${statusConf.color}
                      `}>
                        {statusConf.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune inspection prévue</p>
                <button
                  onClick={() => onCreateInspection?.(selectedDate)}
                  className="mt-2 text-sm text-[#008751] hover:underline"
                >
                  Planifier une inspection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Légende:</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(statusConfig).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <StatusIcon className="w-3 h-3" />
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}