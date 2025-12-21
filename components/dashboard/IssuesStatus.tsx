"use client";

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Bug, Car, User, Calendar } from 'lucide-react';
import MetricCard from './MetricCard';
import StatusGauge, { SimpleStatus } from './StatusGauge';

interface IssuesSummary {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  criticalIssues: number;
  averageResolutionTime: number; // en heures
  issuesThisMonth: number;
  complianceRate: number; // % d'issues résolues dans les temps
}

interface Issue {
  id: string;
  summary: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vehicle?: {
    name: string;
    make: string;
    model: string;
  };
  assignedTo?: {
    name: string;
  };
  reportedDate: string;
  updatedAt: string;
}

interface IssuesStatusProps {
  summary: IssuesSummary;
  recentIssues: Issue[];
  criticalIssues: Issue[];
  status: {
    healthy: boolean;
    warning: boolean;
    critical: boolean;
  };
  loading?: boolean;
  className?: string;
}

export default function IssuesStatus({
  summary,
  recentIssues,
  criticalIssues,
  status,
  loading = false,
  className = ''
}: IssuesStatusProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    } else {
      const days = Math.round(hours / 24);
      return `${days}j`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-red-600 bg-red-50';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'CLOSED': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'IN_PROGRESS': return 'En cours';
      case 'RESOLVED': return 'Résolu';
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'Critique';
      case 'HIGH': return 'Haute';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Faible';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="issues-status">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Problèmes Totaux"
          value={summary.totalIssues}
          icon={Bug}
          color="blue"
          subtitle="Issues ouvertes"
          data-testid="issues-total"
        />

        <MetricCard
          title="En Cours"
          value={summary.inProgressIssues}
          icon={Clock}
          color="yellow"
          subtitle="En traitement"
          data-testid="issues-in-progress"
        />

        <MetricCard
          title="Critiques"
          value={summary.criticalIssues}
          icon={AlertTriangle}
          color="red"
          subtitle="Action urgente"
          data-testid="issues-critical"
        />

        <MetricCard
          title="Temps Moyen"
          value={formatTime(summary.averageResolutionTime)}
          icon={CheckCircle}
          color="green"
          subtitle="Résolution"
        />
      </div>

      {/* Jauge de statut général */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">État Général des Problèmes</h3>
          {status.healthy && <CheckCircle className="text-green-500" size={24} />}
          {status.warning && <Clock className="text-yellow-500" size={24} />}
          {status.critical && <AlertTriangle className="text-red-500" size={24} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <StatusGauge
              title="Taux de Résolution"
              value={summary.complianceRate}
              color={summary.complianceRate >= 80 ? 'green' : summary.complianceRate >= 60 ? 'yellow' : 'red'}
              icon={CheckCircle}
              size="lg"
            />
          </div>

          <div className="space-y-3">
            <SimpleStatus
              status="healthy"
              title="Résolus"
              count={summary.resolvedIssues}
            />
            <SimpleStatus
              status="warning"
              title="En cours"
              count={summary.inProgressIssues}
            />
            <SimpleStatus
              status="critical"
              title="Ouverts"
              count={summary.openIssues}
            />
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {summary.issuesThisMonth}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Ce mois
            </div>
            <Bug className="text-gray-400 mx-auto" size={32} />
          </div>
        </div>
      </div>

      {/* Problèmes critiques et récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problèmes critiques */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                Problèmes Critiques
              </h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {criticalIssues.length}
              </span>
            </div>
          </div>

          <div className="p-6">
            {criticalIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
                <p className="text-gray-600">Aucun problème critique !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalIssues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {issue.summary}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        {issue.vehicle && (
                          <>
                            <Car size={14} className="mr-1" />
                            {issue.vehicle.name} ({issue.vehicle.make})
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                        {getPriorityLabel(issue.priority)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(issue.reportedDate)}
                      </div>
                    </div>
                  </div>
                ))}

                {criticalIssues.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Voir tous les {criticalIssues.length} problèmes critiques
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Problèmes récents */}
        <div className="bg-white rounded-lg border border-gray-200" data-testid="recent-issues">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="text-blue-500 mr-2" size={20} />
                Problèmes Récents
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {recentIssues.length}
              </span>
            </div>
          </div>

          <div className="p-6">
            {recentIssues.length === 0 ? (
              <div className="text-center py-8">
                <Bug className="text-gray-300 mx-auto mb-3" size={48} />
                <p className="text-gray-600">Aucun problème récent</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIssues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {issue.summary}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        {issue.vehicle && (
                          <>
                            <Car size={14} className="mr-1" />
                            {issue.vehicle.name} ({issue.vehicle.make})
                          </>
                        )}
                        {issue.assignedTo && (
                          <>
                            <User size={14} className="ml-3 mr-1" />
                            {issue.assignedTo.name}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                        {getStatusLabel(issue.status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(issue.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}

                {recentIssues.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Voir tous les {recentIssues.length} problèmes récents
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions recommandées */}
      {(status.warning || status.critical) && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <Bug className="mr-2" size={20} />
            Actions Recommandées
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status.critical && (
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 mr-3 mt-1" size={16} />
                <div>
                  <div className="font-medium text-red-900">
                    Traiter les problèmes critiques
                  </div>
                  <div className="text-sm text-red-700">
                    {summary.criticalIssues} problème{summary.criticalIssues > 1 ? 's' : ''} critique{summary.criticalIssues > 1 ? 's' : ''} en attente
                  </div>
                </div>
              </div>
            )}

            {status.warning && (
              <div className="flex items-start">
                <Clock className="text-yellow-500 mr-3 mt-1" size={16} />
                <div>
                  <div className="font-medium text-yellow-900">
                    Réduire le temps de résolution
                  </div>
                  <div className="text-sm text-yellow-700">
                    Temps moyen actuel: {formatTime(summary.averageResolutionTime)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1" size={16} />
              <div>
                <div className="font-medium text-green-900">
                  Améliorer le taux de résolution
                </div>
                <div className="text-sm text-green-700">
                  Objectif: 90% dans les délais
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}