'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Bell, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicleRenewals } from '@/lib/hooks/useVehicleRenewals';

export default function VehicleRenewalDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { renewals, loading, error, completeRenewal, deleteRenewal } = useVehicleRenewals();
    const [renewal, setRenewal] = useState(null as any);
    const [actionLoading, setActionLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (renewals.length > 0) {
            const found = renewals.find(r => r.id === params.id);
            if (found) {
                setRenewal(found);
            }
        }
    }, [renewals, params.id]);

    const handleBack = () => {
        router.push('/reminders/vehicle-renewals');
    };

    const handleEdit = () => {
        router.push(`/reminders/vehicle-renewals/${params.id}/edit`);
    };

    const handleComplete = async () => {
        if (!renewal) return;
        setActionLoading(true);
        try {
            await completeRenewal(params.id, {
                completedDate: new Date().toISOString(),
                cost: 0
            });
            // Recharger pour voir le changement de statut
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la complétion:', error);
            alert('Erreur lors de la complétion');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce renouvellement ?')) return;

        setActionLoading(true);
        try {
            await deleteRenewal(params.id);
            router.push('/reminders/vehicle-renewals');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !renewal) {
        return <div className="p-8 flex justify-center h-screen items-center"><Loader2 className="animate-spin text-[#008751]" size={40} /></div>;
    }

    if (error) {
        return <div className="p-8 text-red-500 font-bold">Erreur: {error}</div>;
    }

    if (!renewal) {
        return <div className="p-8 text-gray-500 font-medium">Renouvellement non trouvé</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium mr-4">
                        <ArrowLeft size={16} /> Vehicle Renewals
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">{renewal.title || 'Vehicle Renewal'}</h1>
                            <div className="text-sm text-gray-500">{renewal.vehicleId}</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm" onClick={handleEdit} data-testid="edit-button">
                        <Edit size={16} /> Edit
                    </button>
                    <button
                        className="px-3 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
                        onClick={handleComplete}
                        disabled={actionLoading}
                        data-testid="complete-button"
                    >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null} Complete
                    </button>

                    <div className="relative">
                        <button
                            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded shadow-sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleDelete();
                                        }}
                                    >
                                        <Trash2 size={16} /> Supprimer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                                <div className="text-sm text-gray-500">Vehicle</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-[#008751] hover:underline cursor-pointer" data-testid="reminder-vehicle">{renewal.vehicleId}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                                <div className="text-sm text-gray-500">Renewal Type</div>
                                <div className="text-sm text-gray-900 font-medium">{renewal.type}</div>
                            </div>

                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                                <div className="text-sm text-gray-500">Status</div>
                                <div className="flex items-center gap-1.5 text-sm font-bold" data-testid="renewal-status">
                                    <div className={`w-2.5 h-2.5 rounded-full ${renewal.status === 'DISMISSED' ? 'bg-gray-400' :
                                        renewal.status === 'COMPLETED' ? 'bg-green-600' :
                                            renewal.isOverdue ? 'bg-red-600' : 'bg-blue-600'
                                        }`}></div>
                                    <span className={
                                        renewal.status === 'DISMISSED' ? 'text-gray-600' :
                                            renewal.status === 'COMPLETED' ? 'text-green-700' :
                                                renewal.isOverdue ? 'text-red-700' : 'text-blue-700'
                                    }>
                                        {renewal.status === 'DISMISSED' ? 'Dismissed' :
                                            renewal.status === 'COMPLETED' ? 'Completed' :
                                                renewal.isOverdue ? 'Overdue' : 'Due Soon'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                                <div className="text-sm text-gray-500">Due Date</div>
                                <div className="text-sm text-gray-900 font-medium">
                                    {renewal.dueDate ? new Date(renewal.dueDate).toLocaleDateString('fr-FR') : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
