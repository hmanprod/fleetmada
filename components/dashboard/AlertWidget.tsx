"use client";

import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, Clock, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertWidgetProps {
  alerts: Alert[];
  maxVisible?: number;
  onDismiss?: (id: string) => void;
  className?: string;
}

export default function AlertWidget({
  alerts,
  maxVisible = 5,
  onDismiss,
  className = ''
}: AlertWidgetProps) {

  const getAlertConfig = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-700'
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const visibleAlerts = alerts.slice(0, maxVisible);
  const hiddenAlertsCount = Math.max(0, alerts.length - maxVisible);

  if (alerts.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <CheckCircle className="text-green-500 mr-3" size={24} />
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Tout va bien !</h3>
              <p className="text-sm text-gray-600">Aucune alerte à signaler</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => {
        const config = getAlertConfig(alert.type);
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}
          >
            <div className="flex items-start">
              <Icon className={`${config.iconColor} mr-3 mt-0.5 flex-shrink-0`} size={20} />
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${config.titleColor}`}>
                  {alert.title}
                </h4>
                <p className={`text-sm ${config.messageColor} mt-1`}>
                  {alert.message}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatTimestamp(alert.timestamp)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {alert.action && (
                      <button
                        onClick={alert.action.onClick}
                        className={`text-xs font-medium ${config.titleColor} hover:underline`}
                      >
                        {alert.action.label}
                      </button>
                    )}
                    
                    {alert.dismissible && onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className={`text-xs ${config.messageColor} hover:opacity-75`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {hiddenAlertsCount > 0 && (
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Voir {hiddenAlertsCount} alerte{hiddenAlertsCount > 1 ? 's' : ''} supplémentaire{hiddenAlertsCount > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher un résumé des alertes dans une carte
interface AlertSummaryProps {
  alerts: Alert[];
  className?: string;
}

export function AlertSummary({ alerts, className = '' }: AlertSummaryProps) {
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalAlerts = alerts.filter(alert => 
    alert.type === 'error' || alert.type === 'warning'
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alertes Système</h3>
        <div className="flex items-center space-x-2">
          {alertCounts.error > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {alertCounts.error} erreur{alertCounts.error > 1 ? 's' : ''}
            </span>
          )}
          {alertCounts.warning > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {alertCounts.warning} attention
            </span>
          )}
          {alertCounts.info > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {alertCounts.info} info
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {criticalAlerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="flex items-center text-sm">
            <AlertTriangle 
              className={`mr-2 ${
                alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`} 
              size={16} 
            />
            <span className="text-gray-900 font-medium">{alert.title}</span>
            <span className="text-gray-500 ml-auto text-xs">
              {new Date(alert.timestamp).toLocaleDateString('fr-FR')}
            </span>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="text-green-500 mx-auto mb-2" size={24} />
            <p className="text-sm text-gray-600">Aucune alerte active</p>
          </div>
        )}
        
        {alerts.length > 3 && (
          <div className="text-center pt-2">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Voir toutes les alertes ({alerts.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook pour gérer les alertes
export function useAlerts() {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);

  const addAlert = React.useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const dismissAlert = React.useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    addAlert,
    dismissAlert,
    clearAllAlerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(alert => alert.type === 'error' || alert.type === 'warning')
  };
}