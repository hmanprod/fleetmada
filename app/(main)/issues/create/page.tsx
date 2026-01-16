'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, FileText, Upload, Plus, X, AlertCircle, CheckCircle, Camera, User, Search, MoreHorizontal, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useIssues from '@/lib/hooks/useIssues';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import type { IssueCreateData } from '@/lib/services/issues-api';

export default function NewIssuePage() {
    const router = useRouter();
    const { createIssue } = useIssues();

    // Récupération des véhicules via la vraie API
    const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();

    // Récupération des contacts
    const { contacts, loading: contactsLoading } = useContacts();

    // États du formulaire
    const [formData, setFormData] = useState<IssueCreateData>({
        vehicleId: '',
        summary: '',
        priority: 'MEDIUM',
        labels: [],
        assignedTo: []
    });

    const [selectedLabel, setSelectedLabel] = useState('');
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    // Contact Dropdown State
    const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
    const [contactSearch, setContactSearch] = useState('');
    const contactDropdownRef = useRef<HTMLDivElement>(null);

    // Vehicle Dropdown State
    const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const vehicleDropdownRef = useRef<HTMLDivElement>(null);

    // États d'interface
    const [loading, setLoading] = useState(false);

    const { toast, toasts, removeToast } = useToast();

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) {
                setIsContactDropdownOpen(false);
            }
            if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target as Node)) {
                setIsVehicleDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredContacts = contacts.filter(contact => {
        const searchLower = contactSearch.toLowerCase();
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        return fullName.includes(searchLower) ||
            (contact.email && contact.email.toLowerCase().includes(searchLower));
    });

    const selectedContacts = contacts.filter(c => formData.assignedTo?.includes(c.id));

    const filteredVehicles = vehicles.filter(vehicle => {
        const searchLower = vehicleSearch.toLowerCase();
        return vehicle.name.toLowerCase().includes(searchLower) ||
            (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchLower));
    });

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);


    const mockLabels = ['Electrical', 'Mechanical', 'Body', 'Safety', 'Recall'];

    const handleCancel = () => {
        router.back();
    };

    const handleInputChange = (field: keyof IssueCreateData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddLabel = () => {
        if (selectedLabel && !formData.labels?.includes(selectedLabel)) {
            setFormData(prev => ({
                ...prev,
                labels: [...(prev.labels || []), selectedLabel]
            }));
            setSelectedLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            labels: (prev.labels || []).filter(label => label !== labelToRemove)
        }));
    };

    const handleAddContact = (contactId: string) => {
        if (contactId && !formData.assignedTo?.includes(contactId)) {
            setFormData(prev => ({
                ...prev,
                assignedTo: [...(prev.assignedTo || []), contactId]
            }));
            setContactSearch('');
        }
    };

    const handleRemoveContact = (contactId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: (prev.assignedTo || []).filter(id => id !== contactId)
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setUploadedImages(prev => [...prev, ...files]);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleCamera = () => {
        // Simulate camera capture - in real app would use camera API
        const mockFile = new File([''], 'camera-photo.jpg', { type: 'image/jpeg' });
        setUploadedImages(prev => [...prev, mockFile]);
    };

    const validateForm = (): boolean => {
        if (!formData.vehicleId) {
            toast.error('Veuillez sélectionner un véhicule');
            return false;
        }
        if (!formData.summary.trim()) {
            toast.error('Le résumé est requis');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            await createIssue({
                ...formData,
                summary: formData.summary.trim()
            });

            toast.success('Problème créé avec succès');

            // Redirect after short delay
            setTimeout(() => {
                router.push('/issues');
            }, 1500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndAddAnother = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            await createIssue({
                ...formData,
                summary: formData.summary.trim()
            });

            // Reset form for new entry
            setFormData({
                vehicleId: '',
                summary: '',
                priority: 'MEDIUM',
                labels: [],
                assignedTo: []
            });
            setSelectedLabel('');
            setUploadedImages([]);

            toast.success('Problème créé avec succès. Vous pouvez en ajouter un autre.');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Issues
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Nouveau Problème</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Sauvegarder</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <ToastContainer toasts={toasts} removeToast={removeToast} />

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Détails</h2>

                    <div className="space-y-6">
                        <div className="relative" ref={vehicleDropdownRef}>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Véhicule <span className="text-red-500">*</span></label>
                            {vehiclesError && (
                                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                    Erreur lors du chargement des véhicules: {vehiclesError}
                                </div>
                            )}

                            <div className="relative">
                                <div
                                    className={`w-full p-2.5 border rounded-md bg-white cursor-pointer flex items-center justify-between transition-all ${isVehicleDropdownOpen ? 'ring-2 ring-[#008751] border-[#008751]' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => !vehiclesLoading && setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Car size={18} className="text-gray-400" />
                                        {selectedVehicle ? (
                                            <div>
                                                <span className="font-medium text-gray-900">{selectedVehicle.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">{selectedVehicle.licensePlate}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">{vehiclesLoading ? 'Chargement...' : 'Sélectionner un véhicule...'}</span>
                                        )}
                                    </div>
                                    <MoreHorizontal size={18} className="text-gray-400 rotate-90" />
                                </div>

                                {isVehicleDropdownOpen && (
                                    <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Rechercher véhicule ou plaque..."
                                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#008751]"
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
                                                        className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors ${formData.vehicleId === v.id ? 'bg-green-50' : ''}`}
                                                        onClick={() => {
                                                            handleInputChange('vehicleId', v.id);
                                                            setIsVehicleDropdownOpen(false);
                                                            setVehicleSearch('');
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#008751]">{v.name}</div>
                                                            <div className="text-xs text-gray-500">{v.licensePlate || 'Sans plaque'} • {v.type || 'Standard'}</div>
                                                        </div>
                                                        {formData.vehicleId === v.id && <div className="w-2 h-2 rounded-full bg-[#008751]"></div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500 italic">Aucun véhicule trouvé</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                            <div className="relative">
                                <select
                                    data-testid="priority-select"
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white appearance-none pl-10"
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                >
                                    <option value="LOW">Faible</option>
                                    <option value="MEDIUM">Moyenne</option>
                                    <option value="HIGH">Haute</option>
                                    <option value="CRITICAL">Critique</option>
                                </select>
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full w-4 h-4 border ${formData.priority === 'LOW' ? 'bg-blue-500 border-blue-500' :
                                    formData.priority === 'MEDIUM' ? 'bg-yellow-500 border-yellow-500' :
                                        formData.priority === 'HIGH' ? 'bg-orange-500 border-orange-500' :
                                            formData.priority === 'CRITICAL' ? 'bg-red-600 border-red-600' :
                                                'border-dashed border-gray-400'
                                    }`}></div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Résumé <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                data-testid="summary-input"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                value={formData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                placeholder="Décrivez brièvement le problème"
                            />
                            <p className="text-xs text-gray-500 mt-1">Aperçu bref du problème</p>
                        </div>



                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Étiquettes</label>
                            <div className="flex gap-2 mb-2">
                                <select
                                    className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-white"
                                    value={selectedLabel}
                                    onChange={(e) => setSelectedLabel(e.target.value)}
                                >
                                    <option value="">Veuillez sélectionner</option>
                                    {mockLabels.map(label => (
                                        <option key={label} value={label}>{label}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddLabel}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium"
                                >
                                    Ajouter
                                </button>
                            </div>
                            {formData.labels && formData.labels.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.labels.map((label, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                            {label}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLabel(label)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Utilisez les étiquettes pour catégoriser et grouper.</p>
                        </div>

                        <div className="relative" ref={contactDropdownRef}>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Assigné à</label>

                            <div className="relative">
                                <div
                                    className={`w-full p-2.5 border rounded-md bg-white cursor-pointer flex items-center justify-between transition-all ${isContactDropdownOpen ? 'ring-2 ring-[#008751] border-[#008751]' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                                >
                                    <div className="flex items-center gap-3">
                                        <User size={18} className="text-gray-400" />
                                        {formData.assignedTo && formData.assignedTo.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedContacts.map(c => (
                                                    <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                                                        {c.firstName} {c.lastName}
                                                        <span onClick={(e) => { e.stopPropagation(); handleRemoveContact(c.id); }} className="hover:text-blue-900 cursor-pointer"><X size={10} /></span>
                                                    </span>
                                                ))}
                                                {selectedContacts.length === 0 && <span className="text-sm font-medium text-gray-900">{formData.assignedTo.length} sélectionné(s)</span>}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Sélectionner un contact...</span>
                                        )}
                                    </div>
                                    <MoreHorizontal size={18} className="text-gray-400 rotate-90" />
                                </div>

                                {isContactDropdownOpen && (
                                    <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Rechercher nom ou email..."
                                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#008751]"
                                                    value={contactSearch}
                                                    onChange={(e) => setContactSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredContacts.length > 0 ? (
                                                filteredContacts.map(c => {
                                                    const isSelected = formData.assignedTo?.includes(c.id);
                                                    return (
                                                        <div
                                                            key={c.id}
                                                            className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors ${isSelected ? 'bg-green-50' : ''}`}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    handleRemoveContact(c.id);
                                                                } else {
                                                                    handleAddContact(c.id);
                                                                }
                                                                // Don't close for multi-select convenience
                                                                // setIsContactDropdownOpen(false); 
                                                            }}
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 group-hover:text-[#008751]">{c.firstName} {c.lastName}</div>
                                                                <div className="text-xs text-gray-500">{c.jobTitle || c.email}</div>
                                                            </div>
                                                            {isSelected && <div className="text-[#008751]"><CheckCircle size={16} /></div>}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500 italic">Aucun contact trouvé</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Images</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Télécharger des images</label>
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choisir fichiers
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCamera}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Prendre photo
                                </button>
                            </div>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {uploadedImages.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Fichiers sélectionnés</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {uploadedImages.map((file, index) => (
                                        <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1.5 right-1.5 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                                            >
                                                <X size={14} />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                                                {file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-500">Formats supportés: JPG, PNG, GIF. Taille max: 5MB par image.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleCancel} className="text-[#008751] hover:underline text-sm font-medium">Annuler</button>
                    <div className="flex gap-3">
                        <button onClick={handleSaveAndAddAnother} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold bg-white hover:bg-gray-50">Sauvegarder et Ajouter un Autre</button>
                        <button onClick={handleSave} data-testid="save-button" className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Sauvegarder</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
