'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, MapPin, Loader2, Info, Navigation, History, ShieldAlert, MoreHorizontal, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlace, useDeletePlace } from '@/lib/hooks/usePlaces';
import { PlaceType } from '@/types/geolocation';

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { place, loading, error } = usePlace(params.id);
    const { deletePlace, loading: deleteLoading } = useDeletePlace();

    const handleBack = () => {
        router.push('/settings/parts/locations');
    };

    const handleDelete = async () => {
        try {
            await deletePlace(params.id);
            router.push('/places?deleted=true');
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        }
    };

    const getPlaceTypeLabel = (type: PlaceType) => {
        switch (type) {
            case PlaceType.OFFICE: return 'Bureau';
            case PlaceType.FUEL_STATION: return 'Station-service';
            case PlaceType.SERVICE_CENTER: return 'Centre d\'entretien';
            case PlaceType.CLIENT_SITE: return 'Site client';
            case PlaceType.HOME: return 'Domicile';
            case PlaceType.GENERAL: return 'Général';
            default: return type;
        }
    };

    const getPlaceTypeBadgeColor = (type: PlaceType) => {
        switch (type) {
            case PlaceType.OFFICE: return 'bg-purple-100 text-purple-800';
            case PlaceType.FUEL_STATION: return 'bg-green-100 text-green-800';
            case PlaceType.SERVICE_CENTER: return 'bg-blue-100 text-blue-800';
            case PlaceType.CLIENT_SITE: return 'bg-orange-100 text-orange-800';
            case PlaceType.HOME: return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[#008751] mx-auto" size={48} />
                    <p className="text-gray-500 font-medium">Chargement des détails du lieu...</p>
                </div>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="p-12 text-center bg-gray-50 h-screen">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
                    <p className="text-gray-500 mb-6">{error || "Ce lieu n'existe pas ou vous n'avez pas les droits pour le voir."}</p>
                    <button onClick={handleBack} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    // URL Google Maps pour l'affichage statique ou iframe
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${place.latitude},${place.longitude}&zoom=16`;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* ZONE 1: HEADER & ACTIONS */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20 shadow-sm">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <button onClick={handleBack} className="text-gray-400 hover:text-[#008751] flex items-center gap-1 text-sm font-bold transition-colors mb-2">
                                <ArrowLeft size={16} /> Retour aux sites opérationnels
                            </button>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-black text-gray-900">{place.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPlaceTypeBadgeColor(place.placeType)}`}>
                                    {getPlaceTypeLabel(place.placeType)}
                                </span>
                                {!place.isActive && (
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        Inactif
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 items-center relative">

                            <div className="relative">
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`p-2.5 rounded-xl border transition-all ${showMoreMenu ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'}`}
                                >
                                    <MoreHorizontal size={20} />
                                </button>

                                {showMoreMenu && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => {
                                                    setShowMoreMenu(false);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 size={16} /> Supprimer le lieu
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => router.push(`/places/${place.id}/edit`)}
                                className="px-6 py-2.5 bg-white border border-gray-200 hover:border-[#008751] hover:text-[#008751] text-gray-700 font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
                            >
                                <Edit size={18} /> Modifier
                            </button>



                        </div>
                    </div>

                    {/* ZONE 2: NAVIGATION TABS */}
                    <div className="flex gap-8 border-b border-transparent translate-y-[1px]">
                        {[
                            { id: 'overview', label: 'Vue d\'ensemble', icon: <Info size={16} /> },
                            { id: 'history', label: 'Historique des visites', icon: <History size={16} /> },
                            { id: 'alerts', label: 'Alertes Géofencing', icon: <ShieldAlert size={16} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === tab.id
                                    ? 'border-[#008751] text-[#008751] font-bold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 font-medium'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-8 py-8 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne Gauche - Détails & Carte */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* ZONE 5: TABLEAU/DÉTAILS DANS CARD */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Info size={20} className="text-[#008751]" /> Détails de la localisation
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                        <div className="space-y-4">
                                            <div className="flex flex-col border-b border-gray-50 pb-2">
                                                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Adresse</span>
                                                <span className="text-gray-900 font-medium leading-relaxed">{place.address || 'Non spécifiée'}</span>
                                            </div>
                                            <div className="flex flex-col border-b border-gray-50 pb-2">
                                                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Description</span>
                                                <span className="text-gray-900 font-medium">{place.description || '—'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col border-b border-gray-50 pb-2">
                                                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Coordonnées</span>
                                                <span className="text-gray-900 font-mono text-xs">
                                                    {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col border-b border-gray-50 pb-2">
                                                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Rayon Géofence</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-900 font-bold">{place.geofenceRadius || 500} mètres</span>
                                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Actif</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Visualization */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin size={20} className="text-[#008751]" /> Visualisation Carte
                                    </h2>
                                    <div className="h-[450px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative group">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={mapUrl}
                                            title="Place Map Visualization"
                                        ></iframe>

                                        {/* Geofence Circle Overlay (Aesthetic Mock) */}
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <div className="w-64 h-64 border-2 border-[#008751]/40 bg-[#008751]/5 rounded-full animate-pulse shadow-[0_0_50px_rgba(0,135,81,0.2)]"></div>
                                        </div>

                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20">
                                            <p className="text-[10px] font-bold text-[#008751] uppercase tracking-wider mb-1">Status GPS</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                                <span className="text-xs font-bold text-gray-900 tracking-tight">Signal Optimal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ZONE 4: DASHBOARD / SIDEBAR STATS */}
                    <div className="space-y-8">
                        {/* Statistiques FLASH */}
                        <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-lg font-bold">Aperçu rapide</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-white/50 text-[10px] font-bold uppercase mb-1">Visites (30j)</p>
                                        <p className="text-2xl font-black">128</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-[10px] font-bold uppercase mb-1">Alertes</p>
                                        <p className="text-2xl font-black text-orange-400">0</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10 text-xs text-white/70 italic">
                                    Ce lieu est le point le plus visité par la flotte "Hilux Group" cette semaine.
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#008751]/20 rounded-full blur-3xl"></div>
                        </div>

                        {/* Recent Entries */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-gray-900 mb-6 flex justify-between items-center">
                                <span>Activités récentes</span>
                                <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded">Dernières 48h</span>
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-2 rounded-full bg-green-500 my-1"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">FM-001-AA (Toyota Hilux)</p>
                                        <p className="text-[11px] text-gray-400 font-medium italic">Entrée : Aujourd'hui, 14:15</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 opacity-50">
                                    <div className="w-2 rounded-full bg-gray-300 my-1"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">FM-002-BB (Nissan Pathfinder)</p>
                                        <p className="text-[11px] text-gray-400 font-medium italic">Sortie : Hier, 19:30</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-3 text-xs font-bold text-[#008751] bg-[#008751]/5 rounded-xl hover:bg-[#008751]/10 transition-colors">
                                Voir tout l'historique
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-2">Confirmer la suppression ?</h3>
                        <p className="text-sm text-gray-500 text-center mb-8">Cette action est irréversible. L'historique associé à ce lieu pourrait être désynchronisé.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-colors">Annuler</button>
                            <button onClick={handleDelete} disabled={deleteLoading} className="py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50">
                                {deleteLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
