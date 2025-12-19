'use client';

import React from 'react';
import { 
    Award, TrendingUp, AlertTriangle, CheckCircle, 
    Target, Star, BarChart3, Shield, AlertCircle 
} from 'lucide-react';

interface ScoringSystemProps {
    overallScore: number;
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
    criticalIssues: number;
    totalItems: number;
    passedItems: number;
    failedItems: number;
    notApplicableItems: number;
    className?: string;
}

export default function ScoringSystem({
    overallScore,
    complianceStatus,
    criticalIssues,
    totalItems,
    passedItems,
    failedItems,
    notApplicableItems,
    className = ''
}: ScoringSystemProps) {
    // Calculer le score de conformité basé sur les seuils
    const getComplianceThreshold = () => {
        if (criticalIssues > 0) return 'CRITICAL';
        if (failedItems > 0) return 'MINOR';
        return 'PASS';
    };

    const threshold = getComplianceThreshold();
    const applicableItems = totalItems - notApplicableItems;
    const complianceRate = applicableItems > 0 ? (passedItems / applicableItems) * 100 : 0;

    // Déterminer les couleurs selon le score
    const getScoreColor = (score: number) => {
        if (score >= 95) return 'text-green-600';
        if (score >= 85) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        if (score >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 95) return 'bg-green-50 border-green-200';
        if (score >= 85) return 'bg-green-50 border-green-200';
        if (score >= 70) return 'bg-yellow-50 border-yellow-200';
        if (score >= 50) return 'bg-orange-50 border-orange-200';
        return 'bg-red-50 border-red-200';
    };

    const getComplianceIcon = () => {
        switch (complianceStatus) {
            case 'COMPLIANT':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'NON_COMPLIANT':
                return <AlertTriangle className="text-red-600" size={20} />;
            case 'PENDING_REVIEW':
                return <AlertCircle className="text-yellow-600" size={20} />;
        }
    };

    const getComplianceLabel = () => {
        switch (complianceStatus) {
            case 'COMPLIANT':
                return 'Conforme';
            case 'NON_COMPLIANT':
                return 'Non-conforme';
            case 'PENDING_REVIEW':
                return 'En attente';
        }
    };

    const getComplianceColor = () => {
        switch (complianceStatus) {
            case 'COMPLIANT':
                return 'text-green-700 bg-green-100 border-green-300';
            case 'NON_COMPLIANT':
                return 'text-red-700 bg-red-100 border-red-300';
            case 'PENDING_REVIEW':
                return 'text-yellow-700 bg-yellow-100 border-yellow-300';
        }
    };

    const getScoreLabel = (score: number) => {
        if (score >= 95) return 'Excellent';
        if (score >= 85) return 'Très bien';
        if (score >= 70) return 'Satisfaisant';
        if (score >= 50) return 'Amélioration requise';
        return 'Insuffisant';
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Score principal */}
            <div className={`p-4 rounded-lg border-2 ${getScoreBgColor(overallScore)}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Award className={getScoreColor(overallScore)} size={24} />
                        <span className="font-bold text-lg text-gray-900">Score Global</span>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                            {overallScore}%
                        </div>
                        <div className={`text-sm ${getScoreColor(overallScore)}`}>
                            {getScoreLabel(overallScore)}
                        </div>
                    </div>
                </div>

                {/* Barre de progression du score */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                            overallScore >= 95 ? 'bg-green-500' :
                            overallScore >= 85 ? 'bg-green-400' :
                            overallScore >= 70 ? 'bg-yellow-400' :
                            overallScore >= 50 ? 'bg-orange-400' :
                            'bg-red-500'
                        }`}
                        style={{ width: `${overallScore}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Statut de conformité */}
            <div className={`p-4 rounded-lg border ${getComplianceColor()}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getComplianceIcon()}
                        <span className="font-semibold">Statut de Conformité</span>
                    </div>
                    <span className="font-bold">{getComplianceLabel()}</span>
                </div>
            </div>

            {/* Détails des résultats */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 size={18} /> Détail des Résultats
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="text-green-600 mx-auto mb-1" size={20} />
                        <div className="text-lg font-bold text-green-600">{passedItems}</div>
                        <div className="text-xs text-green-700">Conformes</div>
                    </div>
                    
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="text-red-600 mx-auto mb-1" size={20} />
                        <div className="text-lg font-bold text-red-600">{failedItems}</div>
                        <div className="text-xs text-red-700">Non-conformes</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-600">{notApplicableItems}</div>
                        <div className="text-xs text-gray-700">Non applicables</div>
                    </div>
                    
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Target className="text-blue-600 mx-auto mb-1" size={20} />
                        <div className="text-lg font-bold text-blue-600">
                            {applicableItems}
                        </div>
                        <div className="text-xs text-blue-700">Évaluables</div>
                    </div>
                </div>

                {/* Taux de conformité */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taux de conformité</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${complianceRate}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {Math.round(complianceRate)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertes et recommandations */}
            {criticalIssues > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-red-800">Problèmes Critiques Détectés</h4>
                            <p className="text-sm text-red-700 mt-1">
                                {criticalIssues} élément(s) critique(s) nécessitent une attention immédiate.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {failedItems > 0 && criticalIssues === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-yellow-800">Améliorations Requises</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                {failedItems} élément(s) non-conforme(s) nécessitent des corrections.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {overallScore >= 90 && failedItems === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <Star className="text-green-600 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-green-800">Inspection Exemplaire</h4>
                            <p className="text-sm text-green-700 mt-1">
                                Félicitations ! Cette inspection respecte tous les standards de qualité.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Composant pour afficher les seuils de conformité
export function ComplianceThresholds() {
    const thresholds = [
        { score: 95, label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' },
        { score: 85, label: 'Très bien', color: 'text-green-500', bg: 'bg-green-50' },
        { score: 70, label: 'Satisfaisant', color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { score: 50, label: 'Amélioration', color: 'text-orange-500', bg: 'bg-orange-50' },
        { score: 0, label: 'Insuffisant', color: 'text-red-500', bg: 'bg-red-50' }
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={18} /> Seuils de Conformité
            </h3>
            
            <div className="space-y-2">
                {thresholds.map((threshold, index) => (
                    <div key={threshold.score} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${threshold.bg}`} />
                            <span className="text-sm text-gray-700">{threshold.label}</span>
                        </div>
                        <span className={`text-sm font-medium ${threshold.color}`}>
                            ≥ {threshold.score}%
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    <p className="mb-1"><strong>Critères d'évaluation :</strong></p>
                    <ul className="space-y-0.5">
                        <li>• Score ≥ 95% : Excellent</li>
                        <li>• Score ≥ 85% : Très bien</li>
                        <li>• Score ≥ 70% : Satisfaisant</li>
                        <li>• Score &lt; 70% : Amélioration requise</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}