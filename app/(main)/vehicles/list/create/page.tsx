"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, FileText, PenTool, RefreshCw,
    BarChart3, Settings, Save, LayoutList, Lock, Loader2, AlertCircle
} from 'lucide-react';
import { useVehicleOperations } from '@/lib/hooks/useVehicles';
import { CreateVehicleInput } from '@/lib/validations/vehicle-validations';
import type { VehicleListQuery } from '@/lib/validations/vehicle-validations';

export default function CreateVehicle() {
    const router = useRouter();
    const { createVehicle, loading, error } = useVehicleOperations();
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState<any>({
        status: 'ACTIVE',
        type: 'Car',
        ownership: 'Owned',
        primaryMeter: 'Miles',
        fuelUnit: 'Gallons (US)',
        measurementUnits: 'Imperial',
        loanLeaseType: 'None',
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setSaveStatus('saving');
        setValidationErrors({});
        
        try {
            // Validation basique côté client
            const errors: Record<string, string> = {};
            
            if (!formData.name?.trim()) errors.name = 'Le nom du véhicule est requis';
            if (!formData.vin?.trim()) errors.vin = 'Le VIN est requis';
            if (!formData.type?.trim()) errors.type = 'Le type de véhicule est requis';
            if (!formData.make?.trim()) errors.make = 'La marque est requise';
            if (!formData.model?.trim()) errors.model = 'Le modèle est requis';
            if (!formData.year || formData.year < 1886 || formData.year > new Date().getFullYear() + 1) {
                errors.year = 'Année invalide';
            }

            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                setSaveStatus('error');
                return;
            }

            // Préparation des données pour l'API
            const vehicleData = {
                ...formData,
                year: Number(formData.year),
                labels: formData.labels || [],
            } as CreateVehicleInput;

            const newVehicle = await createVehicle(vehicleData);
            setSaveStatus('success');
            
            // Redirection vers la page de détails du véhicule créé
            setTimeout(() => {
                router.push(`/vehicles/list/${newVehicle.id}`);
            }, 1000);
            
        } catch (err) {
            console.error('Erreur lors de la création du véhicule:', err);
            setSaveStatus('error');
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
        ${activeTab === id
                    ? 'bg-green-50 text-[#008751] border-r-2 border-[#008751]'
                    : 'text-gray-600 hover:bg-gray-50'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Vehicles</div>
                            <h1 className="text-2xl font-bold text-gray-900">New Vehicle</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || saveStatus === 'saving'}
                            className="bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2"
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Sauvegarde...
                                </>
                            ) : saveStatus === 'success' ? (
                                <>
                                    <Save size={16} />
                                    Véhicule créé !
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 flex gap-8">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-2 overflow-hidden sticky top-28">
                        <TabButton id="details" label="Details" icon={FileText} />
                        <TabButton id="maintenance" label="Maintenance" icon={PenTool} />
                        <TabButton id="lifecycle" label="Lifecycle" icon={RefreshCw} />
                        <TabButton id="financial" label="Financial" icon={BarChart3} />
                        <TabButton id="specifications" label="Specifications" icon={LayoutList} />
                        <TabButton id="settings" label="Settings" icon={Settings} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Add with a VIN</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">VIN/SN</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                                value={formData.vin || ''}
                                                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                            />
                                            <button className="bg-gray-100 border border-gray-300 text-gray-600 px-4 rounded flex items-center gap-2 text-sm hover:bg-gray-200 transition-colors">
                                                <Lock size={14} /> Decode
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Vehicle Identification Number or Serial Number. <a href="#" className="text-[#008751]">Learn More</a></p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Identification</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Enter a nickname to distinguish this vehicle in Fleetio. <a href="#" className="text-[#008751]">Learn More</a></p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.type || 'Car'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Car">Car</option>
                                            <option value="Truck">Truck</option>
                                            <option value="Van">Van</option>
                                            <option value="Bus">Bus</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Categorize this vehicle</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.status || 'Active'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="In Shop">In Shop</option>
                                            <option value="Out of Service">Out of Service</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Vehicle's status. <a href="#" className="text-[#008751]">Learn More</a></p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ownership <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.ownership || 'Owned'}
                                            onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                                        >
                                            <option value="Owned">Owned</option>
                                            <option value="Leased">Leased</option>
                                            <option value="Rented">Rented</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Maintenance Schedule</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose a Service Program</label>
                                    <p className="text-xs text-gray-500 mb-4">Service Programs automatically manage Service Reminders for Vehicles that share common preventative maintenance needs.</p>

                                    <div className={`p-4 rounded border-2 cursor-pointer mb-3 flex items-center gap-3 transition-colors
                         ${!formData.serviceProgram ? 'border-[#008751] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, serviceProgram: undefined })}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center 
                            ${!formData.serviceProgram ? 'border-[#008751]' : 'border-gray-300'}`}>
                                            {!formData.serviceProgram && <div className="w-2.5 h-2.5 rounded-full bg-[#008751]" />}
                                        </div>
                                        <div className="flex-1 flex justify-between">
                                            <span className="font-medium text-gray-900">None</span>
                                            <span className="text-gray-500 text-sm">No Service Reminders will be created</span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded border border-gray-200 cursor-not-allowed opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                                            <span className="font-medium text-gray-400">Choose an existing Service Program (Mock disabled)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lifecycle Tab */}
                    {activeTab === 'lifecycle' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">In-Service</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">In-Service Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.inServiceDate || ''}
                                            onChange={(e) => setFormData({ ...formData, inServiceDate: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Date vehicle entered active fleet service</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">In-Service Odometer</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.inServiceOdometer || ''}
                                            onChange={(e) => setFormData({ ...formData, inServiceOdometer: Number(e.target.value) })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Odometer reading on in-service date</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Vehicle Life Estimates</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Service Life in Months</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.estimatedServiceLifeMonths || ''}
                                            onChange={(e) => setFormData({ ...formData, estimatedServiceLifeMonths: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Resale Value</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ar</span>
                                            <input
                                                type="number"
                                                className="w-full border border-gray-300 rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                                value={formData.estimatedResaleValue || ''}
                                                onChange={(e) => setFormData({ ...formData, estimatedResaleValue: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Out-of-Service</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Out-of-Service Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.outOfServiceDate || ''}
                                            onChange={(e) => setFormData({ ...formData, outOfServiceDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Purchase Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Vendor</label>
                                        <input
                                            type="text" placeholder="Please select"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.purchaseVendor || ''}
                                            onChange={(e) => setFormData({ ...formData, purchaseVendor: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                                value={formData.purchaseDate || ''}
                                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ar</span>
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                                    value={formData.purchasePrice || ''}
                                                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            rows={4}
                                            value={formData.purchaseNotes || ''}
                                            onChange={(e) => setFormData({ ...formData, purchaseNotes: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Loan/Lease</h2>
                                <div className="flex border border-gray-200 rounded">
                                    {(['Loan', 'Lease', 'None'] as string[]).map((type) => (
                                        <div
                                            key={type}
                                            className={`flex-1 p-4 border-r last:border-r-0 cursor-pointer flex items-start gap-3
                                    ${formData.loanLeaseType === type ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                                            onClick={() => setFormData({ ...formData, loanLeaseType: type })}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5
                                    ${formData.loanLeaseType === type ? 'border-[#008751]' : 'border-gray-300'}`}>
                                                {formData.loanLeaseType === type && <div className="w-2.5 h-2.5 rounded-full bg-[#008751]" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{type}</div>
                                                <div className="text-xs text-gray-500">
                                                    {type === 'None' ? 'This vehicle is not being financed' :
                                                        type === 'Loan' ? 'This vehicle is associated with a loan' : 'This vehicle is being leased'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Primary Meter <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500 mb-3">Select how you measure utilization for this vehicle.</p>
                                    <div className="space-y-2">
                                        {['Miles', 'Kilometers', 'Hours'].map((unit) => (
                                            <label key={unit} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="primaryMeter"
                                                    className="text-[#008751] focus:ring-[#008751]"
                                                    checked={formData.primaryMeter === unit}
                                                    onChange={() => setFormData({ ...formData, primaryMeter: unit })}
                                                />
                                                <span className="text-sm text-gray-700">{unit}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Unit <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500 mb-3">Sets the volume units used when entering fuel entries.</p>
                                    <div className="space-y-2">
                                        {['Gallons (US)', 'Gallons (UK)', 'Liters'].map((unit) => (
                                            <label key={unit} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fuelUnit"
                                                    className="text-[#008751] focus:ring-[#008751]"
                                                    checked={formData.fuelUnit === unit}
                                                    onChange={() => setFormData({ ...formData, fuelUnit: unit })}
                                                />
                                                <span className="text-sm text-gray-700">{unit}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specifications Tab - Placeholder as no screenshot provided but usually just a list of fields */}
                    {activeTab === 'specifications' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
                            <p className="text-gray-500 italic">No specifications configured.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
