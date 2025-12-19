"use client";

import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  QrCode, 
  Camera, 
  MapPin,
  Settings,
  Filter,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { inspectionExportService } from '@/lib/services/inspection-export-service';

interface InspectionData {
  id: string;
  title: string;
  vehicleName: string;
  vehicleVin?: string;
  inspectorName: string;
  scheduledDate: Date;
  completedAt?: Date;
  status: string;
  overallScore?: number;
  complianceStatus: string;
  location?: string;
  notes?: string;
  items: Array<{
    name: string;
    category: string;
    status: string;
    value?: string;
    notes?: string;
  }>;
  results: Array<{
    resultValue: string;
    isCompliant: boolean;
    notes?: string;
  }>;
}

interface InspectionExportPanelProps {
  inspections: InspectionData[];
  selectedInspections?: string[];
  onExportComplete?: () => void;
  loading?: boolean;
  className?: string;
}

type ExportFormat = 'pdf' | 'csv';
type ExportTemplate = 'standard' | 'detailed' | 'summary';
type ExportScope = 'selected' | 'filtered' | 'all';

export default function InspectionExportPanel({
  inspections,
  selectedInspections = [],
  onExportComplete,
  loading = false,
  className = ''
}: InspectionExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [template, setTemplate] = useState<ExportTemplate>('standard');
  const [scope, setScope] = useState<ExportScope>('all');
  const [includePhotos, setIncludePhotos] = useState(false);
  const [includeResults, setIncludeResults] = useState(true);
  const [includeCompliance, setIncludeCompliance] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filtrer les inspections selon la portée sélectionnée
  const getInspectionsToExport = () => {
    switch (scope) {
      case 'selected':
        return inspections.filter(i => selectedInspections.includes(i.id));
      case 'filtered':
        // Ici on pourrait utiliser des filtres stockés dans l'état
        return inspections;
      case 'all':
      default:
        return inspections;
    }
  };

  // Gérer l'export
  const handleExport = async () => {
    setExporting(true);
    try {
      const inspectionsToExport = getInspectionsToExport();
      
      if (inspectionsToExport.length === 0) {
        alert('Aucune inspection à exporter');
        return;
      }

      const options = {
        format,
        includePhotos,
        includeResults,
        includeCompliance,
        template
      };

      const filename = `inspections-${scope}-${new Date().toISOString().split('T')[0]}`;

      await inspectionExportService.exportInspections(inspectionsToExport, options, filename);
      
      onExportComplete?.();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  // Générer QR code pour inspection
  const generateQRCode = (inspectionId: string) => {
    return inspectionExportService.generateInspectionQRCode(inspectionId);
  };

  // Statistiques pour l'aperçu
  const stats = {
    total: getInspectionsToExport().length,
    completed: getInspectionsToExport().filter(i => i.status === 'COMPLETED').length,
    averageScore: getInspectionsToExport()
      .filter(i => i.overallScore)
      .reduce((sum, i) => sum + (i.overallScore || 0), 0) / getInspectionsToExport().filter(i => i.overallScore).length || 0,
    compliant: getInspectionsToExport().filter(i => i.complianceStatus === 'COMPLIANT').length
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export et Rapports
        </h2>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          <Settings className="w-4 h-4" />
          Options avancées
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Aperçu des données */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu de l'export</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Inspections</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Complétées</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.averageScore)}%</div>
              <div className="text-sm text-gray-600">Score moyen</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.compliant}</div>
              <div className="text-sm text-gray-600">Conformes</div>
            </div>
          </div>
        </div>

        {/* Configuration de base */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Configuration de l'export</h3>
          
          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format de fichier
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  format === 'pdf'
                    ? 'border-[#008751] bg-[#008751] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  format === 'csv'
                    ? 'border-[#008751] bg-[#008751] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          {/* Portée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portée de l'export
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ExportScope)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            >
              <option value="all">Toutes les inspections</option>
              <option value="selected">Inspections sélectionnées ({selectedInspections.length})</option>
              <option value="filtered">Inspections filtrées</option>
            </select>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as ExportTemplate)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            >
              <option value="summary">Résumé</option>
              <option value="standard">Standard</option>
              <option value="detailed">Détaillé</option>
            </select>
          </div>
        </div>

        {/* Options avancées */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Options avancées</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="include-photos"
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
                <label htmlFor="include-photos" className="text-sm text-gray-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Inclure les photos
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="include-results"
                  checked={includeResults}
                  onChange={(e) => setIncludeResults(e.target.checked)}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
                <label htmlFor="include-results" className="text-sm text-gray-700 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Inclure les résultats détaillés
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="include-compliance"
                  checked={includeCompliance}
                  onChange={(e) => setIncludeCompliance(e.target.checked)}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
                <label htmlFor="include-compliance" className="text-sm text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Inclure les données de conformité
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {getInspectionsToExport().length} inspection(s) sélectionnée(s)
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting || loading || getInspectionsToExport().length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#008751] text-white rounded-lg hover:bg-[#007043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Export en cours...' : 'Exporter'}
          </button>
        </div>

        {/* QR Codes pour inspections individuelles */}
        {selectedInspections.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Accès rapide QR Codes</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {inspections
                .filter(i => selectedInspections.includes(i.id))
                .slice(0, 8)
                .map(inspection => (
                  <div key={inspection.id} className="text-center p-3 border border-gray-200 rounded-lg">
                    <div className="mb-2">
                      <img
                        src={generateQRCode(inspection.id)}
                        alt={`QR Code ${inspection.title}`}
                        className="w-20 h-20 mx-auto"
                      />
                    </div>
                    <div className="text-xs text-gray-600 truncate" title={inspection.title}>
                      {inspection.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {inspection.vehicleName}
                    </div>
                  </div>
                ))
              }
            </div>
            
            {selectedInspections.length > 8 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                +{selectedInspections.length - 8} autres inspections
              </div>
            )}
          </div>
        )}

        {/* Intégrations tierces */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Intégrations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Géolocalisation</span>
              </div>
              <p className="text-xs text-gray-600">
                Intégration avec systèmes de tracking GPS
              </p>
              <button className="mt-2 text-xs text-[#008751] hover:underline">
                Configurer
              </button>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Photos terrain</span>
              </div>
              <p className="text-xs text-gray-600">
                Upload et annotation d'images
              </p>
              <button className="mt-2 text-xs text-[#008751] hover:underline">
                Activer
              </button>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Signatures électroniques</span>
              </div>
              <p className="text-xs text-gray-600">
                Validation digitale des inspections
              </p>
              <button className="mt-2 text-xs text-[#008751] hover:underline">
                Configurer
              </button>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Synchronisation calendrier</span>
              </div>
              <p className="text-xs text-gray-600">
                Export vers Google/Outlook Calendar
              </p>
              <button className="mt-2 text-xs text-[#008751] hover:underline">
                Connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}