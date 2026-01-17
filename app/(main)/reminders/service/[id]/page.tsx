'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit, MoreHorizontal, Info, Clock, Gauge, Bell, User, History, CheckCircle2, AlertCircle, Calendar, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { remindersApi, ServiceReminder } from '@/lib/services/reminders-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { Loader2 } from 'lucide-react';

export default function ServiceReminderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const [reminder, setReminder] = useState<ServiceReminder | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    const fetchReminder = useCallback(async () => {
        try {
            setLoading(true);
            const data = await remindersApi.getServiceReminder(params.id);
            if (data) {
                setReminder(data);
            } else {
                toast.error('Erreur', 'Rappel non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors du chargement du rappel:', error);
            toast.error('Erreur', 'Impossible de charger le rappel');
        } finally {
            setLoading(false);
        }
    }, [params.id, toast]);

    useEffect(() => {
        fetchReminder();
    }, [fetchReminder]);

    const handleBack = () => {
        router.push('/reminders/service');
    };

    const handleEdit = () => {
        router.push(`/reminders/service/${params.id}/edit`);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusStyles = (status: string, isOverdue?: boolean) => {
        if (isOverdue) return 'bg-red-100 text-red-700 border-red-200';
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'DISMISSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'OVERDUE': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
            </div>
        );
    }

    if (!reminder) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Rappel non trouvé</h2>
                    <p className="text-gray-500 mb-6">Le rappel que vous recherchez n'existe pas ou a été supprimé.</p>
                    <button onClick={handleBack} className="bg-[#008751] text-white px-6 py-2 rounded-md font-bold">Retour aux rappels</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Rappels de service
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{reminder.title || reminder.task}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyles(reminder.status, reminder.isOverdue)}`}>
                        {reminder.isOverdue ? 'EN RETARD' : reminder.status}
                    </span>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleEdit} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 flex items-center gap-2 shadow-sm text-sm">
                        <Edit size={16} /> Modifier
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-50 shadow-sm"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Clock size={14} /> Reporter (Snooze)
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Marquer comme résolu
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Vehicle Quick Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={`https://source.unsplash.com/random/100x100/?truck&sig=${reminder.vehicle?.id}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-[#008751] hover:underline cursor-pointer">
                                {reminder.vehicle?.name}
                            </h2>
                            <p className="text-gray-500 font-medium">
                                {reminder.vehicle?.make} {reminder.vehicle?.model}
                            </p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">VIN: {reminder.vehicle?.id.substring(0, 8)}...</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Actif</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Settings size={18} className="text-gray-400" /> Planification du service
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Intervalle de temps</p>
                                            <p className="text-sm text-gray-500">Tous les {reminder.intervalMonths || '—'} mois</p>
                                            {reminder.timeThreshold && (
                                                <p className="text-[11px] text-blue-600 font-medium mt-1">
                                                    Seuil d'alerte : {reminder.timeThreshold} {reminder.timeThresholdUnit === 'week(s)' ? 'semaines' : 'jours'} avant
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">Prochaine échéance :</div>
                                        <div className={`text-sm font-bold ${reminder.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                            {formatDate(reminder.nextDue)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 bg-purple-50 text-purple-600 rounded">
                                            <Gauge size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Intervalle de kilométrage</p>
                                            <p className="text-sm text-gray-500">Tous les {(reminder.intervalMeter || 0).toLocaleString()} km</p>
                                            {reminder.meterThreshold && (
                                                <p className="text-[11px] text-purple-600 font-medium mt-1">
                                                    Seuil d'alerte : {reminder.meterThreshold.toLocaleString()} km avant
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">Prochain kilométrage :</div>
                                        <div className={`text-sm font-bold ${reminder.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                            {reminder.nextDueMeter ? `${reminder.nextDueMeter.toLocaleString()} km` : '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Last Service & Compliance */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <History size={18} className="text-gray-400" /> Historique et Conformité
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-gray-900">Dernier entretien</p>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Date</span>
                                            <span className="text-gray-900 font-medium">{formatDate(reminder.lastServiceDate)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Kilométrage</span>
                                            <span className="text-gray-900 font-medium">{reminder.lastServiceMeter ? `${reminder.lastServiceMeter.toLocaleString()} km` : '—'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-gray-900">Niveau de conformité</p>
                                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                                        <div className="text-3xl font-bold text-[#008751]">{reminder.compliance}%</div>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">À temps</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                            <div className="bg-[#008751] h-2 rounded-full" style={{ width: `${reminder.compliance}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Status Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Résumé du statut</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 font-medium">Statut global</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${reminder.isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {reminder.isOverdue ? 'ACTION REQUISE' : 'CONFORME'}
                                </span>
                            </div>
                            {reminder.daysUntilDue != null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium">Jours restants</span>
                                    <span className={`text-sm font-bold ${reminder.daysUntilDue < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {reminder.daysUntilDue < 0 ? `${Math.abs(reminder.daysUntilDue)} jours de retard` : `${reminder.daysUntilDue} jours`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notifications & Watchers */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Notifications</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-full">
                                    <Bell size={18} className="text-[#008751]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Alertes activées</p>
                                    <p className="text-xs text-gray-500">Notifications quotidiennes en cas de retard</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                    <User size={12} /> OBSERVATEURS ({reminder.watchers?.length || 0})
                                </p>
                                <div className="space-y-2">
                                    {reminder.watchers && reminder.watchers.length > 0 ? (
                                        reminder.watchers.map((watcher, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    W
                                                </div>
                                                <span className="text-xs text-gray-700 font-medium">{watcher}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Aucun observateur assigné</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help/Instruction */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex gap-2 text-blue-800">
                            <Info size={16} className="mt-0.5" />
                            <p className="text-xs leading-relaxed">
                                Les rappels de service vous aident à rester à jour sur l'entretien préventif.
                                Une fois le service effectué, créez une entrée de service pour réinitialiser ce rappel.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
