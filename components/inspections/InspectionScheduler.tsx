"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Repeat, 
  Bell, 
  Settings, 
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface ScheduledInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  templateId: string;
  templateName: string;
  frequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually' | 'custom';
  interval: number; // pour fréquence personnalisée
  nextDue: Date;
  isActive: boolean;
  createdAt: Date;
  watchers: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  notifications: {
    daysBefore: number;
    enabled: boolean;
  };
}

interface InspectionSchedulerProps {
  vehicleId?: string;
  onScheduleCreate?: (schedule: Partial<ScheduledInspection>) => void;
  onScheduleUpdate?: (id: string, schedule: Partial<ScheduledInspection>) => void;
  onScheduleDelete?: (id: string) => void;
  existingSchedules?: ScheduledInspection[];
  loading?: boolean;
  className?: string;
}

const frequencyConfig = {
  monthly: {
    label: 'Mensuel',
    interval: 1,
    description: 'Inspection chaque mois',
    icon: Calendar
  },
  quarterly: {
    label: 'Trimestriel',
    interval: 3,
    description: 'Inspection tous les 3 mois',
    icon: Calendar
  },
  'bi-annually': {
    label: 'Semestriel',
    interval: 6,
    description: 'Inspection tous les 6 mois',
    icon: Calendar
  },
  annually: {
    label: 'Annuel',
    interval: 12,
    description: 'Inspection chaque année',
    icon: Calendar
  },
  custom: {
    label: 'Personnalisé',
    interval: 1,
    description: 'Fréquence personnalisable',
    icon: Settings
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

export default function InspectionScheduler({
  vehicleId,
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete,
  existingSchedules = [],
  loading = false,
  className = ''
}: InspectionSchedulerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduledInspection[]>(existingSchedules);
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    templateId: '',
    frequency: 'monthly' as keyof typeof frequencyConfig,
    interval: 1,
    priority: 'medium' as keyof typeof priorityConfig,
    watchers: [] as string[],
    notifications: {
      daysBefore: 7,
      enabled: true
    }
  });

  // Mettre à jour les schedules quand les props changent
  useEffect(() => {
    setSchedules(existingSchedules);
  }, [existingSchedules]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      vehicleId: vehicleId || '',
      templateId: '',
      frequency: 'monthly',
      interval: 1,
      priority: 'medium',
      watchers: [],
      notifications: {
        daysBefore: 7,
        enabled: true
      }
    });
    setEditingSchedule(null);
  };

  // Ouvrir le formulaire de création
  const handleCreate = () => {
    resetForm();
    setShowCreateForm(true);
  };

  // Ouvrir le formulaire d'édition
  const handleEdit = (schedule: ScheduledInspection) => {
    setFormData({
      vehicleId: schedule.vehicleId,
      templateId: schedule.templateId,
      frequency: schedule.frequency,
      interval: schedule.interval,
      priority: schedule.priority,
      watchers: schedule.watchers,
      notifications: schedule.notifications
    });
    setEditingSchedule(schedule.id);
    setShowCreateForm(true);
  };

  // Fermer le formulaire
  const handleClose = () => {
    setShowCreateForm(false);
    resetForm();
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData = {
      ...formData,
      nextDue: calculateNextDue(formData.frequency, formData.interval)
    };

    if (editingSchedule) {
      onScheduleUpdate?.(editingSchedule, scheduleData);
    } else {
      onScheduleCreate?.(scheduleData);
    }

    handleClose();
  };

  // Calculer la prochaine date d'échéance
  const calculateNextDue = (frequency: string, interval: number): Date => {
    const now = new Date();
    const nextDue = new Date(now);

    switch (frequency) {
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + interval);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + (3 * interval));
        break;
      case 'bi-annually':
        nextDue.setMonth(nextDue.getMonth() + (6 * interval));
        break;
      case 'annually':
        nextDue.setFullYear(nextDue.getFullYear() + interval);
        break;
      case 'custom':
        nextDue.setMonth(nextDue.getMonth() + interval);
        break;
      default:
        nextDue.setMonth(nextDue.getMonth() + 1);
    }

    return nextDue;
  };

  // Formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtenir le nombre de jours restants
  const getDaysRemaining = (nextDue: Date) => {
    const now = new Date();
    const diffTime = nextDue.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          Planification Automatique
        </h2>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-3 py-2 bg-[#008751] text-white rounded-lg hover:bg-[#007043] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle planification
        </button>
      </div>

      {/* Liste des planifications */}
      <div className="p-4">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune planification automatique</p>
            <p className="text-sm mt-1">Créez une planification pour les inspections récurrentes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => {
              const freqConfig = frequencyConfig[schedule.frequency];
              const priorityConf = priorityConfig[schedule.priority];
              const daysRemaining = getDaysRemaining(schedule.nextDue);
              const FreqIcon = freqConfig.icon;
              
              return (
                <div
                  key={schedule.id}
                  className={`border rounded-lg p-4 ${schedule.isActive ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${priorityConf.bg}`}>
                        <FreqIcon className={`w-4 h-4 ${priorityConf.color}`} />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {schedule.templateName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {schedule.vehicleName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {freqConfig.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConf.bg} ${priorityConf.color}`}>
                          {priorityConf.label}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900">
                        Prochaine: {formatDate(schedule.nextDue)}
                      </p>
                      
                      <p className={`text-xs ${
                        daysRemaining < 0 ? 'text-red-600' :
                        daysRemaining <= 7 ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)} jour(s) de retard`
                          : `${daysRemaining} jour(s) restant(s)`
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onScheduleDelete?.(schedule.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Alertes */}
                  {daysRemaining < 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-800">
                          Inspection en retard - Action requise
                        </span>
                      </div>
                    </div>
                  )}

                  {daysRemaining <= 7 && daysRemaining >= 0 && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-800">
                          Inspection à prévoir bientôt
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* En-tête du modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSchedule ? 'Modifier la planification' : 'Nouvelle planification'}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu du modal */}
              <div className="p-4 space-y-4">
                {/* Fréquence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => {
                      const freq = e.target.value as keyof typeof frequencyConfig;
                      setFormData({
                        ...formData,
                        frequency: freq,
                        interval: frequencyConfig[freq].interval
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
                    required
                  >
                    {Object.entries(frequencyConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intervalle (pour fréquence personnalisée) */}
                {formData.frequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalle (mois)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={formData.interval}
                      onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as keyof typeof priorityConfig })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
                    required
                  >
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Notifications
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifications-enabled"
                      checked={formData.notifications.enabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, enabled: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                    <label htmlFor="notifications-enabled" className="text-sm text-gray-700">
                      Activer les notifications
                    </label>
                  </div>

                  {formData.notifications.enabled && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Avertir (jours avant)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.notifications.daysBefore}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: { ...formData.notifications, daysBefore: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Aperçu de la prochaine échéance */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Prochaine inspection prévue:
                  </h4>
                  <p className="text-sm text-gray-900">
                    {formatDate(calculateNextDue(formData.frequency, formData.interval))}
                  </p>
                </div>
              </div>

              {/* Actions du modal */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-[#008751] text-white rounded-lg hover:bg-[#007043] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingSchedule ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}