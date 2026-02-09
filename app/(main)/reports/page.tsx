'use client';

import React, { useState } from 'react';
import { Search, FileText, Star, Save, Share2, LayoutGrid, List as ListIcon, ChevronDown, Car, Wrench, AlertTriangle, Users, Box, Fuel, ClipboardCheck, ArrowUpDown, Play, Download, Heart, Settings, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useReports,
  useReportTemplates,
  useGenerateReport,
  useFavoriteReport,
  useShareReport,
  useExportReport
} from '@/lib/hooks/useReports';
import { ReportConfig } from '@/types/reports';

const REPORT_CATEGORY_LABELS: Record<string, string> = {
  Vehicles: 'Véhicules',
  Service: 'Entretien',
  Fuel: 'Carburant',
  Issues: 'Problèmes',
  Inspections: 'Inspections',
  Contacts: 'Contacts',
  Parts: 'Pièces',
  Custom: 'Personnalisé',
};

function reportCategoryLabel(category: string | undefined) {
  if (!category) return REPORT_CATEGORY_LABELS.Custom;
  return REPORT_CATEGORY_LABELS[category] ?? category;
}

interface ReportCardProps {
  report: any;
  onGenerate: (template: string) => void;
  onToggleFavorite: (id: string) => void;
  onExport: (id: string, format: string) => void;
  onShare: (id: string) => void;
  viewMode: 'grid' | 'list';
}

function ReportCard({ report, onGenerate, onToggleFavorite, onExport, onShare, viewMode }: ReportCardProps) {
  return (
    <div
      data-testid="report-card"
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:border-[#008751] hover:shadow-md transition-all cursor-pointer flex flex-col ${viewMode === 'grid' ? 'p-6 h-full' : 'p-4 flex-row items-center gap-4'
        }`}>
      {viewMode === 'grid' ? (
        <>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900 flex-1" data-testid="report-name">{report.name || report.title}</h3>
            <div className="flex gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(report.id || report.template);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Ajouter aux favoris"
                data-testid="favorite-button"
              >
                <Heart size={16} className="text-gray-400 hover:text-red-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(report.id || report.template);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Partager"
                aria-label="Partager"
              >
                <Share2 size={16} className="text-gray-400 hover:text-blue-500" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4 flex-1">{report.description}</p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-semibold">{reportCategoryLabel(report.category)}</span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate(report.template);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-[#008751] text-white text-xs rounded hover:bg-[#006639]"
                title="Générer le rapport"
                data-testid="generate-button"
              >
                <Play size={12} />
                Générer
              </button>
              {report.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(report.id, 'csv');
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  title="Exporter CSV"
                >
                  <Download size={12} />
                  CSV
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900">{report.name || report.title}</h3>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(report.id || report.template);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Ajouter aux favoris"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart size={14} className="text-gray-400 hover:text-red-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerate(report.template);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Générer le rapport"
                  aria-label="Générer le rapport"
                >
                  <Play size={14} className="text-gray-400 hover:text-green-500" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{report.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-semibold">{reportCategoryLabel(report.category)}</span>
            {report.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExport(report.id, 'csv');
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Exporter CSV"
                aria-label="Exporter CSV"
              >
                <Download size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'standard' | 'favorites' | 'saved' | 'shared'>('standard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Hooks pour les APIs
  const {
    reports,
    loading: reportsLoading,
    error: reportsError,
    pagination,
    refetch: refetchReports
  } = useReports({
    category: selectedCategory || undefined,
    favorites: activeTab === 'favorites',
    saved: activeTab === 'saved',
    shared: activeTab === 'shared',
    search: searchTerm || undefined
  });

  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useReportTemplates();

  const { generateReport, loading: generateLoading } = useGenerateReport();
  const { toggleFavorite, loading: favoriteLoading } = useFavoriteReport();
  const { exportReport, loading: exportLoading } = useExportReport();
  const { shareReport, loading: shareLoading } = useShareReport();

  // Combiner les templates et les rapports sauvegardés
  const allReports = React.useMemo(() => {
    const templateReports = Object.values(templates).flat().map((template: any) => ({
      ...template,
      isTemplate: true,
      name: template.name || template.title,
      description: template.description || template.desc,
      category: template.category || 'Custom'
    }));

    const savedReports = reports.filter((report: any) => report.isSaved);

    return [...templateReports, ...savedReports];
  }, [templates, reports]);

  // Filtrer les rapports selon la recherche et la catégorie
  const filteredReports = allReports.filter(report => {
    const matchesSearch = !searchTerm ||
      (report.name || report.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory ||
      report.category === selectedCategory ||
      (selectedCategory === 'Vehicles' && report.category === 'Vehicles') ||
      (selectedCategory === 'Service' && report.category === 'Service') ||
      (selectedCategory === 'Fuel' && report.category === 'Fuel') ||
      (selectedCategory === 'Issues' && report.category === 'Issues') ||
      (selectedCategory === 'Inspections' && report.category === 'Inspections') ||
      (selectedCategory === 'Contacts' && report.category === 'Contacts') ||
      (selectedCategory === 'Parts' && report.category === 'Parts')

    return matchesSearch && matchesCategory
  });

  // Fonction pour générer un rapport
  const handleGenerateReport = async (template: string) => {
    setIsGenerating(true);
    try {
      const config: ReportConfig = {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 derniers jours
          end: new Date().toISOString().split('T')[0]
        },
        filters: {},
        includeCharts: true,
        includeSummary: true
      };

      const result = await generateReport(template, config, true, `Rapport ${template}`, 'Rapport généré automatiquement');

      if (result) {
        // Rafraîchir la liste des rapports
        refetchReports();
        alert('Rapport généré et sauvegardé avec succès!');
      }
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour basculer les favoris
  const handleToggleFavorite = async (reportId: string) => {
    try {
      await toggleFavorite(reportId);
      refetchReports();
    } catch (error) {
      console.error('Erreur favori:', error);
      alert('Erreur lors de la gestion des favoris');
    }
  };

  // Fonction pour exporter un rapport
  const handleExport = async (reportId: string, format: string) => {
    try {
      const blob = await exportReport(reportId, format as 'pdf' | 'excel' | 'csv');
      if (blob) {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `rapport-${reportId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export du rapport');
    }
  };

  // Fonction pour partager un rapport
  const handleShare = async (reportId: string) => {
    const email = prompt('Entrez l\'email de la personne avec qui partager:');
    if (email) {
      try {
        await shareReport(reportId, email, 'view');
        alert('Rapport partagé avec succès!');
      } catch (error) {
        console.error('Erreur partage:', error);
        alert('Erreur lors du partage du rapport');
      }
    }
  };

  // Catégories avec compteurs
  const reportCategories = [
    { id: 'Vehicles', name: 'Véhicules', icon: Car, count: templates['Vehicles']?.length || 0 },
    { id: 'Service', name: 'Entretien', icon: Wrench, count: templates['Service']?.length || 0 },
    { id: 'Fuel', name: 'Carburant', icon: Fuel, count: templates['Fuel']?.length || 0 },
    { id: 'Issues', name: 'Problèmes', icon: AlertTriangle, count: templates['Issues']?.length || 0 },
    { id: 'Inspections', name: 'Inspections', icon: ClipboardCheck, count: templates['Inspections']?.length || 0 },
    { id: 'Contacts', name: 'Contacts', icon: Users, count: templates['Contacts']?.length || 0 },
    { id: 'Parts', name: 'Pièces', icon: Box, count: templates['Parts']?.length || 0 },
  ];

  const tabs = [
    { id: 'standard', name: 'Rapports standards', icon: FileText },
    { id: 'favorites', name: 'Favoris', icon: Star, count: reports.filter((r: any) => r.isFavorite).length },
    { id: 'saved', name: 'Enregistrés', icon: Save, count: reports.filter((r: any) => r.isSaved).length },
    { id: 'shared', name: 'Partagés', icon: Share2, count: 0 }, // À implémenter
  ];

  const isLoading = reportsLoading || templatesLoading || generateLoading;

  return (
    <div className="flex h-full bg-[#f9fafb]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto hidden md:block">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un rapport"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
              data-testid="search-reports-input"
            />
          </div>
        </div>

        <nav className="space-y-1 px-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium border-l-4 transition-colors ${isActive
                  ? 'bg-green-50 text-[#008751] border-[#008751]'
                  : 'text-gray-600 hover:bg-gray-50 border-transparent'
                  }`}
                data-testid={`nav-tab-${tab.id}`}
              >
                <span className="flex items-center gap-2"><Icon size={16} /> {tab.name}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Types de rapports</h3>
            <button
              onClick={refetchTemplates}
              className="p-1 hover:bg-gray-100 rounded"
              title="Rafraîchir"
              aria-label="Rafraîchir"
            >
              <RefreshCw size={12} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-1">
            {reportCategories.map(category => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className={`w-full flex items-center justify-between py-1.5 text-sm transition-colors ${isSelected ? 'text-[#008751] bg-green-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  data-testid={`category-filter-${category.id}`}
                >
                  <span className="flex items-center gap-2"><Icon size={14} /> {category.name}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{category.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">Rapports</h1>
            {isGenerating && (
              <p className="text-sm text-blue-600 mt-1" data-testid="generating-indicator">Génération d'un rapport en cours...</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
              <ArrowUpDown size={14} /> Nom <ChevronDown size={14} />
            </button>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 hover:bg-gray-200 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                data-testid="view-grid"
                title="Vue en grille"
                aria-label="Vue en grille"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                data-testid="view-list"
                title="Vue en liste"
                aria-label="Vue en liste"
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {(reportsError || templatesError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" data-testid="error-message">
            <p className="text-red-800">Erreur: {reportsError || templatesError}</p>
            <button
              onClick={() => { refetchReports(); refetchTemplates(); }}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12" data-testid="loading-state">
            <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
            <p className="text-gray-500">Chargement des rapports...</p>
          </div>
        )}

        {/* Reports Grid/List */}
        {!isLoading && (
          <div
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
            data-testid={viewMode === 'grid' ? 'reports-grid' : 'reports-list'}
          >
            {filteredReports.map(report => (
              <ReportCard
                key={report.id || report.template}
                report={report}
                onGenerate={handleGenerateReport}
                onToggleFavorite={handleToggleFavorite}
                onExport={handleExport}
                onShare={handleShare}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredReports.length === 0 && (
          <div className="text-center py-12" data-testid="empty-state">
            <FileText className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Aucun rapport trouvé pour votre recherche.' : 'Aucun rapport disponible.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#008751] hover:text-[#006639] underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              data-testid="pagination-prev"
            >
              Précédent
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasMore}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              data-testid="pagination-next"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
