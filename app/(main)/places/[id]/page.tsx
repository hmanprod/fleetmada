'use client';

import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Search, Plus, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    const handleBack = () => {
        router.push('/places');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-1">
                        <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mr-2">
                            Places <ArrowLeft size={16} className="rotate-180" />
                        </button>
                        <div className="w-10 h-10 rounded overflow-hidden mr-3">
                            <img src="https://source.unsplash.com/random/100x100/?map" alt="Place" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm">
                            <MoreHorizontal size={16} />
                        </button>
                        <button
                            onClick={() => router.push(`/places/${params.id}/edit`)}
                            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded flex items-center gap-2 text-sm shadow-sm"
                        >
                            <Edit size={16} /> Edit
                        </button>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 ml-14 mb-6">Home</h1>

                <div className="flex gap-8 ml-14 border-b border-transparent">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-[#008751] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('location-entries')}
                        className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'location-entries' ? 'border-[#008751] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Location Entries
                    </button>
                </div>
            </div>

            <div className="px-6 py-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-[150px_1fr] gap-4">
                                <div className="text-sm text-gray-500">Name</div>
                                <div className="text-sm text-gray-900">Home</div>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] gap-4">
                                <div className="text-sm text-gray-500">Address</div>
                                <div className="text-sm text-gray-900">
                                    Lalana Dok. Ravoahangy Andrianavalona Joseph<br />
                                    Antananarivo, Analamanga, MG
                                </div>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] gap-4">
                                <div className="text-sm text-gray-500">Description</div>
                                <div className="text-sm text-gray-900">—</div>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] gap-4">
                                <div className="text-sm text-gray-500">Geofence Radius</div>
                                <div className="text-sm text-gray-900">100 meters</div>
                            </div>
                        </div>

                        <div className="mt-8 h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
                            <img
                                src="https://static.mapquest.com/staticmap?key=G&center=-18.91368,47.53613&zoom=15&size=800,400&type=map&imagetype=png"
                                alt="Map"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-32 h-32 bg-blue-500/20 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <MapPin size={32} className="text-red-600 fill-red-600 drop-shadow-md pb-2" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500 text-right">
                            Antananarivo, Analamanga 100 meter geofence radius<br />
                            Lalana Dok. Ravoahangy Andrianavalona Joseph, Antananarivo, Analamanga, MG
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Latest Location Entries */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[250px] flex flex-col">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Latest Location Entries</h2>
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="h-14 w-14 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                                <Search size={28} className="text-green-500" />
                            </div>
                            <p className="text-gray-500 text-sm">No results to show.</p>
                        </div>
                    </div>

                    {/* Geofence Alert Policy */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[250px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Geofence Alert Policy</h2>
                            <button className="text-[#008751] hover:underline text-sm font-medium flex items-center gap-1">
                                <Plus size={16} /> Add Alert Policy
                            </button>
                        </div>

                        <div className="flex grid grid-cols-2 text-xs font-bold text-gray-900 mb-4">
                            <div>Policy</div>
                            <div>Email notification</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="h-14 w-14 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                                <Search size={28} className="text-green-500" />
                            </div>
                            <p className="text-gray-500 text-sm">No results to show.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
