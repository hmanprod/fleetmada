'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Calendar, Plus, Car, Search, MoreHorizontal, CheckCircle, Image as ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useVendors } from '@/lib/hooks/useVendors';
import { vehiclesAPI } from '@/lib/services/vehicles-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function CreateExpensePage() {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { vehicles, loading: vehiclesLoading } = useVehicles();
    const { vendors, loading: vendorsLoading } = useVendors();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vehicleId: '',
        date: new Date().toISOString().split('T')[0],
        currency: 'MGA',
        type: '',
        vendor: '',
        vendorId: '',
        amount: 0,
        notes: '',
        source: 'Manually Entered',
        docs: 0,
        photos: 0
    });

    const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const vehicleDropdownRef = React.useRef<HTMLDivElement>(null);

    const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const vendorDropdownRef = React.useRef<HTMLDivElement>(null);

    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<File[]>([]);
    const photoInputRef = React.useRef<HTMLInputElement>(null);
    const docInputRef = React.useRef<HTMLInputElement>(null);

    // Click outside handler for dropdowns
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target as Node)) {
                setIsVehicleDropdownOpen(false);
            }
            if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target as Node)) {
                setIsVendorDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredVehicles = vehicles.filter(vehicle => {
        const searchLower = vehicleSearch.toLowerCase();
        return vehicle.name.toLowerCase().includes(searchLower) ||
            (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchLower)) ||
            (vehicle.vin && vehicle.vin.toLowerCase().includes(searchLower));
    });

    const filteredVendors = vendors.filter(vendor => {
        const searchLower = vendorSearch.toLowerCase();
        return vendor.name.toLowerCase().includes(searchLower) ||
            (vendor.contactEmail && vendor.contactEmail.toLowerCase().includes(searchLower));
    });

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    const selectedVendor = vendors.find(v => v.id === formData.vendorId);

    const validateForm = () => {
        if (!formData.vehicleId) {
            toast.error('Veuillez sélectionner un véhicule');
            return false;
        }
        if (!formData.type) {
            toast.error('Veuillez sélectionner un type de dépense');
            return false;
        }
        if (formData.amount <= 0) {
            toast.error('Veuillez entrer un montant valide');
            return false;
        }
        if (!formData.date) {
            toast.error('Veuillez sélectionner une date');
            return false;
        }
        return true;
    };

    const uploadFiles = async (expenseId: string) => {
        if (selectedPhotos.length === 0 && selectedDocs.length === 0) return;

        const uploadFormData = new FormData();
        selectedPhotos.forEach(file => uploadFormData.append('files', file));
        selectedDocs.forEach(file => uploadFormData.append('files', file));

        uploadFormData.append('attachedTo', 'expense');
        uploadFormData.append('attachedId', expenseId);

        const token = localStorage.getItem('authToken');

        const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: uploadFormData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Échec du téléchargement des fichiers');
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            // Format date for API (ISO string)
            const dateObj = new Date(formData.date);
            const isoDate = dateObj.toISOString();

            const newExpense = await vehiclesAPI.createVehicleExpense(formData.vehicleId, {
                ...formData,
                date: isoDate,
                photos: selectedPhotos.length,
                docs: selectedDocs.length
            });

            await uploadFiles(newExpense.id);

            toast.success('Entrée de dépense créée avec succès');

            setTimeout(() => {
                router.push('/vehicles/expense');
            }, 1000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la dépense';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndAddAnother = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const dateObj = new Date(formData.date);
            const isoDate = dateObj.toISOString();

            const newExpense = await vehiclesAPI.createVehicleExpense(formData.vehicleId, {
                ...formData,
                date: isoDate,
                photos: selectedPhotos.length,
                docs: selectedDocs.length
            });

            await uploadFiles(newExpense.id);

            toast.success('Entrée de dépense créée avec succès');

            // Reset form
            setFormData({
                ...formData,
                vehicleId: '',
                amount: 0,
                notes: '',
                vendor: '',
                vendorId: '',
                type: ''
            });
            setVehicleSearch('');
            setVendorSearch('');
            setSelectedPhotos([]);
            setSelectedDocs([]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la dépense';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/vehicles/expense" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Entrées de dépenses
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Nouvelle dépense</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/vehicles/expense')}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer la dépense'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Details Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Détails</h2>

                    <div className="space-y-4 max-w-3xl">
                        <div className="relative" ref={vehicleDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule <span className="text-red-500">*</span></label>

                            <div className="relative">
                                <div
                                    className={`w-full p-2 border rounded text-sm bg-white cursor-pointer flex items-center justify-between transition-all ${isVehicleDropdownOpen ? 'ring-1 ring-[#008751] border-[#008751]' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => !vehiclesLoading && setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Car size={16} className="text-gray-400" />
                                        {selectedVehicle ? (
                                            <div>
                                                <span className="font-medium text-gray-900">{selectedVehicle.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">{selectedVehicle.licensePlate || selectedVehicle.vin}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">{vehiclesLoading ? 'Chargement...' : 'Sélectionner un véhicule...'}</span>
                                        )}
                                    </div>
                                    <MoreHorizontal size={16} className="text-gray-400 rotate-90" />
                                </div>

                                {isVehicleDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Rechercher un véhicule..."
                                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#008751]"
                                                    value={vehicleSearch}
                                                    onChange={(e) => setVehicleSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredVehicles.length > 0 ? (
                                                filteredVehicles.map(v => (
                                                    <div
                                                        key={v.id}
                                                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group ${formData.vehicleId === v.id ? 'bg-green-50' : ''}`}
                                                        onClick={() => {
                                                            setFormData({ ...formData, vehicleId: v.id });
                                                            setIsVehicleDropdownOpen(false);
                                                            setVehicleSearch('');
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#008751]">{v.name}</div>
                                                            <div className="text-xs text-gray-500">{v.licensePlate || 'Sans plaque'} • {v.type || 'Standard'}</div>
                                                        </div>
                                                        {formData.vehicleId === v.id && <div className="text-[#008751]"><CheckCircle size={14} /></div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-4 text-center text-xs text-gray-500 italic">Aucun véhicule trouvé</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de dépense <span className="text-red-500">*</span></label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Veuillez sélectionner</option>
                                <option value="Fuel">Carburant</option>
                                <option value="Insurance">Assurance</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Tolls">Péages</option>
                                <option value="Vehicle Registration">Immatriculation du véhicule</option>
                                <option value="Vehicle Registration and Taxes">Immatriculation et taxes</option>
                                <option value="Telematics Device">Dispositif télématique</option>
                                <option value="Safety Technology">Technologie de sécurité</option>
                            </select>
                        </div>

                        <div className="relative" ref={vendorDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendeur</label>
                            <div className="relative">
                                <div
                                    className={`w-full p-2 border rounded text-sm bg-white cursor-pointer flex items-center justify-between transition-all ${isVendorDropdownOpen ? 'ring-1 ring-[#008751] border-[#008751]' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => !vendorsLoading && setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">V</div>
                                        {selectedVendor ? (
                                            <div>
                                                <span className="font-medium text-gray-900">{selectedVendor.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">{vendorsLoading ? 'Chargement...' : 'Sélectionner un vendeur...'}</span>
                                        )}
                                    </div>
                                    <MoreHorizontal size={16} className="text-gray-400 rotate-90" />
                                </div>

                                {isVendorDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Rechercher un vendeur..."
                                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#008751]"
                                                    value={vendorSearch}
                                                    onChange={(e) => setVendorSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredVendors.length > 0 ? (
                                                filteredVendors.map(v => (
                                                    <div
                                                        key={v.id}
                                                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group ${formData.vendorId === v.id ? 'bg-green-50' : ''}`}
                                                        onClick={() => {
                                                            setFormData({ ...formData, vendorId: v.id, vendor: v.name });
                                                            setIsVendorDropdownOpen(false);
                                                            setVendorSearch('');
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#008751]">{v.name}</div>
                                                            <div className="text-xs text-gray-500">{v.classification?.join(', ') || 'No Classification'}</div>
                                                        </div>
                                                        {formData.vendorId === v.id && <div className="text-[#008751]"><CheckCircle size={14} /></div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-4 text-center">
                                                    <div className="text-xs text-gray-500 italic mb-2">Aucun vendeur trouvé</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Ar</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded pl-8 pr-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Photos</h3>
                            {selectedPhotos.length > 0 && (
                                <span className="text-xs font-medium text-gray-500">{selectedPhotos.length} fichier(s) sélectionné(s)</span>
                            )}
                        </div>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={photoInputRef}
                            onChange={(e) => e.target.files && setSelectedPhotos(prev => [...prev, ...Array.from(e.target.files!)])}
                        />

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => photoInputRef.current?.click()}
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3 text-gray-400">
                                <Plus size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Ajouter des photos</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 10Mo</p>
                        </div>

                        {selectedPhotos.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {selectedPhotos.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <ImageIcon size={14} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPhotos(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                            className="text-red-500 hover:text-red-700 font-bold px-1"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Documents</h3>
                            {selectedDocs.length > 0 && (
                                <span className="text-xs font-medium text-gray-500">{selectedDocs.length} fichier(s) sélectionné(s)</span>
                            )}
                        </div>

                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            className="hidden"
                            ref={docInputRef}
                            onChange={(e) => e.target.files && setSelectedDocs(prev => [...prev, ...Array.from(e.target.files!)])}
                        />

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => docInputRef.current?.click()}
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3 text-gray-400">
                                <Plus size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Ajouter des documents</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel jusqu'à 50Mo</p>
                        </div>

                        {selectedDocs.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {selectedDocs.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText size={14} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDocs(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                            className="text-red-500 hover:text-red-700 font-bold px-1"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pb-10">
                    <button
                        onClick={handleSaveAndAddAnother}
                        disabled={loading}
                        className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Enregistrer et ajouter un autre
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer la dépense'}
                    </button>
                </div>
            </div>
        </div>
    );
}
