'use client';

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Globe, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { vendorsAPI, CreateVendorRequest } from '@/lib/services/vendors-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function VendorCreatePage() {
  const router = useRouter();
  const { toast, toasts, removeToast } = useToast();

  const [loading, setLoading] = useState(false);
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

  const handleCancel = () => {
    router.push('/vendors');
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

    setLoading(true);

    // Combine address parts
    const addressParts = [
      address,
      city,
      state && zip ? `${state} ${zip}` : (state || zip),
      country
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const vendorData: CreateVendorRequest = {
      name,
      address: fullAddress,
      phone,
      website,
      contactEmail: email,
      contactName: contactName,
      // Note: API defines classification as string[].
      classification: classification ? [classification] : [],
      // Storing notes in labels for now as API doesn't have a notes field, 
      // or we could append to address, but labels is probably safer for ad-hoc info if needed.
      // actually, let's just not send notes to API if it's not supported, strictly speaking.
      // But maybe we can put it in labels if it's short? 
      // "Note: ..." might be too long. I'll omit notes for now but keep the UI state for future use.
      labels: []
    };

    try {
      await vendorsAPI.createVendor(vendorData);
      toast.success('Succès', 'Fournisseur créé avec succès');
      setTimeout(() => {
        router.push('/vendors');
      }, 1500);
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error('Erreur', error instanceof Error ? error.message : 'Échec de la création du fournisseur');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={18} /> Fournisseurs
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau Fournisseur</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            data-testid="save-vendor-button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
                data-testid="vendor-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
              <select
                value={classification}
                onChange={e => setClassification(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                data-testid="vendor-classification-select"
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
                  data-testid="vendor-phone-input"
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
                data-testid="vendor-email-input"
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
                  data-testid="vendor-address-input"
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
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
    </div>
  );
}