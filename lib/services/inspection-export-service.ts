"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

interface ExportOptions {
  format: 'pdf' | 'csv';
  includePhotos?: boolean;
  includeResults?: boolean;
  includeCompliance?: boolean;
  template?: 'standard' | 'detailed' | 'summary';
}

class InspectionExportService {
  
  // Export PDF
  async exportToPDF(inspections: InspectionData[], options: ExportOptions = { format: 'pdf' }): Promise<Blob> {
    const doc = new jsPDF();
    
    // Configuration
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(0, 135, 81); // Couleur FleetMada
    doc.text('Rapport d\'Inspections', margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
    yPosition += 10;
    
    // Résumé
    const totalInspections = inspections.length;
    const completedInspections = inspections.filter(i => i.status === 'COMPLETED').length;
    const averageScore = inspections
      .filter(i => i.overallScore)
      .reduce((sum, i) => sum + (i.overallScore || 0), 0) / inspections.filter(i => i.overallScore).length || 0;
    
    doc.text(`Total: ${totalInspections} inspections`, margin, yPosition);
    yPosition += 6;
    doc.text(`Complétées: ${completedInspections}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Score moyen: ${Math.round(averageScore)}%`, margin, yPosition);
    yPosition += 20;
    
    // Détail des inspections
    for (const inspection of inspections) {
      // Nouvelle page si nécessaire
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }
      
      // Titre de l'inspection
      doc.setFontSize(14);
      doc.setTextColor(0, 135, 81);
      doc.text(inspection.title, margin, yPosition);
      yPosition += 10;
      
      // Informations générales
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const generalInfo = [
        `Véhicule: ${inspection.vehicleName}`,
        `Inspecteur: ${inspection.inspectorName}`,
        `Date prévue: ${inspection.scheduledDate.toLocaleDateString('fr-FR')}`,
        ...(inspection.completedAt ? [`Date complétée: ${inspection.completedAt.toLocaleDateString('fr-FR')}`] : []),
        `Statut: ${inspection.status}`,
        ...(inspection.overallScore ? [`Score: ${inspection.overallScore}%`] : []),
        `Conformité: ${inspection.complianceStatus}`,
        ...(inspection.location ? [`Localisation: ${inspection.location}`] : [])
      ];
      
      generalInfo.forEach(info => {
        doc.text(info, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
      
      // Tableau des éléments d'inspection
      if (options.includeResults && inspection.items.length > 0) {
        const tableData = inspection.items.map(item => [
          item.name,
          item.category,
          item.status,
          item.value || '',
          item.notes || ''
        ]);
        
        (doc as any).autoTable({
          head: [['Élément', 'Catégorie', 'Statut', 'Valeur', 'Notes']],
          body: tableData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [0, 135, 81] },
          margin: { left: margin, right: margin }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Notes globales
      if (inspection.notes) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(10);
        doc.text('Notes:', margin, yPosition);
        yPosition += 5;
        
        const splitNotes = doc.splitTextToSize(inspection.notes, pageWidth - 2 * margin);
        doc.text(splitNotes, margin, yPosition);
        yPosition += splitNotes.length * 5 + 10;
      }
      
      yPosition += 10;
    }
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount} - FleetMada - Rapport d'Inspections`,
        margin,
        pageHeight - 10
      );
    }
    
    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }
  
  // Export CSV
  async exportToCSV(inspections: InspectionData[], options: ExportOptions = { format: 'csv' }): Promise<string> {
    const headers = [
      'ID',
      'Titre',
      'Véhicule',
      'VIN',
      'Inspecteur',
      'Date prévue',
      'Date complétée',
      'Statut',
      'Score global',
      'Conformité',
      'Localisation'
    ];
    
    // Ajouter les headers pour les éléments si demandé
    if (options.includeResults) {
      headers.push('Éléments inspectés', 'Statuts des éléments');
    }
    
    // Ajouter les notes si demandé
    if (options.template === 'detailed') {
      headers.push('Notes globales');
    }
    
    const csvRows = [headers.join(',')];
    
    for (const inspection of inspections) {
      const row = [
        inspection.id,
        `"${inspection.title}"`,
        `"${inspection.vehicleName}"`,
        inspection.vehicleVin || '',
        `"${inspection.inspectorName}"`,
        inspection.scheduledDate.toLocaleDateString('fr-FR'),
        inspection.completedAt?.toLocaleDateString('fr-FR') || '',
        inspection.status,
        inspection.overallScore?.toString() || '',
        inspection.complianceStatus,
        inspection.location ? `"${inspection.location}"` : ''
      ];
      
      // Ajouter les données d'éléments si demandé
      if (options.includeResults) {
        const elementNames = inspection.items.map(item => item.name).join('; ');
        const elementStatuses = inspection.items.map(item => item.status).join('; ');
        row.push(`"${elementNames}"`, `"${elementStatuses}"`);
      }
      
      // Ajouter les notes si détaillé
      if (options.template === 'detailed' && inspection.notes) {
        row.push(`"${inspection.notes.replace(/"/g, '""')}"`);
      }
      
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }
  
  // Export rapport personnalisé
  async exportCustomReport(
    inspections: InspectionData[], 
    config: {
      title: string;
      fields: string[];
      filters?: {
        dateFrom?: Date;
        dateTo?: Date;
        status?: string[];
        vehicleIds?: string[];
      };
      grouping?: 'none' | 'vehicle' | 'inspector' | 'status' | 'date';
    }
  ): Promise<Blob> {
    // Filtrer les données selon les critères
    let filteredInspections = inspections;
    
    if (config.filters) {
      filteredInspections = inspections.filter(inspection => {
        if (config.filters!.dateFrom && inspection.scheduledDate < config.filters!.dateFrom) return false;
        if (config.filters!.dateTo && inspection.scheduledDate > config.filters!.dateTo) return false;
        if (config.filters!.status && !config.filters!.status.includes(inspection.status)) return false;
        if (config.filters!.vehicleIds && !config.filters!.vehicleIds.includes(inspection.vehicleName)) return false;
        return true;
      });
    }
    
    // Grouper les données si demandé
    let groupedData: { [key: string]: InspectionData[] } = {};
    
    if (config.grouping && config.grouping !== 'none') {
      groupedData = filteredInspections.reduce((groups, inspection) => {
        let groupKey = '';
        
        switch (config.grouping) {
          case 'vehicle':
            groupKey = inspection.vehicleName;
            break;
          case 'inspector':
            groupKey = inspection.inspectorName;
            break;
          case 'status':
            groupKey = inspection.status;
            break;
          case 'date':
            groupKey = inspection.scheduledDate.toLocaleDateString('fr-FR');
            break;
        }
        
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(inspection);
        return groups;
      }, {} as { [key: string]: InspectionData[] });
    }
    
    // Générer le rapport PDF
    const doc = new jsPDF();
    let yPosition = 20;
    
    // En-tête
    doc.setFontSize(18);
    doc.setTextColor(0, 135, 81);
    doc.text(config.title, 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Période: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
    yPosition += 20;
    
    // Statistiques
    const stats = {
      total: filteredInspections.length,
      completed: filteredInspections.filter(i => i.status === 'COMPLETED').length,
      pending: filteredInspections.filter(i => i.status === 'SCHEDULED').length,
      averageScore: filteredInspections
        .filter(i => i.overallScore)
        .reduce((sum, i) => sum + (i.overallScore || 0), 0) / filteredInspections.filter(i => i.overallScore).length || 0
    };
    
    doc.text(`Total inspections: ${stats.total}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Complétées: ${stats.completed}`, 20, yPosition);
    yPosition += 8;
    doc.text(`En attente: ${stats.pending}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Score moyen: ${Math.round(stats.averageScore)}%`, 20, yPosition);
    yPosition += 20;
    
    // Données groupées ou détaillées
    if (config.grouping && config.grouping !== 'none') {
      Object.entries(groupedData).forEach(([groupName, groupInspections]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 135, 81);
        doc.text(`${groupName} (${groupInspections.length})`, 20, yPosition);
        yPosition += 10;
        
        // Tableau du groupe
        const tableData = groupInspections.map(inspection => [
          inspection.title,
          inspection.vehicleName,
          inspection.status,
          inspection.overallScore?.toString() || '',
          inspection.scheduledDate.toLocaleDateString('fr-FR')
        ]);
        
        (doc as any).autoTable({
          head: [['Titre', 'Véhicule', 'Statut', 'Score', 'Date']],
          body: tableData,
          startY: yPosition,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [0, 135, 81] },
          margin: { left: 20, right: 20 }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      });
    } else {
      // Tableau détaillé
      const tableData = filteredInspections.map(inspection => [
        inspection.title,
        inspection.vehicleName,
        inspection.inspectorName,
        inspection.status,
        inspection.overallScore?.toString() || '',
        inspection.scheduledDate.toLocaleDateString('fr-FR')
      ]);
      
      (doc as any).autoTable({
        head: [['Titre', 'Véhicule', 'Inspecteur', 'Statut', 'Score', 'Date']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 135, 81] },
        margin: { left: 20, right: 20 }
      });
    }
    
    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }
  
  // Génération de QR Code pour inspection
  generateInspectionQRCode(inspectionId: string): string {
    // URL d'accès rapide à l'inspection
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inspectionUrl = `${baseUrl}/inspections/${inspectionId}`;
    
    // Utiliser une API de génération de QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inspectionUrl)}`;
  }
  
  // Télécharger un fichier
  downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  // Méthode principale d'export
  async exportInspections(
    inspections: InspectionData[], 
    options: ExportOptions = { format: 'pdf' },
    filename?: string
  ): Promise<void> {
    let blob: Blob;
    let mimeType: string;
    let extension: string;
    
    switch (options.format) {
      case 'pdf':
        blob = await this.exportToPDF(inspections, options);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'csv':
        const csvContent = await this.exportToCSV(inspections, options);
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      default:
        throw new Error(`Format non supporté: ${options.format}`);
    }
    
    const finalFilename = filename || `inspections-export-${new Date().toISOString().split('T')[0]}.${extension}`;
    this.downloadFile(blob, finalFilename);
  }
}

export const inspectionExportService = new InspectionExportService();
export default InspectionExportService;