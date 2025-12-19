'use client';

import React from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';

interface ProgressStep {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    icon?: React.ReactNode;
}

interface ProgressIndicatorProps {
    steps: ProgressStep[];
    currentStep?: string;
    orientation?: 'horizontal' | 'vertical';
    showLabels?: boolean;
    className?: string;
}

export default function ProgressIndicator({
    steps,
    currentStep,
    orientation = 'horizontal',
    showLabels = true,
    className = ''
}: ProgressIndicatorProps) {
    const getStepStatus = (step: ProgressStep) => {
        if (step.status === 'completed') return 'completed';
        if (step.status === 'in-progress') return 'in-progress';
        if (step.status === 'error') return 'error';
        return 'pending';
    };

    const getStepIcon = (step: ProgressStep) => {
        if (step.icon) return step.icon;
        
        const status = getStepStatus(step);
        switch (status) {
            case 'completed':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'in-progress':
                return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#008751]" />;
            case 'error':
                return <AlertTriangle className="text-red-600" size={20} />;
            default:
                return <Circle className="text-gray-400" size={20} />;
        }
    };

    const getConnectorClass = (index: number) => {
        const currentStepIndex = steps.findIndex(step => step.id === currentStep);
        const step = steps[index];
        const nextStep = steps[index + 1];
        
        if (!nextStep) return '';
        
        const isCompleted = step.status === 'completed';
        const isInProgress = nextStep.status === 'in-progress';
        
        if (isCompleted || isInProgress) {
            return 'bg-[#008751]';
        }
        return 'bg-gray-300';
    };

    if (orientation === 'vertical') {
        return (
            <div className={`space-y-4 ${className}`}>
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start">
                        <div className="flex flex-col items-center">
                            <div className={`
                                flex items-center justify-center w-10 h-10 rounded-full border-2
                                ${step.status === 'completed' ? 'bg-green-100 border-green-600' :
                                  step.status === 'in-progress' ? 'bg-blue-100 border-blue-600' :
                                  step.status === 'error' ? 'bg-red-100 border-red-600' :
                                  'bg-gray-100 border-gray-300'}
                            `}>
                                {getStepIcon(step)}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-0.5 h-8 mt-2 ${getConnectorClass(index)}`} />
                            )}
                        </div>
                        {showLabels && (
                            <div className="ml-4 flex-1">
                                <h3 className={`font-medium ${
                                    step.status === 'completed' ? 'text-green-900' :
                                    step.status === 'in-progress' ? 'text-blue-900' :
                                    step.status === 'error' ? 'text-red-900' :
                                    'text-gray-700'
                                }`}>
                                    {step.title}
                                </h3>
                                {step.description && (
                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`
                                flex items-center justify-center w-10 h-10 rounded-full border-2
                                ${step.status === 'completed' ? 'bg-green-100 border-green-600' :
                                  step.status === 'in-progress' ? 'bg-blue-100 border-blue-600' :
                                  step.status === 'error' ? 'bg-red-100 border-red-600' :
                                  'bg-gray-100 border-gray-300'}
                            `}>
                                {getStepIcon(step)}
                            </div>
                            {showLabels && (
                                <div className="mt-2 text-center">
                                    <h3 className={`text-sm font-medium ${
                                        step.status === 'completed' ? 'text-green-900' :
                                        step.status === 'in-progress' ? 'text-blue-900' :
                                        step.status === 'error' ? 'text-red-900' :
                                        'text-gray-700'
                                    }`}>
                                        {step.title}
                                    </h3>
                                    {step.description && (
                                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 ${getConnectorClass(index)}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

// Composant spécialisé pour les étapes d'inspection
export function InspectionProgress({ 
    inspectionStatus, 
    className = '' 
}: { 
    inspectionStatus: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    className?: string;
}) {
    const steps: ProgressStep[] = [
        {
            id: 'draft',
            title: 'Brouillon',
            description: 'Inspection créée',
            status: inspectionStatus === 'DRAFT' ? 'in-progress' : 
                    ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(inspectionStatus) ? 'completed' : 'pending'
        },
        {
            id: 'scheduled',
            title: 'Planifiée',
            description: 'Date définie',
            status: inspectionStatus === 'SCHEDULED' ? 'in-progress' :
                    ['IN_PROGRESS', 'COMPLETED'].includes(inspectionStatus) ? 'completed' : 'pending'
        },
        {
            id: 'in-progress',
            title: 'En cours',
            description: 'Exécution en cours',
            status: inspectionStatus === 'IN_PROGRESS' ? 'in-progress' :
                    inspectionStatus === 'COMPLETED' ? 'completed' : 'pending'
        },
        {
            id: 'completed',
            title: 'Terminée',
            description: 'Inspection complétée',
            status: inspectionStatus === 'COMPLETED' ? 'completed' : 'pending'
        }
    ];

    return (
        <ProgressIndicator
            steps={steps}
            currentStep={
                inspectionStatus === 'DRAFT' ? 'draft' :
                inspectionStatus === 'SCHEDULED' ? 'scheduled' :
                inspectionStatus === 'IN_PROGRESS' ? 'in-progress' :
                inspectionStatus === 'COMPLETED' ? 'completed' : undefined
            }
            orientation="horizontal"
            showLabels={true}
            className={className}
        />
    );
}

// Composant pour la progression d'exécution d'inspection
export function ExecutionProgress({ 
    currentStep, 
    totalSteps, 
    stepTitle,
    className = '' 
}: { 
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
    className?: string;
}) {
    const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{stepTitle}</h3>
                <span className="text-sm text-gray-500">
                    {currentStep} sur {totalSteps}
                </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                    className="bg-[#008751] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
                <span>Début</span>
                <span>{Math.round(progressPercentage)}%</span>
                <span>Fin</span>
            </div>
        </div>
    );
}