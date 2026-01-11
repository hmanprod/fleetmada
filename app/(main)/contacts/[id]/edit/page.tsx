"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Camera, Upload, X, Loader2 } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useContact, useUpdateContact } from '@/lib/hooks/useContacts';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';
import { useGroups } from '@/lib/hooks/useGroups';

export default function ContactEditPage({ params }: { params: { id: string } }) {
    const router = useNextRouter();
    const { contact, loading: fetching, error: fetchError } = useContact(params.id);
    const { updateContact, loading: saving, error: updateError } = useUpdateContact(params.id);
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

    // Other fields
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

    // Populate state when contact is loaded
    useEffect(() => {
        if (contact) {
            setFirstName(contact.firstName || '');
            setLastName(contact.lastName || '');
            setEmail(contact.email || '');
            setPhone(contact.phone || '');
            setGroupId(contact.groupId || (contact.group as any)?.id || '');
            setJobTitle(contact.jobTitle || '');
            setClassifications(contact.classifications || []);
            setImage(contact.image || null);
            setMiddleName(contact.middleName || '');
            setWorkPhone(contact.phoneWork || '');
            setOtherPhone(contact.phoneOther || '');
            setAddress(contact.address || '');
            setAddress2(contact.address2 || '');
            setCity(contact.city || '');
            setZipCode(contact.zip || '');
            setCountry(contact.country || '');
            setDob(contact.dateOfBirth ? new Date(contact.dateOfBirth).toISOString().split('T')[0] : '');
            setEmployeeNumber(contact.employeeNumber || '');
            setStartDate(contact.startDate ? new Date(contact.startDate).toISOString().split('T')[0] : '');
            setLeaveDate(contact.leaveDate ? new Date(contact.leaveDate).toISOString().split('T')[0] : '');
            setLicenseNumber(contact.licenseNumber || '');
            setHourlyRate(contact.hourlyRate?.toString() || '');
            setLicenseClasses(contact.licenseClass || []);
        }
    }, [contact]);

    const handleCancel = () => {
        router.push(`/contacts/${params.id}`);
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

        const success = await updateContact({
            firstName,
            lastName,
            email,
            phone,
            groupId: groupId || undefined,
            jobTitle,
            classifications,
            image: image || undefined,
            status: 'ACTIVE',
            middleName,
            phoneWork: workPhone,
            phoneOther: otherPhone,
            address,
            address2,
            city,
            zip: zipCode,
            country,
            dateOfBirth: dob || undefined,
            employeeNumber,
            startDate: startDate || undefined,
            leaveDate: leaveDate || undefined,
            licenseNumber,
            licenseClass: licenseClasses,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        });

        if (success) {
            router.push(`/contacts/${params.id}?updated=true`);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
            </div>
        );
    }

    if (fetchError || !contact) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{fetchError || 'Contact non trouvé'}</p>
                <button onClick={() => router.push('/contacts')} className="text-[#008751] hover:underline">Retour aux contacts</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Contact: {contact.firstName} {contact.lastName}</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
                    <button onClick={handleSave} disabled={saving || uploadingImage} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50" data-testid="save-contact-button">
                        {saving ? 'Enregistrement...' : 'Save Changes'}
                    </button>
                </div>
            </div>
            {updateError && (
                <div className="max-w-4xl mx-auto mt-4 px-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                        {updateError}
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Basic Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Details</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                    data-testid="first-name-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    type="text"
                                    value={middleName}
                                    onChange={e => setMiddleName(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
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
                            <p className="mt-1 text-xs text-gray-500">If this Contact is granted user access, email notifications will be sent here</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                            <select
                                value={groupId}
                                onChange={e => setGroupId(e.target.value)}
                                disabled={groupsLoading}
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751] disabled:bg-gray-100"
                            >
                                <option value="">Please select</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                {image ? (
                                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
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
                                            Pick File
                                        </button>
                                        <button
                                            onClick={() => cameraInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                            Take Photo
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
                                        {image ? 'Image chargée' : 'No file selected'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Classifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={classifications.includes('Operator')}
                                    onChange={() => handleClassificationChange('Operator')}
                                    className="mt-1 text-[#008751] focus:ring-[#008751] rounded"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">Operator</span>
                                    <span className="block text-xs text-gray-500">Allow this Contact to be assigned to assets</span>
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
                                    <span className="block text-sm font-medium text-gray-900">Employee</span>
                                    <span className="block text-xs text-gray-500">Current or former employee, for identification purposes only</span>
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
                                    <span className="block text-sm font-medium text-gray-900">Technician</span>
                                    <span className="block text-xs text-gray-500">Allow this Contact to be selected in labor line items on work orders</span>
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
                                    <span className="block text-sm font-medium text-gray-900">Manager</span>
                                    <span className="block text-xs text-gray-500">Allow this Contact to manage assets, users, and settings</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* User Access */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">User Access</h2>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <label className="flex-1 p-4 cursor-pointer hover:bg-gray-50 flex items-start gap-3 border-r border-gray-300">
                            <input type="radio" name="access" className="mt-1 text-[#008751] focus:ring-[#008751]" />
                            <div>
                                <span className="block text-sm font-bold text-gray-900">Enable Access to Fleetio</span>
                                <span className="block text-xs text-gray-500 mt-1">This Contact will be enabled as a User, and will be able to log in to your Fleetio account with the access level you choose below.</span>
                            </div>
                        </label>
                        <label className="flex-1 p-4 cursor-pointer bg-green-50 flex items-start gap-3">
                            <input type="radio" name="access" defaultChecked className="mt-1 text-[#008751] focus:ring-[#008751]" />
                            <div>
                                <span className="block text-sm font-bold text-green-800">No Access</span>
                                <span className="block text-xs text-green-700 mt-1">This Contact will not have access to your Fleetio account and will not receive any notifications.</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h2>
                    <div className="grid grid-cols-2 gap-4 space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone Number</label>
                            <input
                                type="text"
                                placeholder="404-555-0123"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 555-212-3212"
                                value={workPhone}
                                onChange={e => setWorkPhone(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Other Phone Number</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                data-testid="contact-address-input"
                            />
                            <p className="mt-1 text-xs text-gray-500">Street address, P.O. box, etc.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                            <input
                                type="text"
                                value={address2}
                                onChange={e => setAddress2(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                            <p className="mt-1 text-xs text-gray-500">Suite, unit, building, floor, etc.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                                <input
                                    type="text"
                                    value={zipCode}
                                    onChange={e => setZipCode(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
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
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Assistant to the Regional Manager"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                            <input
                                type="text"
                                value={employeeNumber}
                                onChange={e => setEmployeeNumber(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Date</label>
                                <input
                                    type="date"
                                    value={leaveDate}
                                    onChange={e => setLeaveDate(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                            <input
                                type="text"
                                value={licenseNumber}
                                onChange={e => setLicenseNumber(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">License Class</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Labor Rate</label>
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
                    <button onClick={handleSave} disabled={saving || uploadingImage} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm" data-testid="save-contact-button">
                        {saving ? 'Enregistrement...' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
}
