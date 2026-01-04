"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, FileText, PenTool, RefreshCw,
    BarChart3, Settings, Save, LayoutList, Lock, Loader2, AlertCircle
} from 'lucide-react';
import { useVehicle, useVehicleOperations } from '@/lib/hooks/useVehicles';

export default function EditVehicle({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { vehicle, loading: loadingVehicle, error: errorVehicle } = useVehicle(params.id, true);
    const { updateVehicle, loading: saving, error: errorSaving } = useVehicleOperations();

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

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                // Assurez-vous que les dates sont au format YYYY-MM-DD pour les inputs type="date"
                inServiceDate: vehicle.inServiceDate ? new Date(vehicle.inServiceDate).toISOString().split('T')[0] : '',
                outOfServiceDate: vehicle.outOfServiceDate ? new Date(vehicle.outOfServiceDate).toISOString().split('T')[0] : '',
                purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : '',
            });
        }
    }, [vehicle]);

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

            // Préparation et nettoyage des données pour l'API
            const cleanData = (obj: any) => {
                const cleaned: any = {};
                const computedFields = ['metrics', 'recentCosts', 'activeAssignment', 'lastMeterReading', 'lastMeterDate', 'lastMeterUnit', 'createdAt', 'updatedAt', 'userId'];

                Object.keys(obj).forEach(key => {
                    let value = obj[key];

                    // Omettre les champs calculés ou métadonnées
                    if (computedFields.includes(key)) {
                        return;
                    }

                    // Si c'est une chaîne vide, null ou undefined, on omet le champ
                    if (value === '' || value === null || value === undefined) {
                        return;
                    }

                    // Traitement spécial pour les dates attendues par Zod .datetime()
                    if (['inServiceDate', 'outOfServiceDate', 'purchaseDate'].includes(key) && typeof value === 'string' && value.length === 10) {
                        value = `${value}T00:00:00Z`;
                    }

                    if (key === 'year') {
                        cleaned[key] = Number(value);
                    } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                        const child = cleanData(value);
                        if (Object.keys(child).length > 0) cleaned[key] = child;
                    } else {
                        cleaned[key] = value;
                    }
                });
                return cleaned;
            };

            const updates = cleanData({
                ...formData,
                labels: formData.labels || [],
            }) as any;

            console.log('Mise à jour envoyée à l\'API:', updates);

            await updateVehicle(params.id, updates);
            setSaveStatus('success');

            // Redirection vers la page de détails
            setTimeout(() => {
                router.push(`/vehicles/list/${params.id}`);
            }, 1000);

        } catch (err: any) {
            console.error('Erreur lors de la mise à jour du véhicule:', err);
            setSaveStatus('error');
            if (err.details) {
                try {
                    const details = JSON.parse(err.details);
                    const apiErrors: Record<string, string> = {};
                    details.forEach((d: any) => {
                        apiErrors[d.path.join('.')] = d.message;
                    });
                    setValidationErrors(prev => ({ ...prev, ...apiErrors }));
                } catch (e) {
                    // Ignorer
                }
            }
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

    if (loadingVehicle) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-[#008751]" size={48} />
                    <p className="text-gray-600">Chargement du véhicule...</p>
                </div>
            </div>
        );
    }

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
                            <div className="text-sm text-gray-500 mb-1">Véhicules / {vehicle?.name}</div>
                            <h1 className="text-2xl font-bold text-gray-900">Modifier le véhicule</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || saveStatus === 'saving'}
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
                                    Mis à jour !
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
                        <TabButton id="details" label="Détails" icon={FileText} />
                        <TabButton id="maintenance" label="Maintenance" icon={PenTool} />
                        <TabButton id="lifecycle" label="Cycle de vie" icon={RefreshCw} />
                        <TabButton id="financial" label="Financier" icon={BarChart3} />
                        <TabButton id="specifications" label="Spécifications" icon={LayoutList} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {(errorVehicle || errorSaving) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3 text-red-800">
                            <AlertCircle size={20} />
                            <p>{errorVehicle || errorSaving}</p>
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Identification</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">VIN/SN</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.vin || ''}
                                            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Plaque d'immatriculation</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.licensePlate || ''}
                                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lecture actuelle du compteur</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.meterReading || ''}
                                            onChange={(e) => setFormData({ ...formData, meterReading: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du véhicule <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#008751] focus:ring-[#008751]'}`}
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Année <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${validationErrors.year ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#008751] focus:ring-[#008751]'}`}
                                                value={formData.year || ''}
                                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Marque <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${validationErrors.make ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#008751] focus:ring-[#008751]'}`}
                                                value={formData.make || ''}
                                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${validationErrors.model ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#008751] focus:ring-[#008751]'}`}
                                                value={formData.model || ''}
                                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.type || 'Car'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Car">Voiture</option>
                                            <option value="Truck">Camion</option>
                                            <option value="Pickup">Pickup</option>
                                            <option value="Van">Fourgonnette</option>
                                            <option value="Bus">Bus</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.status || 'ACTIVE'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="ACTIVE">Actif</option>
                                            <option value="INACTIVE">Inactif</option>
                                            <option value="MAINTENANCE">En atelier</option>
                                            <option value="DISPOSED">Hors service</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Propriété <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.ownership || 'Owned'}
                                            onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                                        >
                                            <option value="Owned">Possédé</option>
                                            <option value="Leased">En leasing</option>
                                            <option value="Rented">Loué</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Programme d'entretien</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Choisir un programme de service</label>
                                    <div className={`p-4 rounded border-2 cursor-pointer mb-3 flex items-center gap-3 transition-colors
                                        ${!formData.serviceProgram ? 'border-[#008751] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, serviceProgram: undefined })}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center 
                                            ${!formData.serviceProgram ? 'border-[#008751]' : 'border-gray-300'}`}>
                                            {!formData.serviceProgram && <div className="w-2.5 h-2.5 rounded-full bg-[#008751]" />}
                                        </div>
                                        <div className="flex-1 flex justify-between">
                                            <span className="font-medium text-gray-900">Aucun</span>
                                            <span className="text-gray-500 text-sm">Aucun rappel de service ne sera créé</span>
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
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Mise en service</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de mise en service</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.inServiceDate || ''}
                                            onChange={(e) => setFormData({ ...formData, inServiceDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Compteur à la mise en service</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.inServiceOdometer || ''}
                                            onChange={(e) => setFormData({ ...formData, inServiceOdometer: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Estimations de vie du véhicule</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Durée de vie estimée (en mois)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.estimatedServiceLifeMonths || ''}
                                            onChange={(e) => setFormData({ ...formData, estimatedServiceLifeMonths: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valeur de revente estimée</label>
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
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Détails d'achat</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur d'achat</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.purchaseVendor || ''}
                                            onChange={(e) => setFormData({ ...formData, purchaseVendor: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'achat</label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                                value={formData.purchaseDate || ''}
                                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat</label>
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
                        </div>
                    )}


                    {/* Specifications Tab */}
                    {activeTab === 'specifications' && (
                        <div className="space-y-6">
                            {/* Dimensions */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Dimensions</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Largeur (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.width || ''} onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.height || ''} onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Longueur (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.length || ''} onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume intérieur (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.interiorVolume || ''} onChange={(e) => setFormData({ ...formData, interiorVolume: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de passagers</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.passengerCount || ''} onChange={(e) => setFormData({ ...formData, passengerCount: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume de chargement (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.cargoVolume || ''} onChange={(e) => setFormData({ ...formData, cargoVolume: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Garde au sol (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.groundClearance || ''} onChange={(e) => setFormData({ ...formData, groundClearance: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Longueur du plateau (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.bedLength || ''} onChange={(e) => setFormData({ ...formData, bedLength: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Poids et performance */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Poids et performance</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poids à vide (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.curbWeight || ''} onChange={(e) => setFormData({ ...formData, curbWeight: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poids brut véhicule (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.grossVehicleWeight || ''} onChange={(e) => setFormData({ ...formData, grossVehicleWeight: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité de remorquage (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.towingCapacity || ''} onChange={(e) => setFormData({ ...formData, towingCapacity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Charge utile max (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.maxPayload || ''} onChange={(e) => setFormData({ ...formData, maxPayload: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Consommation et carburant */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Consommation et carburant</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville (L/100km)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.epaCity || ''} onChange={(e) => setFormData({ ...formData, epaCity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Autoroute (L/100km)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.epaHighway || ''} onChange={(e) => setFormData({ ...formData, epaHighway: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Combiné (L/100km)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.epaCombined || ''} onChange={(e) => setFormData({ ...formData, epaCombined: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualité carburant</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.fuelQuality || ''} onChange={(e) => setFormData({ ...formData, fuelQuality: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité réservoir (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.fuelTankCapacity || ''} onChange={(e) => setFormData({ ...formData, fuelTankCapacity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité réservoir 2 (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.fuelTank2Capacity || ''} onChange={(e) => setFormData({ ...formData, fuelTank2Capacity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité huile (L)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.oilCapacity || ''} onChange={(e) => setFormData({ ...formData, oilCapacity: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Moteur */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Moteur</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineDescription || ''} onChange={(e) => setFormData({ ...formData, engineDescription: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marque moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineBrand || ''} onChange={(e) => setFormData({ ...formData, engineBrand: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Aspiration moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineAspiration || ''} onChange={(e) => setFormData({ ...formData, engineAspiration: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de bloc</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineBlockType || ''} onChange={(e) => setFormData({ ...formData, engineBlockType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cylindres</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineCylinders || ''} onChange={(e) => setFormData({ ...formData, engineCylinders: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cylindrée (L)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineDisplacement || ''} onChange={(e) => setFormData({ ...formData, engineDisplacement: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Puissance max (CV)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.maxHp || ''} onChange={(e) => setFormData({ ...formData, maxHp: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Couple max (Nm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.maxTorque || ''} onChange={(e) => setFormData({ ...formData, maxTorque: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">RPM max</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.redlineRpm || ''} onChange={(e) => setFormData({ ...formData, redlineRpm: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valves moteur</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.engineValves || ''} onChange={(e) => setFormData({ ...formData, engineValves: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Transmission */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Transmission</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description transmission</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.transmissionDescription || ''} onChange={(e) => setFormData({ ...formData, transmissionDescription: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marque transmission</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.transmissionBrand || ''} onChange={(e) => setFormData({ ...formData, transmissionBrand: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de transmission</label>
                                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.transmissionType || ''} onChange={(e) => setFormData({ ...formData, transmissionType: e.target.value })}>
                                            <option value="">Sélectionner...</option>
                                            <option value="Manual">Manuelle</option>
                                            <option value="Automatic">Automatique</option>
                                            <option value="CVT">CVT</option>
                                            <option value="DCT">DCT</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de rapports</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.transmissionGears || ''} onChange={(e) => setFormData({ ...formData, transmissionGears: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Roues et pneus */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Roues et pneus</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de transmission (4x4, etc.)</label>
                                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.driveType || ''} onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}>
                                            <option value="">Sélectionner...</option>
                                            <option value="FWD">Traction avant (FWD)</option>
                                            <option value="RWD">Propulsion arrière (RWD)</option>
                                            <option value="AWD">Toutes roues motrices (AWD)</option>
                                            <option value="4WD">Quatre roues motrices (4WD)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Système de freinage</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.brakeSystem || ''} onChange={(e) => setFormData({ ...formData, brakeSystem: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Empattement (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.wheelbase || ''} onChange={(e) => setFormData({ ...formData, wheelbase: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Voie avant (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.frontTrackWidth || ''} onChange={(e) => setFormData({ ...formData, frontTrackWidth: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Voie arrière (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.rearTrackWidth || ''} onChange={(e) => setFormData({ ...formData, rearTrackWidth: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Diamètre roue avant (in)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.frontWheelDiameter || ''} onChange={(e) => setFormData({ ...formData, frontWheelDiameter: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Diamètre roue arrière (in)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.rearWheelDiameter || ''} onChange={(e) => setFormData({ ...formData, rearWheelDiameter: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type pneu avant</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.frontTireType || ''} onChange={(e) => setFormData({ ...formData, frontTireType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PSI pneu avant</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.frontTirePsi || ''} onChange={(e) => setFormData({ ...formData, frontTirePsi: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type pneu arrière</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.rearTireType || ''} onChange={(e) => setFormData({ ...formData, rearTireType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PSI pneu arrière</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.rearTirePsi || ''} onChange={(e) => setFormData({ ...formData, rearTirePsi: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}