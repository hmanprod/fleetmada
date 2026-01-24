'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Globe, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { vendorsAPI, UpdateVendorRequest, Vendor } from '@/lib/services/vendors-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function VendorEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('Madagascar');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [classification, setClassification] = useState('');
    const [contactName, setContactName] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const response = await vendorsAPI.getVendor(params.id);
                if (response.success && response.data) {
                    const vendor = response.data;
                    setName(vendor.name || '');
                    setPhone(vendor.phone || '');
                    setWebsite(vendor.website || '');
                    setEmail(vendor.contactEmail || '');
                    setContactName(vendor.contactName || '');
                    setClassification(vendor.classification?.[0] || '');

                    // Try to parse address
                    if (vendor.address) {
                        const parts = vendor.address.split(', ');
                        // This is a naive split, but it's the best we can do since the API stores it as a single string
                        // Order from create page: address, city, state zip, country
                        if (parts.length >= 4) {
                            setAddress(parts[0]);
                            setCity(parts[1]);
                            // Handle "state zip"
                            const stateZip = parts[2].split(' ');
                            if (stateZip.length >= 2) {
                                setState(stateZip[0]);
                                setZip(stateZip[1]);
                            } else {
                                setState(parts[2]);
                            }
                            setCountry(parts[3]);
                        } else if (parts.length === 3) {
                            setAddress(parts[0]);
                            setCity(parts[1]);
                            setCountry(parts[2]);
                        } else if (parts.length === 2) {
                            setAddress(parts[0]);
                            setCountry(parts[1]);
                        } else {
                            setAddress(vendor.address);
                        }
                    }

                    // Notes might be in labels or not stored, create page says they aren't synced
                    // But maybe they are in the labels if they were somehow added? 
                    // For now, let's just keep it empty as per create page comment.
                }
            } catch (error) {
                console.error('Error fetching vendor:', error);
                toast.error('Erreur', 'Impossible de charger les données du fournisseur');
            } finally {
                setLoading(false);
            }
        };

        fetchVendor();
    }, [params.id]);

    const handleCancel = () => {
        router.push(`/vendors/${params.id}`);
    };

    const validateForm = () => {
        if (!name.trim()) {
            toast.error('Champ requis', 'Le nom du fournisseur est obligatoire');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);

        // Combine address parts
        const addressParts = [
            address,
            city,
            state && zip ? `${state} ${zip}` : (state || zip),
            country
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        const vendorData: UpdateVendorRequest = {
            name,
            address: fullAddress,
            phone,
            website,
            contactEmail: email,
            contactName: contactName,
            classification: classification ? [classification] : [],
        };

        try {
            await vendorsAPI.updateVendor(params.id, vendorData);
            toast.success('Succès', 'Fournisseur mis à jour avec succès');
            setTimeout(() => {
                router.push(`/vendors/${params.id}`);
            }, 1500);
        } catch (error) {
            console.error('Error updating vendor:', error);
            toast.error('Erreur', error instanceof Error ? error.message : 'Échec de la mise à jour du fournisseur');
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await vendorsAPI.deleteVendor(params.id);
            toast.success('Succès', 'Fournisseur supprimé avec succès');
            setTimeout(() => {
                router.push('/vendors');
            }, 1500);
        } catch (error) {
            console.error('Error deleting vendor:', error);
            toast.error('Erreur', error instanceof Error ? error.message : 'Échec de la suppression du fournisseur');
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-[#008751]" size={48} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Retour
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier le fournisseur : {name}</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium flex items-center gap-2"
                        disabled={saving || deleting}
                    >
                        <Trash2 size={18} /> Supprimer
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white border border-gray-300"
                        disabled={saving || deleting}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || deleting}
                        className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Informations générales</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="ex: Galana, Jovenna, Total, Concessionnaire..."
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                            <select
                                value={classification}
                                onChange={e => setClassification(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="">Sélectionner</option>
                                <option value="Fuel">Carburant</option>
                                <option value="Service">Service</option>
                                <option value="Parts">Pièces</option>
                                <option value="Insurance">Assurance</option>
                                <option value="Registration">Enregistrement</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Coordonnées</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+261 34 ..."
                                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="contact@fournisseur.com"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="url"
                                    value={website}
                                    onChange={e => setWebsite(e.target.value)}
                                    placeholder="https://www.fournisseur.com"
                                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Adresse</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rue / Adresse</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Adresse exacte"
                                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">État / Province</label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={e => setState(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                <input
                                    type="text"
                                    value={zip}
                                    onChange={e => setZip(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            >
                                <option value="Madagascar">Madagascar</option>
                                <option value="France">France</option>
                                <option value="United States">États-Unis</option>
                                <option value="Canada">Canada</option>
                                <option value="United Kingdom">Royaume-Uni</option>
                                <option value="Australia">Australie</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Informations complémentaires</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Personne de contact</label>
                            <input
                                type="text"
                                value={contactName}
                                onChange={e => setContactName(e.target.value)}
                                placeholder="Nom du contact principal"
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Notes supplémentaires sur ce fournisseur..."
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Note : Ces informations seront sauvegardées en interne mais ne seront pas synchronisées avec le profil API du fournisseur pour le moment.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-12">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white"
                        disabled={saving || deleting}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || deleting}
                        className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirmer la suppression ?</h3>
                        <p className="text-sm text-gray-500 text-center mb-8">Cette action est irréversible. Toutes les données associées à ce fournisseur seront perdues.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">Annuler</button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {deleting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
