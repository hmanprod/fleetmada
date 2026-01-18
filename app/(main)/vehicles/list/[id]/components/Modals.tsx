"use client";

import React from 'react';
import { X, AlertCircle, CheckCircle, Wrench } from 'lucide-react';

interface ArchiveModalProps {
    isOpen: boolean;
    isArchiving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ArchiveModal({ isOpen, isArchiving, onConfirm, onCancel }: ArchiveModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Archiver le véhicule</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isArchiving}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertCircle className="text-yellow-600" size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Confirmer l'archivage</p>
                            <p className="text-sm text-gray-500">Cette action est irréversible</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Êtes-vous sûr de vouloir archiver ce véhicule ? Le véhicule sera marqué comme archivé
                        et ne sera plus visible dans la liste active, mais toutes les données seront conservées.
                    </p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isArchiving}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isArchiving}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isArchiving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Archivage...
                            </>
                        ) : (
                            'Archiver'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InspectionFormsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InspectionFormsModal({ isOpen, onClose }: InspectionFormsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Gérer les formulaires d'inspection</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <CheckCircle className="text-blue-600" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">
                            Gérez les formulaires d'inspection disponibles pour ce véhicule.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ServiceProgramsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ServiceProgramsModal({ isOpen, onClose }: ServiceProgramsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Gérer les programmes de service</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Wrench className="text-green-600" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">
                            Gérez les programmes de service et maintenance pour ce véhicule.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}