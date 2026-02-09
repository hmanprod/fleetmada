'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Bell, MessageSquare, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FuelEntryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/fuel/history');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Historique de carburant
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Entrée de carburant #{params.id || '195961220'}</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full bg-gray-100"><span className="sr-only">Utilisateur</span><div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white">HR</div></button>
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Bell size={16} /> Suivre
                    </button>
                    <button className="p-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                        <Edit size={16} /> Modifier
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-6 px-6 flex gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Détails</h2>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">Tous les champs</h3>

                            <div className="space-y-4">
	                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
	                                    <div className="text-sm text-gray-500">Véhicule</div>
	                                    <div className="flex items-center gap-2">
	                                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
	                                            <img src={`https://source.unsplash.com/random/50x50/?truck`} className="w-full h-full object-cover" alt="Véhicule" />
	                                        </div>
	                                        <span className="text-[#008751] font-medium hover:underline cursor-pointer">MV105TRNS</span>
	                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Exemple</span>
	                                    </div>
	                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Date</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">12/13/2025 4:56pm</div>
                                </div>

	                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
	                                    <div className="text-sm text-gray-500">Odomètre</div>
	                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">160 km</div>
	                                </div>

	                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
	                                    <div className="text-sm text-gray-500">Fournisseur</div>
	                                    <div className="text-sm text-gray-900">—</div>
	                                </div>

	                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
	                                    <div className="text-sm text-gray-500">Type de carburant</div>
	                                    <div className="text-sm text-gray-900">—</div>
	                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Carte carburant</div>
                                    <div className="text-sm text-gray-900">Non</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] border-b border-gray-100 pb-3">
                                    <div className="text-sm text-gray-500">Reference</div>
                                    <div className="text-sm text-gray-900">—</div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] pb-1">
                                    <div className="text-sm text-gray-500">Previous Entry</div>
                                    <div className="text-sm text-gray-900 underline decoration-dotted underline-offset-4">11/30/2025 6:34pm</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Footer in Card */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 grid grid-cols-4 gap-6">
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">Volume</div>
                                <div className="text-xl font-bold text-gray-900">142.397 <span className="text-xs font-normal text-gray-500">gallons (US)</span></div>
                                <div className="text-xs text-red-600 font-medium mt-1">▲ 142.40 (Infinity%)</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">Prix du carburant</div>
                                <div className="text-xl font-bold text-gray-900">MGA 3.7950 <span className="text-xs font-normal text-gray-500">/ L</span></div>
                                <div className="text-xs text-green-600 font-medium mt-1">▼ MGA 1 (18.1%)</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">Total</div>
                                <div className="text-xl font-bold text-gray-900">MGA 540</div>
                                <div className="text-xs text-red-600 font-medium mt-1">▲ MGA 540 (0.0%)</div>
                            </div>
                            <div>{/* Empty col for spacing if needed or layout adjustment */}</div>

	                            <div className="mt-4">
	                                <div className="text-xs text-gray-500 font-medium mb-1">Utilisation</div>
	                                <div className="text-xl font-bold text-gray-900">96.0 <span className="text-xs font-normal text-gray-500">km</span></div>
	                                <div className="text-xs text-green-600 font-medium mt-1">▲ 81.45 (559.8%)</div>
	                            </div>
	                            <div className="mt-4">
	                                <div className="text-xs text-gray-500 font-medium mb-1">Consommation</div>
	                                <div className="text-xl font-bold text-gray-900">0.67 <span className="text-xs font-normal text-gray-500">L/100km</span></div>
	                                <div className="text-xs text-green-600 font-medium mt-1">▲ 0.574 (574.0%)</div>
	                            </div>
	                            <div className="mt-4">
	                                <div className="text-xs text-gray-500 font-medium mb-1">Coût</div>
	                                <div className="text-xl font-bold text-gray-900">MGA 0 <span className="text-xs font-normal text-gray-500">/ km</span></div>
	                                <div className="text-xs text-green-600 font-medium mt-1">▼ MGA 46 (99.4%)</div>
	                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Localisation</h2>
                        <div className="h-64 bg-gray-50 rounded flex flex-col items-center justify-center text-gray-400">
                            <div className="mb-2">Aucune carte disponible</div>
                            <span className="text-sm">La localisation est inconnue ou indisponible</span>
                        </div>
                    </div>

                    <div className="text-center text-xs text-[#008751] cursor-pointer hover:underline mb-8">
                        Créé il y a un jour · Mis à jour il y a 18 heures
                    </div>
                </div>

                {/* Right Sidebar - Comments */}
                <div className="w-[350px] space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Commentaires</h2>
                            <div className="flex bg-gray-100 p-1 rounded">
                                <button className="p-1 hover:bg-white rounded shadow-sm"><MessageSquare size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><MapPin size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><Bell size={14} /></button>
                                <button className="p-1 hover:bg-white rounded text-gray-400"><MessageSquare size={14} className="rotate-180" /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">Démarrez une discussion ou utilisez @mention pour poser une question dans le champ ci-dessous.</p>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">HR</div>
                            <input type="text" placeholder="Ajouter un commentaire" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
