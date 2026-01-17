'use client';

import React, { useEffect } from 'react';
import {
  ClipboardList,
  Calendar,
  History,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInspectionDashboard } from '@/lib/hooks/useInspectionDashboard';
import { useInspections } from '@/lib/hooks/useInspections';
import { useInspectionTemplates } from '@/lib/hooks/useInspectionTemplates';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function InspectionsHubPage() {
  const router = useRouter();
  const { data: dashboardData, loading: dashboardLoading } = useInspectionDashboard();
  const { inspections: recentInspections, loading: inspectionsLoading, fetchInspections } = useInspections({
    limit: 5,
    status: 'COMPLETED',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { pagination: templatesPagination, loading: templatesLoading, fetchTemplates } = useInspectionTemplates({
    limit: 1
  });


  const metrics = dashboardData?.metrics;

  const navigationCards = [
    {
      title: 'Historique',
      description: 'Consultez les inspections passées et les rapports détaillés.',
      icon: History,
      path: '/inspections/history',
      color: 'bg-blue-50 text-blue-600',
      stats: `${metrics?.completedInspections || 0} terminées`
    },
    {
      title: 'Planifications',
      description: 'Gérez et organisez les inspections à venir.',
      icon: Calendar,
      path: '/inspections/schedules',
      color: 'bg-purple-50 text-purple-600',
      stats: `${metrics?.scheduledInspections || 0} à venir`
    },
    {
      title: 'Formulaires',
      description: 'Créez et personnalisez vos modèles d\'inspection.',
      icon: ClipboardList,
      path: '/inspections/forms',
      color: 'bg-green-50 text-green-600',
      stats: `${templatesPagination?.totalCount || 0} modèles actifs`
    }
  ];

  const isLoading = dashboardLoading || inspectionsLoading || templatesLoading;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Inspections</h1>
          <p className="text-gray-500 mt-2 text-lg">Gérez la conformité et la sécurité de votre flotte.</p>
        </div>
        <button
          onClick={() => router.push('/inspections/history/create')}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-900/10 active:scale-95"
        >
          <Plus size={20} /> Planifier une Inspection
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-[#008751] animate-spin" />
          <p className="text-gray-500 font-medium">Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Taux de Conformité</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.complianceRate ? `${Math.round(metrics.complianceRate)}%` : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inspections en cours</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.inProgressInspections || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">En retard</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.overdueInspections || 0}</p>
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            {navigationCards.map((card) => (
              <button
                key={card.path}
                onClick={() => router.push(card.path)}
                className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon size={32} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h2>
                <p className="text-gray-500 leading-relaxed mb-6">{card.description}</p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold text-gray-400">{card.stats}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#008751] group-hover:text-white transition-colors duration-300">
                    <ChevronRight size={20} />
                  </div>
                </div>

                {/* Subtle background decoration */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Activité Récente</h3>
            <div className="space-y-4">
              {recentInspections.length > 0 ? (
                recentInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/inspections/history/${inspection.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 italic font-bold">
                        {inspection.vehicle?.name?.substring(0, 2).toUpperCase() || 'V'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{inspection.title || inspection.inspectionTemplate?.name}</p>
                        <p className="text-xs text-gray-500">
                          Terminée par {inspection.inspectorName || inspection.user?.name || 'Inconnu'} • {inspection.createdAt ? formatDistanceToNow(new Date(inspection.createdAt), { addSuffix: true, locale: fr }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof inspection.overallScore === 'number' && (
                        <span className="text-sm font-bold text-gray-600">{Math.round(inspection.overallScore)}%</span>
                      )}
                      <span className={`text-xs font-bold px-2 py-1 rounded ${inspection.complianceStatus === 'COMPLIANT'
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-50'
                        }`}>
                        {inspection.complianceStatus === 'COMPLIANT' ? 'CONFORME' : 'NON CONFORME'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Aucune activité récente trouvée.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}