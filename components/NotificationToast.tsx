'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose: () => void;
}

export default function NotificationToast({
    type,
    title,
    message,
    duration = 5000,
    onClose
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'error':
                return <XCircle className="text-red-500" size={20} />;
            case 'warning':
                return <AlertCircle className="text-yellow-500" size={20} />;
            case 'info':
                return <Info className="text-blue-500" size={20} />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`
                max-w-sm w-full shadow-lg rounded-lg border p-4
                transform transition-all duration-300 ease-in-out
                ${isLeaving ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
                ${getStyles()}
            `}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-bold">
                        {title}
                    </p>
                    {message && (
                        <p className="mt-1 text-sm opacity-90">
                            {message}
                        </p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={handleClose}
                        className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook pour gérer les toasts
export function useToast() {
    const [toasts, setToasts] = useState<Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message?: string;
        duration?: number;
    }>>([]);

    const addToast = React.useCallback((toast: Omit<typeof toasts[0], 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = React.useMemo(() => ({
        success: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'success', title, message, duration }),
        error: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'error', title, message, duration }),
        warning: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'warning', title, message, duration }),
        info: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'info', title, message, duration }),
    }), [addToast]);

    return { toast, toasts, removeToast };
}

// Container pour afficher les toasts
interface ToastContainerProps {
    toasts: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message?: string;
        duration?: number;
    }>;
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <NotificationToast
                        type={t.type}
                        title={t.title}
                        message={t.message}
                        duration={t.duration}
                        onClose={() => removeToast(t.id)}
                    />
                </div>
            ))}
        </div>
    );
}