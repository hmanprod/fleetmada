'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Info, MapPin, Plus, Minus, Keyboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlaceEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: 'Home',
        description: '',
        address: '2GH9+QG9, Lalana Dok. Ravoahangy Andrianavalona',
        latitude: '-18.91984564014815',
        longitude: '47.51924940718334',
        geofenceRadius: '100 meters'
    });

    const handleBack = () => {
        router.push(`/places/${params.id}`);
    };

    const handleSave = () => {
        console.log('Saving place:', formData);
        // TODO: Implement save logic
        router.back();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push('/places')}>Places</span>
                    <span>›</span>
                    <span className="hover:underline cursor-pointer" onClick={handleBack}>Home</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-4">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Place</button>
                </div>
            </div>

            <div className="px-8 py-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Place</h1>

                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <div className="absolute right-3 top-3 bg-red-500 p-0.5 rounded text-white"><MoreHorizontal size={12} /></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    ></textarea>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-200" />

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Adding a Location</h3>
                                    <p className="text-xs text-gray-500 mb-4">Use the address search below, or input the latitude and longitude of the location. You can also draw a geofence directly on the map after address or coordinates are input.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">Latitude <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.latitude}
                                            onChange={(e) => handleInputChange('latitude', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">Longitude <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.longitude}
                                            onChange={(e) => handleInputChange('longitude', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-200" />

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Geofence Radius <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.geofenceRadius}
                                            onChange={(e) => handleInputChange('geofenceRadius', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                        />
                                        <div className="absolute right-3 top-3 text-gray-400">
                                            <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><path d="M5 0L0 5H10L5 0ZM5 16L10 11H0L5 16Z" /></svg>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">The geofence radius is used to determine the location entries that are associated to this place. You can use this geofence to send an alert when a location entry is here.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-center gap-3 text-blue-800 text-sm">
                            <Info size={20} className="text-blue-500" />
                            You can draw a geofence directly on the map by clicking the circle or polygon icon.
                        </div>

                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-[600px] relative overflow-hidden">
                            {/* Map Placeholder */}
                            <div className="absolute inset-0 bg-gray-100">
                                <img
                                    src="https://static.mapquest.com/staticmap?key=G&center=-18.91368,47.53613&zoom=15&size=800,600&type=map&imagetype=png"
                                    alt="Map"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Map Controls Mockup */}
                            <div className="absolute top-2 left-2 bg-white border border-gray-300 rounded shadow-sm flex">
                                <button className="p-2 hover:bg-gray-50 border-r border-gray-300"><span className="block w-4 h-4 border-2 border-gray-600 rounded-full"></span></button>
                                <button className="p-2 hover:bg-gray-50 border-r border-gray-300"><span className="block w-4 h-4 bg-gray-400 rounded-full"></span></button>
                                <button className="p-2 hover:bg-gray-50"><span className="block w-4 h-4 transform rotate-45 border-2 border-gray-600"></span></button>
                            </div>

                            <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded shadow-sm">
                                <button className="p-2 hover:bg-gray-50">
                                    <img src="https://maps.gstatic.com/mapfiles/api-3/images/pegman_dock_2x.png" className="w-5 h-8 object-contain opacity-70" alt="Street View" />
                                </button>
                            </div>

                            {/* Geofence Visualization */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-48 h-48 bg-blue-500/20 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <MapPin size={48} className="text-red-600 fill-red-600 drop-shadow-lg pb-4" />
                                </div>
                            </div>

                            {/* Zoom Controls */}
                            <div className="absolute bottom-8 right-2 bg-white border border-gray-300 rounded shadow-sm flex flex-col">
                                <button className="p-2 hover:bg-gray-50 border-b border-gray-300"><Plus size={16} /></button>
                                <button className="p-2 hover:bg-gray-50"><Minus size={16} /></button>
                            </div>

                            <div className="absolute bottom-1 right-1 bg-white/80 text-[10px] px-1 text-gray-600 flex gap-1">
                                <span>Keyboard shortcuts</span>
                                <span>Map data ©2025</span>
                                <span>Terms</span>
                            </div>
                            <div className="absolute bottom-1 left-1">
                                <span className="text-blue-500 font-bold text-lg tracking-tighter">Google</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 flex justify-end gap-3 bg-white border-t border-gray-200 sticky bottom-0">
                <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-4">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Place</button>
            </div>
        </div>
    );
}
