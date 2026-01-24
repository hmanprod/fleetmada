'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, Package, ArrowRight, Home, Info } from 'lucide-react';
import { usePlaces } from '@/lib/hooks/usePlaces';
import { PlaceType } from '@/types/geolocation';
import { useRouter } from 'next/navigation';

export default function PartLocationsSettingsPage() {
    const { places, loading, error } = usePlaces({ limit: 100 });
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const filteredPlaces = places.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Emplacements de stockage</h1>
                    <p className="text-gray-500 text-sm">Gérez les sites opérationnels utilisés pour le stockage des pièces.</p>
                </div>
                <button
                    onClick={() => router.push('/places/create')}
                    className="bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                    <MapPin size={20} /> Nouveau site
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm shrink-0">
                    <Info size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 mb-1">Stockage et Sites Opérationnels</h3>
                    <p className="text-sm text-blue-800/80 leading-relaxed">
                        Toutes les pièces de votre inventaire sont liées à des <strong>Sites Opérationnels</strong> (Places).
                        Vous pouvez configurer ici quels sites sont disponibles pour le stockage et définir des détails précis (allées, casiers) lors de la création des pièces.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un site..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin text-[#008751] mx-auto mb-4" size={32} />
                            <p className="text-gray-500 font-medium">Chargement des sites...</p>
                        </div>
                    ) : filteredPlaces.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Aucun site trouvé</p>
                        </div>
                    ) : (
                        filteredPlaces.map((place) => (
                            <div key={place.id} className="p-4 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <Home size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{place.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{place.address || 'Aucune adresse'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pièces en stock</p>
                                        <p className="text-sm font-black text-gray-900">{place._count?.fuelEntries || 0}</p>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/places/${place.id}`)}
                                        className="p-2 text-gray-400 hover:text-[#008751] hover:bg-green-50 rounded-lg transition-all"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
