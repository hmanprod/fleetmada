"use client";

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    isDestructive = false,
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <AlertCircle size={24} />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            disabled={isLoading}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-gray-700 font-medium hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-lg transition-all disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2.5 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2 ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                                : 'bg-[#008751] hover:bg-[#007043] active:bg-[#005c37]'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Traitement...</span>
                            </>
                        ) : (
                            <span>{confirmLabel}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
