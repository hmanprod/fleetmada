"use client";

import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Camera, Upload, X, Loader2 } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useCreateContact } from '@/lib/hooks/useContacts';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { useGroups } from '@/lib/hooks/useGroups';

export default function ContactCreatePage() {
    const router = useNextRouter();
    const { createContact, loading: saving, error: createError } = useCreateContact();
    const { uploadSingleDocument, uploading: uploadingImage } = useUploadDocuments();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [groupId, setGroupId] = useState('');
    const { groups, loading: groupsLoading } = useGroups();
    const [jobTitle, setJobTitle] = useState('');
    const [classifications, setClassifications] = useState<string[]>([]);
    const [image, setImage] = useState<string | null>(null);
    const [licenseClasses, setLicenseClasses] = useState<string[]>([]);

    // Other fields that are in the form but not necessarily in the basic API yet
    const [middleName, setMiddleName] = useState('');
    const [workPhone, setWorkPhone] = useState('');
    const [otherPhone, setOtherPhone] = useState('');
    const [address, setAddress] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('');
    const [dob, setDob] = useState('');
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [startDate, setStartDate] = useState('');
    const [leaveDate, setLeaveDate] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleCancel = () => {
        router.push('/contacts');
    };

    const handleClassificationChange = (classification: string) => {
        if (classifications.includes(classification)) {
            setClassifications(classifications.filter(c => c !== classification));
        } else {
            setClassifications([...classifications, classification]);
        }
    };

    const handleLicenseClassChange = (cls: string) => {
        if (licenseClasses.includes(cls)) {
            setLicenseClasses(licenseClasses.filter(c => c !== cls));
        } else {
            setLicenseClasses([...licenseClasses, cls]);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await uploadSingleDocument(file, {
                attachedTo: 'contact',
                isPublic: true
            });

            if (result.success && result.document) {
                setImage(result.document.filePath);
            } else {
                alert(result.error || 'Erreur lors de l\'upload de l\'image');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Erreur lors de l\'upload de l\'image');
        }
    };

    const handleSave = async () => {
        if (!firstName) {
            alert('Le prénom est obligatoire');
            return;
        }

        const success = await createContact({
            firstName,
            lastName,
            email,
            phone,
            groupId: groupId || undefined,
            jobTitle,
            classifications,
            image: image || undefined,
            status: 'ACTIVE'
        });

        if (success) {
            router.push('/contacts?created=true');
        }
    };

    const handleSaveAndAddAnother = async () => {
        if (!firstName) {
            alert('Le prénom est obligatoire');
            return;
        }

        const success = await createContact({
            firstName,
            lastName,
            email,
            phone,
            groupId: groupId || undefined,
            jobTitle,
            classifications,
            image: image || undefined,
            status: 'ACTIVE'
        });

        if (success) {
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setGroupId('');
            setJobTitle('');
            setClassifications([]);
            setImage(null);
            setLicenseClasses([]);
            alert('Contact ajouté avec succès');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Contacts
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Nouveau contact</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>
                    {/* <button onClick={handleSaveAndAddAnother} disabled={saving} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Add Multiple Contacts</button> */}
                    <button onClick={handleSave} disabled={saving || uploadingImage} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50" data-testid="save-contact-button">
                        {saving ? 'Enregistrement…' : 'Enregistrer le contact'}
                    </button>
                </div>
            </div>
            {createError && (
                <div className="max-w-4xl mx-auto mt-4 px-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                        {createError}
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Basic Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Informations de base</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    data-testid="first-name-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deuxième prénom</label>
                                <input
                                    type="text"
                                    value={middleName}
                                    onChange={e => setMiddleName(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                data-testid="last-name-input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                            <p className="mt-1 text-xs text-gray-500">Si ce contact a un accès utilisateur, les notifications email seront envoyées ici.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
                            <select
                                value={groupId}
                                onChange={e => setGroupId(e.target.value)}
                                disabled={groupsLoading}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751] disabled:bg-gray-100"
                            >
                                <option value="">Veuillez sélectionner</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                            <div className="flex items-center gap-4">
                                {image ? (
                                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
	                                        <img src={image} alt="Photo de profil" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setImage(null)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400">
                                        <User size={32} />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="flex items-center gap-2 bg-[#008751] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-[#007043] transition-colors disabled:opacity-50"
                                        >
                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                            Choisir un fichier
                                        </button>
                                        <button
                                            onClick={() => cameraInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                            Prendre une photo
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <input
                                        type="file"
                                        ref={cameraInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                        capture="environment"
                                    />
                                    <p className="text-xs text-gray-500 italic">
                                        {image ? 'Image chargée' : 'Aucun fichier sélectionné'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Profils</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={classifications.includes('Operator')}
                                    onChange={() => handleClassificationChange('Operator')}
                                    className="mt-1 text-[#008751] focus:ring-[#008751] rounded"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">Opérateur</span>
                                    <span className="block text-xs text-gray-500">Permet d’assigner ce contact à des véhicules / équipements.</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={classifications.includes('Employee')}
                                    onChange={() => handleClassificationChange('Employee')}
                                    className="mt-1 text-[#008751] focus:ring-[#008751] rounded"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">Employé</span>
                                    <span className="block text-xs text-gray-500">Employé actuel ou ancien (à des fins d’identification).</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={classifications.includes('Technician')}
                                    onChange={() => handleClassificationChange('Technician')}
                                    className="mt-1 text-[#008751] focus:ring-[#008751] rounded"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">Technicien</span>
                                    <span className="block text-xs text-gray-500">Permet de sélectionner ce contact sur les lignes de main‑d’œuvre des ordres de travail.</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={classifications.includes('Manager')}
                                    onChange={() => handleClassificationChange('Manager')}
                                    className="mt-1 text-[#008751] focus:ring-[#008751] rounded"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">Gestionnaire</span>
                                    <span className="block text-xs text-gray-500">Permet de gérer les véhicules, les utilisateurs et les paramètres.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* User Access */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Accès utilisateur</h2>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <label className="flex-1 p-4 cursor-pointer hover:bg-gray-50 flex items-start gap-3 border-r border-gray-300">
                            <input type="radio" name="access" className="mt-1 text-[#008751] focus:ring-[#008751]" />
                            <div>
                                <span className="block text-sm font-bold text-gray-900">Activer l’accès à FleetMada</span>
                                <span className="block text-xs text-gray-500 mt-1">Ce contact pourra se connecter à votre compte FleetMada selon le niveau d’accès choisi.</span>
                            </div>
                        </label>
                        <label className="flex-1 p-4 cursor-pointer bg-green-50 flex items-start gap-3">
                            <input type="radio" name="access" defaultChecked className="mt-1 text-[#008751] focus:ring-[#008751]" />
                            <div>
                                <span className="block text-sm font-bold text-green-800">Aucun accès</span>
                                <span className="block text-xs text-green-700 mt-1">Ce contact n’aura pas accès au compte et ne recevra pas de notifications.</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Coordonnées</h2>
                    <div className="grid grid-cols-2 gap-4 space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone mobile</label>
                            <input
                                type="text"
                                placeholder="404-555-0123"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone professionnel</label>
                            <input
                                type="text"
                                placeholder="e.g. 555-212-3212"
                                value={workPhone}
                                onChange={e => setWorkPhone(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Autre téléphone</label>
                            <input
                                type="text"
                                placeholder="e.g. 555-212-3212"
                                value={otherPhone}
                                onChange={e => setOtherPhone(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                            <input
                                type="text"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                data-testid="contact-address-input"
                            />
                            <p className="mt-1 text-xs text-gray-500">Adresse, boîte postale, etc.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Complément d’adresse</label>
                            <input
                                type="text"
                                value={address2}
                                onChange={e => setAddress2(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                            <p className="mt-1 text-xs text-gray-500">Bâtiment, étage, suite, etc.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                <input
                                    type="text"
                                    value={zipCode}
                                    onChange={e => setZipCode(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={e => setCountry(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Informations personnelles</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                            <input
                                type="text"
                                placeholder="Ex : Assistant du responsable régional"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                            <input
                                type="text"
                                value={employeeNumber}
                                onChange={e => setEmployeeNumber(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date d’entrée</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de sortie</label>
                                <input
                                    type="date"
                                    value={leaveDate}
                                    onChange={e => setLeaveDate(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de permis</label>
                            <input
                                type="text"
                                value={licenseNumber}
                                onChange={e => setLicenseNumber(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie de permis</label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {['A', 'B', 'C', 'D', 'E'].map((cls) => (
                                    <label key={cls} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={licenseClasses.includes(cls)}
                                            onChange={() => handleLicenseClassChange(cls)}
                                            className="w-4 h-4 text-[#008751] border-gray-300 rounded focus:ring-[#008751]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{cls}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Taux horaire</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">Ar</span>
                                <input
                                    type="number"
                                    value={hourlyRate}
                                    onChange={e => setHourlyRate(e.target.value)}
                                    className="w-full pl-8 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-12">
                    <button onClick={handleSaveAndAddAnother} disabled={saving || uploadingImage} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Enregistrer et ajouter un autre</button>
                    <button onClick={handleSave} disabled={saving || uploadingImage} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm" data-testid="save-contact-button">
                        {saving ? 'Enregistrement…' : 'Enregistrer le contact'}
                    </button>
                </div>

            </div>
        </div>
    );
}
