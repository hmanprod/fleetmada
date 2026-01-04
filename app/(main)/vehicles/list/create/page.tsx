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

            // Préparation et nettoyage des données pour l'API
            // On filtre les chaînes vides, null, et undefined pour les champs optionnels
            // Zod attend soit une valeur valide (ex: datetime), soit undefined, mais pas null ou chaine vide
            const cleanData = (obj: any) => {
                const cleaned: any = {};
                Object.keys(obj).forEach(key => {
                    let value = obj[key];

                    // Si c'est une chaîne vide, null ou undefined, on omet le champ
                    if (value === '' || value === null || value === undefined) {
                        return;
                    }

                    // Traitement spécial pour les dates attendues par Zod .datetime()
                    // Les inputs HTML renvoient YYYY-MM-DD, Zod attend ISO string
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

            const vehicleData = cleanData({
                ...formData,
                labels: formData.labels || [],
            }) as CreateVehicleInput;

            console.log('Données envoyées à l\'API:', vehicleData);

            const newVehicle = await createVehicle(vehicleData);
            setSaveStatus('success');

            // Redirection vers la page de détails du véhicule créé
            setTimeout(() => {
                router.push(`/vehicles/list/${newVehicle.id}`);
            }, 1000);

        } catch (err: any) {
            console.error('Erreur lors de la création du véhicule:', err);
            setSaveStatus('error');
            // Si l'erreur vient de la validation API (Zod), on pourrait tenter de l'afficher
            if (err.details) {
                try {
                    const details = JSON.parse(err.details);
                    const apiErrors: Record<string, string> = {};
                    details.forEach((d: any) => {
                        apiErrors[d.path.join('.')] = d.message;
                    });
                    setValidationErrors(prev => ({ ...prev, ...apiErrors }));
                } catch (e) {
                    // Ignorer si le parse échoue
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
                            <div className="text-sm text-gray-500 mb-1">Véhicules</div>
                            <h1 className="text-2xl font-bold text-gray-900">Nouveau véhicule</h1>
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
                        <TabButton id="details" label="Détails" icon={FileText} />
                        <TabButton id="maintenance" label="Maintenance" icon={PenTool} />
                        <TabButton id="lifecycle" label="Cycle de vie" icon={RefreshCw} />
                        <TabButton id="financial" label="Financier" icon={BarChart3} />
                        <TabButton id="specifications" label="Spécifications" icon={LayoutList} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/*<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
                            </div>*/}

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Identification</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du véhicule <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Entrez un surnom pour distinguer ce véhicule dans Fleetio. <a href="#" className="text-[#008751]">En savoir plus</a></p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">VIN/SN <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] ${validationErrors.vin ? 'border-red-500' : 'border-gray-300'}`}
                                            value={formData.vin || ''}
                                            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                        />
                                        {validationErrors.vin && <p className="text-xs text-red-500 mt-1">{validationErrors.vin}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Numéro d'identification du véhicule ou numéro de série.</p>
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

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Année <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] ${validationErrors.year ? 'border-red-500' : 'border-gray-300'}`}
                                                value={formData.year || ''}
                                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            />
                                            {validationErrors.year && <p className="text-xs text-red-500 mt-1">{validationErrors.year}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Marque <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] ${validationErrors.make ? 'border-red-500' : 'border-gray-300'}`}
                                                value={formData.make || ''}
                                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                            />
                                            {validationErrors.make && <p className="text-xs text-red-500 mt-1">{validationErrors.make}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] ${validationErrors.model ? 'border-red-500' : 'border-gray-300'}`}
                                                value={formData.model || ''}
                                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            />
                                            {validationErrors.model && <p className="text-xs text-red-500 mt-1">{validationErrors.model}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                                        <select
                                            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] ${validationErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                                            value={formData.type || 'Car'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Car">Voiture</option>
                                            <option value="Truck">Camion</option>
                                            <option value="Pickup">Pickup</option>
                                            <option value="Van">Fourgonnette</option>
                                            <option value="Bus">Bus</option>
                                        </select>
                                        {validationErrors.type && <p className="text-xs text-red-500 mt-1">{validationErrors.type}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Catégorisez ce véhicule</p>
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
                                        <p className="text-xs text-gray-500 mt-1">Statut du véhicule. <a href="#" className="text-[#008751]">En savoir plus</a></p>
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
                                    <p className="text-xs text-gray-500 mb-4">Les programmes de service gèrent automatiquement les rappels de service pour les véhicules partageant des besoins de maintenance préventive communs.</p>

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

                                    <div className="p-4 rounded border border-gray-200 cursor-not-allowed opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                                            <span className="font-medium text-gray-400">Choisir un programme existant (Désactivé)</span>
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
                                        <p className="text-xs text-gray-500 mt-1">Date à laquelle le véhicule est entré en service actif</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Compteur à la mise en service</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                                            value={formData.inServiceOdometer || ''}
                                            onChange={(e) => setFormData({ ...formData, inServiceOdometer: Number(e.target.value) })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lecture du compteur à la date de mise en service</p>
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

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Hors service</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de retrait du service</label>
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
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Détails de l'achat</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur d'achat</label>
                                        <input
                                            type="text" placeholder="Veuillez sélectionner"
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

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Prêt/Leasing</h2>
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
                                                <div className="font-medium text-gray-900">
                                                    {type === 'None' ? 'Aucun' : type === 'Loan' ? 'Prêt' : 'Leasing'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {type === 'None' ? 'Ce véhicule n\'est pas financé' :
                                                        type === 'Loan' ? 'Ce véhicule est associé à un prêt' : 'Ce véhicule est sous contrat de leasing'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.width || ''} onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.height || ''} onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Longueur (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.length || ''} onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume intérieur (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.interiorVolume || ''} onChange={(e) => setFormData({ ...formData, interiorVolume: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de passagers</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]" value={formData.passengerCount || ''} onChange={(e) => setFormData({ ...formData, passengerCount: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume de chargement (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.cargoVolume || ''} onChange={(e) => setFormData({ ...formData, cargoVolume: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Garde au sol (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.groundClearance || ''} onChange={(e) => setFormData({ ...formData, groundClearance: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Longueur de la caisse (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.bedLength || ''} onChange={(e) => setFormData({ ...formData, bedLength: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Poids et performance */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Poids et performance</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poids à vide (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.curbWeight || ''} onChange={(e) => setFormData({ ...formData, curbWeight: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poids nominal brut (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.grossVehicleWeight || ''} onChange={(e) => setFormData({ ...formData, grossVehicleWeight: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité de remorquage (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.towingCapacity || ''} onChange={(e) => setFormData({ ...formData, towingCapacity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Charge utile maximale (kg)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.maxPayload || ''} onChange={(e) => setFormData({ ...formData, maxPayload: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Fuel Economy & Fuel */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Fuel Economy & Fuel</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">EPA City (L/100km)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.epaCity || ''} onChange={(e) => setFormData({ ...formData, epaCity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">EPA Highway (L/100km)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.epaHighway || ''} onChange={(e) => setFormData({ ...formData, epaHighway: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">EPA Combined (L/100km)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.epaCombined || ''} onChange={(e) => setFormData({ ...formData, epaCombined: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Quality</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.fuelQuality || ''} onChange={(e) => setFormData({ ...formData, fuelQuality: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Tank Capacity (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.fuelTankCapacity || ''} onChange={(e) => setFormData({ ...formData, fuelTankCapacity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Tank 2 Capacity (L)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.fuelTank2Capacity || ''} onChange={(e) => setFormData({ ...formData, fuelTank2Capacity: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Oil Capacity (L)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.oilCapacity || ''} onChange={(e) => setFormData({ ...formData, oilCapacity: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Engine */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Moteur</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description du moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineDescription || ''} onChange={(e) => setFormData({ ...formData, engineDescription: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marque du moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineBrand || ''} onChange={(e) => setFormData({ ...formData, engineBrand: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Aspiration du moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineAspiration || ''} onChange={(e) => setFormData({ ...formData, engineAspiration: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de bloc moteur</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineBlockType || ''} onChange={(e) => setFormData({ ...formData, engineBlockType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cylindres</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineCylinders || ''} onChange={(e) => setFormData({ ...formData, engineCylinders: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cylindrée (L)</label>
                                        <input type="number" step="0.1" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineDisplacement || ''} onChange={(e) => setFormData({ ...formData, engineDisplacement: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Puissance max (HP)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.maxHp || ''} onChange={(e) => setFormData({ ...formData, maxHp: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Couple max (Nm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.maxTorque || ''} onChange={(e) => setFormData({ ...formData, maxTorque: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Régime max (RPM)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.redlineRpm || ''} onChange={(e) => setFormData({ ...formData, redlineRpm: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Soupapes</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.engineValves || ''} onChange={(e) => setFormData({ ...formData, engineValves: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Transmission */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Transmission</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description de la transmission</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.transmissionDescription || ''} onChange={(e) => setFormData({ ...formData, transmissionDescription: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marque de la transmission</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.transmissionBrand || ''} onChange={(e) => setFormData({ ...formData, transmissionBrand: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de transmission</label>
                                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.transmissionType || ''} onChange={(e) => setFormData({ ...formData, transmissionType: e.target.value })}>
                                            <option value="">Sélectionner...</option>
                                            <option value="Manual">Manuelle</option>
                                            <option value="Automatic">Automatique</option>
                                            <option value="CVT">CVT</option>
                                            <option value="DCT">DCT</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de rapports</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.transmissionGears || ''} onChange={(e) => setFormData({ ...formData, transmissionGears: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Wheels & Tires */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Roues et pneus</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de propulsion</label>
                                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.driveType || ''} onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}>
                                            <option value="">Sélectionner...</option>
                                            <option value="FWD">Traction avant (FWD)</option>
                                            <option value="RWD">Propulsion arrière (RWD)</option>
                                            <option value="AWD">Transmission intégrale (AWD)</option>
                                            <option value="4WD">Quatre roues motrices (4WD)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Système de freinage</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.brakeSystem || ''} onChange={(e) => setFormData({ ...formData, brakeSystem: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Empattement (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.wheelbase || ''} onChange={(e) => setFormData({ ...formData, wheelbase: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Voie avant (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.frontTrackWidth || ''} onChange={(e) => setFormData({ ...formData, frontTrackWidth: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Voie arrière (mm)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.rearTrackWidth || ''} onChange={(e) => setFormData({ ...formData, rearTrackWidth: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Diamètre roue avant (po)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.frontWheelDiameter || ''} onChange={(e) => setFormData({ ...formData, frontWheelDiameter: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Diamètre roue arrière (po)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.rearWheelDiameter || ''} onChange={(e) => setFormData({ ...formData, rearWheelDiameter: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de pneu avant</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.frontTireType || ''} onChange={(e) => setFormData({ ...formData, frontTireType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pression pneu avant (PSI)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.frontTirePsi || ''} onChange={(e) => setFormData({ ...formData, frontTirePsi: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de pneu arrière</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.rearTireType || ''} onChange={(e) => setFormData({ ...formData, rearTireType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pression pneu arrière (PSI)</label>
                                        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={formData.rearTirePsi || ''} onChange={(e) => setFormData({ ...formData, rearTirePsi: Number(e.target.value) })} />
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
