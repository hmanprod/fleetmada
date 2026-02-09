'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, User, History, Car, AlertTriangle, ClipboardCheck, Clock, Plus, X, MessageSquare, Wrench, Search, Archive, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { useContact } from '@/lib/hooks/useContacts';
import { useIssues } from '@/lib/hooks/useIssues';
import { useInspections } from '@/lib/hooks/useInspections';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';
import { useServiceWorkOrders } from '@/lib/hooks/useServiceWorkOrders';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { vehiclesAPI } from '@/lib/services/vehicles-api';
import { Contact } from '@/lib/services/contacts-api';
import { useUpdateContact, useDeleteContact } from '@/lib/hooks/useContacts';
import { useEffect, useRef } from 'react';
import { EntitySidebar } from '@/components/EntitySidebar';
import { useContactPhotos } from '@/lib/hooks/useContactPhotos';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useUploadDocuments } from '@/lib/hooks/useUploadDocuments';

// Helper component for detail rows
const DetailRow = ({ label, value, icon, isLink }: { label: string, value?: string | number | null, icon?: React.ReactNode, isLink?: boolean }) => (
    <div className="grid grid-cols-3 border-b border-gray-100 py-3.5 px-6 last:border-0 hover:bg-gray-50/50 transition-colors">
        <span className="text-gray-500 text-sm font-medium">{label}</span>
        <div className="col-span-2 flex items-center justify-between gap-2">
            <span className={`text-sm ${isLink && value ? 'text-[#008751] hover:underline cursor-pointer' : 'text-gray-900'}`}>
                {value || '—'}
            </span>
            {icon && <div className="text-[#008751]">{icon}</div>}
        </div>
    </div>
);

const CLASSIFICATION_LABELS: Record<string, string> = {
    Operator: 'Opérateur',
    Employee: 'Employé',
    Technician: 'Technicien',
    Manager: 'Gestionnaire',
    Driver: 'Chauffeur',
};

const formatClassifications = (values?: string[]) => {
    if (!values || values.length === 0) return '—';
    return values.map(v => CLASSIFICATION_LABELS[v] ?? v).join(', ');
};

export default function ContactDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast, toasts, removeToast } = useToast();
    const { contact, loading: contactLoading, error: contactError, refetch: refetchContact } = useContact(params.id);
    const [activeTab, setActiveTab] = useState('Overview');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    const { updateContact } = useUpdateContact(params.id);
    const { deleteContact } = useDeleteContact();

    // Sidebar State
    const [activeSidebarPanel, setActiveSidebarPanel] = useState<'comments' | 'photos' | 'documents' | null>('comments');

    // Contact Photos Hook (Mock for now)
    const {
        photos: contactPhotos,
        loading: photosLoading,
        error: photosError,
        addPhoto: addPhotoHandler,
        deletePhoto: deletePhotoHandler,
    } = useContactPhotos(params.id);

    // Documents Hook
    const {
        documents: contactDocuments,
        loading: documentsLoading,
        error: documentsError,
        refreshDocuments,
    } = useDocuments({
        attachedTo: 'contact',
        attachedId: params.id,
        limit: 50
    });

    const { uploadSingleDocument } = useUploadDocuments();

    const handleAddDocumentWrapper = async (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            await uploadSingleDocument(files[i], {
                attachedTo: 'contact',
                attachedId: params.id,
                fileName: files[i].name,
                mimeType: files[i].type
            });
        }
        refreshDocuments();
    };

    // Memoized hook options to prevent infinite loops
    const issuesOptions = useMemo(() => ({
        assignedTo: contact?.associatedUserId || 'non-existent',
        limit: 50
    }), [contact?.associatedUserId]);

    const inspectionsOptions = useMemo(() => ({
        userId: contact?.associatedUserId || 'non-existent',
        limit: 50
    }), [contact?.associatedUserId]);

    const serviceRemindersOptions = useMemo(() => ({
        contactId: params.id,
        limit: 50
    }), [params.id]);

    const vehiclesOptions = useMemo(() => ({
        query: { limit: 100 } as any
    }), []);

    const workOrdersOptions = useMemo(() => ({
        // Search by full name as used in assignment logic, or fallback to userId
        assignedTo: contact ? `${contact.firstName} ${contact.lastName}` : undefined,
        limit: 50
    }), [contact?.firstName, contact?.lastName]);

    // Issues Hook
    const {
        issues,
        loading: issuesLoading
    } = useIssues(issuesOptions);

    // Inspections Hook
    const {
        inspections,
        loading: inspectionsLoading
    } = useInspections(inspectionsOptions);

    const {
        reminders,
        loading: remindersLoading
    } = useServiceReminders(serviceRemindersOptions);

    const {
        workOrders,
        loading: workOrdersLoading
    } = useServiceWorkOrders(workOrdersOptions);

    // Vehicles Hook for the modal
    const { vehicles } = useVehicles(vehiclesOptions);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(false);

    const filteredVehicles = useMemo(() => {
        if (!vehicleSearch) return vehicles;
        return vehicles.filter(v =>
            v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
            (v.licensePlate && v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase()))
        );
    }, [vehicles, vehicleSearch]);

    const selectedVehicle = useMemo(() =>
        vehicles.find(v => v.id === selectedVehicleId),
        [vehicles, selectedVehicleId]);

    // Modal Form State aligned with assignments page
    const [assignmentForm, setAssignmentForm] = useState({
        startDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '17:00',
        comments: ''
    });

    // Data fetching is now handled declaratively by the hooks themselves
    // based on the memoized option objects.

    useEffect(() => {
        if (searchParams.get('updated') === 'true') {
            toast.success('Contact mis à jour', 'Les informations du contact ont été enregistrées avec succès.');
        }
    }, [searchParams]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleBack = () => {
        router.push('/contacts');
    };

    const handleEdit = () => {
        router.push(`/contacts/${params.id}/edit`);
    };

    const handleArchive = async () => {
        const isArchived = contact?.status === 'ARCHIVED';
        const action = isArchived ? 'restaurer' : 'archiver';
        if (!window.confirm(`Etes-vous sûr de vouloir ${action} ce contact ?`)) return;

        const success = await updateContact({ status: isArchived ? 'ACTIVE' : 'ARCHIVED' });
        if (success) {
            setIsMoreMenuOpen(false);
            toast.success(
                isArchived ? 'Contact restauré' : 'Contact archivé',
                isArchived ? 'Le contact a été restauré avec succès.' : 'Le contact a été déplacé vers les archives.'
            );
            refetchContact();
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Etes-vous sûr de vouloir supprimer définitivement ce contact ? Cette action est irréversible.')) return;
        const success = await deleteContact(params.id);
        if (success) {
            router.push('/contacts?deleted=true');
        }
    };

    const handleSaveAssignment = async () => {
        if (!selectedVehicleId || !contact) return;

        try {
            setAssignmentLoading(true);

            // combine date and time into ISO strings to match VehicleAssignmentsPage
            const startDateTime = `${assignmentForm.startDate}T${assignmentForm.startTime}:00Z`;
            const endDateTime = assignmentForm.endDate ? `${assignmentForm.endDate}T${assignmentForm.endTime}:00Z` : null;

            await vehiclesAPI.createVehicleAssignment(selectedVehicleId, {
                operator: `${contact.firstName} ${contact.lastName}`,
                contactId: contact.id,
                startDate: startDateTime,
                endDate: endDateTime,
                comments: assignmentForm.comments,
                status: 'ACTIVE'
            } as any);
            setShowAssignModal(false);
            // Refresh to show new assignment
            window.location.reload();
        } catch (err) {
            console.error('Error saving assignment:', err);
            alert('Failed to save assignment');
        } finally {
            setAssignmentLoading(false);
        }
    };

    if (contactLoading) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751]"></div>
                </div>
            </div>
        );
    }

    if (contactError || !contact) {
        return (
            <div className="p-6 max-w-[1800px] mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Erreur:</strong> {contactError || 'Contact non trouvé'}
                    </div>
                    <button
                        onClick={() => router.push('/contacts')}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retour aux contacts
                    </button>
                </div>
            </div>
        );
    }

    const AssignVehicleModal = () => {
        if (!contact) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Ajouter une affectation de véhicule pour {contact.firstName} {contact.lastName}</h3>
                        <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Véhicule affecté <span className="text-red-500">*</span></label>

                            <div className="relative">
                                <div
                                    className={`w-full p-2.5 border rounded-md bg-white cursor-pointer flex items-center justify-between transition-all ${isVehicleDropdownOpen ? 'ring-2 ring-[#008751] border-[#008751]' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Car size={18} className="text-gray-400" />
                                        {selectedVehicle ? (
                                            <div>
                                                <span className="font-medium text-gray-900">{selectedVehicle.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">{selectedVehicle.licensePlate}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Sélectionnez un véhicule...</span>
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
                                                    placeholder="Rechercher un véhicule (nom ou plaque)..."
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
                                                        className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors ${selectedVehicleId === v.id ? 'bg-green-50' : ''}`}
                                                        onClick={() => {
                                                            setSelectedVehicleId(v.id);
                                                            setIsVehicleDropdownOpen(false);
                                                            setVehicleSearch('');
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#008751]">{v.name}</div>
                                                            <div className="text-xs text-gray-500">{v.licensePlate || 'Sans plaque'} • {v.type || 'Standard'}</div>
                                                        </div>
                                                        {selectedVehicleId === v.id && <div className="w-2 h-2 rounded-full bg-[#008751]"></div>}
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
                            <label className="block text-sm font-bold text-gray-700 mb-1">Operator <span className="text-red-500">*</span></label>
                            <input type="text" value={`${contact.firstName} ${contact.lastName}`} disabled className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Début (date/heure)</label>
                                <div className="flex gap-2">
                                    <input type="date" className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                                        value={assignmentForm.startDate}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })} />
                                    <input type="time" className="w-24 p-2 border border-gray-300 rounded-md text-sm"
                                        value={assignmentForm.startTime}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startTime: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fin (date/heure)</label>
                                <div className="flex gap-2">
                                    <input type="date" className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                                        value={assignmentForm.endDate}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })} />
                                    <input type="time" className="w-24 p-2 border border-gray-300 rounded-md text-sm"
                                        value={assignmentForm.endTime}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endTime: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <textarea
                                placeholder="Ajouter un commentaire (optionnel)"
                                className="w-full p-2.5 border border-gray-300 rounded-md h-24 text-sm"
                                value={assignmentForm.comments}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, comments: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                        <button onClick={() => setShowAssignModal(false)} className="text-[#008751] font-medium hover:underline">Annuler</button>
                        <button
                            onClick={handleSaveAssignment}
                            disabled={!selectedVehicleId || assignmentLoading}
                            className={`px-4 py-2 rounded-md text-white font-bold shadow-sm transition-colors ${!selectedVehicleId || assignmentLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#008751] hover:bg-[#007043]'}`}
                        >
                            {assignmentLoading ? 'Enregistrement...' : 'Enregistrer l’affectation'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        if (!contact) return null;
        switch (activeTab) {
            case 'Overview':
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3">
                            <div className="text-blue-500 mt-0.5"><User size={16} /></div>
                            <div className="text-sm text-blue-900">Ce contact n’a pas d’accès utilisateur.</div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">Détails</h2>
                            </div>
                            <div className="p-0">
                                <div className="divide-y divide-gray-100">
                                    <DetailRow label="Prénom" value={contact!.firstName} />
                                    <DetailRow label="Deuxième prénom" value={contact!.middleName} />
                                    <DetailRow label="Nom" value={contact!.lastName} />
                                    <DetailRow label="Email" value={contact!.email} isLink />
                                    <DetailRow
                                        label="Groupe"
                                        value={(contact!.group as any)?.name || contact!.group}
                                        icon={contact!.group ? <History size={16} /> : null}
                                    />

                                    <DetailRow label="Opérateur" value={contact!.classifications?.includes('Operator') ? 'Oui' : 'Non'} />
                                    <DetailRow label="Employé" value={contact!.classifications?.includes('Employee') ? 'Oui' : 'Non'} />
                                    <DetailRow label="Technicien" value={contact!.classifications?.includes('Technician') ? 'Oui' : 'Non'} />

                                    <DetailRow label="Téléphone" value={contact!.phone} />
                                    <DetailRow label="Adresse" value={contact!.address} />
                                    <DetailRow label="Poste" value={contact!.jobTitle} />
                                    <DetailRow label="Date de naissance" value={contact!.dateOfBirth ? new Date(contact!.dateOfBirth).toLocaleDateString() : undefined} />
                                    <DetailRow label="Matricule" value={contact!.employeeNumber} />
                                    <DetailRow label="Date d’entrée" value={contact!.startDate ? new Date(contact!.startDate).toLocaleDateString() : undefined} />
                                    <DetailRow label="Date de sortie" value={contact!.leaveDate ? new Date(contact!.leaveDate).toLocaleDateString() : undefined} />

                                    <DetailRow label="Numéro de permis" value={contact!.licenseNumber} />
                                    <DetailRow label="Catégorie de permis" value={contact!.licenseClass?.join(', ')} />
                                    <DetailRow label="Région de délivrance du permis" value={undefined} />
                                    <DetailRow label="Taux horaire" value={contact!.hourlyRate ? `${contact!.hourlyRate.toFixed(2)}` : undefined} />
                                </div>
                            </div>
                        </div>

                        {/* Current Vehicle Assignments */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Affectations de véhicules actives</h2>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="text-[#008751] text-xs font-bold hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Ajouter une affectation
                                </button>
                            </div>
                            {contact!.assignments && contact!.assignments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-gray-500">Véhicule</th>
                                                <th className="px-4 py-2 text-left text-gray-500">Début</th>
                                                <th className="px-4 py-2 text-left text-gray-500">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {contact!.assignments.filter((a: any) => a.status === 'ACTIVE').map((a: any) => (
                                                <tr key={a.id}>
                                                    <td className="px-4 py-2 text-[#008751] font-medium">{a.vehicle?.name}</td>
                                                    <td className="px-4 py-2">{new Date(a.startDate).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                    <Car size={48} className="text-gray-300 mb-2 stroke-1" />
                                    <p className="text-sm text-gray-500">Aucune affectation de véhicule active</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'Vehicle Assignments':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Historique des affectations</h2>
                            <button onClick={() => setShowAssignModal(true)} className="px-3 py-1.5 bg-[#008751] text-white rounded text-sm font-medium hover:bg-[#007043] flex items-center gap-2">
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        {contact.assignments && contact.assignments.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Véhicule</th>
                                        <th className="px-6 py-3 text-left">Début</th>
                                        <th className="px-6 py-3 text-left">Fin</th>
                                        <th className="px-6 py-3 text-left">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {contact.assignments.map((a: any) => (
                                        <tr key={a.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-[#008751] font-medium">{a.vehicle?.name}</td>
                                            <td className="px-6 py-4">{new Date(a.startDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{a.endDate ? new Date(a.endDate).toLocaleDateString() : '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Car size={48} className="mx-auto mb-4 text-gray-200 stroke-1" />
                                <p>Ce contact n’a aucun historique d’affectations.</p>
                            </div>
                        )}
                    </div>
                );
            case 'Issues':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Problèmes associés</h2>
                        </div>
                        {issuesLoading ? (
                            <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div></div>
                        ) : issues && issues.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-gray-500">Problème</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Véhicule</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Priorité</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {issues.map((issue: any) => (
                                            <tr key={issue.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/issues/${issue.id}`)}>
                                                <td className="px-4 py-2 font-medium text-gray-900">{issue.summary}</td>
                                                <td className="px-4 py-2">{issue.vehicle?.name || '—'}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                        issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {issue.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issue.status === 'RESOLVED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {issue.status === 'RESOLVED' ? 'Résolu' : 'Ouvert'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <AlertTriangle size={48} className="mx-auto mb-4 text-gray-200 stroke-1" />
                                <p>Aucun problème trouvé pour ce contact.</p>
                            </div>
                        )}
                    </div>
                );
            case 'Service Reminders':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Rappels de service</h2>
                        </div>
                        {remindersLoading ? (
                            <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div></div>
                        ) : reminders && reminders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-gray-500">Tâche de service</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Véhicule</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Prochaine échéance</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reminders.map((reminder: any) => (
                                            <tr key={reminder.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-gray-900">{reminder.task || reminder.serviceTask?.name || reminder.title}</td>
                                                <td className="px-4 py-2 text-[#008751] font-medium">{reminder.vehicle?.name}</td>
                                                <td className="px-4 py-2">
                                                    {reminder.nextDue ? new Date(reminder.nextDue).toLocaleDateString() : '—'}
                                                    {reminder.isOverdue && <span className="ml-2 text-red-600 font-bold">EN RETARD</span>}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reminder.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {reminder.status === 'COMPLETED' ? 'Terminé' : 'Ouvert'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Wrench size={48} className="mx-auto mb-4 text-gray-200 stroke-1" />
                                <p>Aucun rappel de service trouvé pour ce contact.</p>
                            </div>
                        )}
                    </div>
                );
            case 'Inspections':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Historique des inspections</h2>
                        </div>
                        {inspectionsLoading ? (
                            <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div></div>
                        ) : inspections && inspections.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-gray-500">Form</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Véhicule</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Date</th>
                                            <th className="px-4 py-2 text-left text-gray-500">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {inspections.map((inspection: any) => (
                                            <tr key={inspection.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/inspections/${inspection.id}`)}>
                                                <td className="px-4 py-2 font-medium text-gray-900">{inspection.template?.name || 'Inspection standard'}</td>
                                                <td className="px-4 py-2">{inspection.vehicle?.name}</td>
                                                <td className="px-4 py-2 text-gray-500">{new Date(inspection.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inspection.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {inspection.status === 'COMPLETED' ? 'Terminé' : 'Ouvert'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-200 stroke-1" />
                                <p>Aucun historique d’inspection pour ce contact.</p>
                            </div>
                        )}
                    </div>
                );
            case 'Work Orders':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Historique des ordres de travail</h2>
                        </div>
                        {workOrdersLoading ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
                            </div>
                        ) : workOrders && workOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Numéro</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Véhicule</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Coût total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {workOrders.map((wo) => (
                                            <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/service/work-orders/${wo.id}`)}>
                                                <td className="px-4 py-3 font-medium text-[#008751]">#{wo.id.slice(-6)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{wo.vehicle?.name || '—'}</div>
                                                    {wo.vehicle?.licensePlate && <div className="text-xs text-gray-500">{wo.vehicle.licensePlate}</div>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                                                        ${wo.status === 'COMPLETED' || wo.status === 'CANCELLED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                                                    `}>
                                                        {(wo.status === 'COMPLETED' || wo.status === 'CANCELLED') && <CheckCircle size={12} />}
                                                        {(wo.status === 'IN_PROGRESS' || wo.status === 'SCHEDULED') && <Clock size={12} />}
                                                        {wo.status === 'COMPLETED' || wo.status === 'CANCELLED' ? 'Terminé' : 'Ouvert'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {wo.date ? new Date(wo.date).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                    {wo.totalCost ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', minimumFractionDigits: 0 }).format(wo.totalCost) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Wrench size={48} className="mx-auto mb-4 text-gray-200 stroke-1" />
                                <p>Aucun ordre de travail trouvé pour ce contact.</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {showAssignModal && <AssignVehicleModal />}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <button onClick={handleBack} className="hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={16} /> Contacts</button>
                </div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-white shadow-sm overflow-hidden">
                            {contact!.image ? (
                                <img src={contact!.image} alt="Photo de profil" className="w-full h-full object-cover" />
                            ) : (
                                `${contact!.firstName[0]}${contact!.lastName[0]}`
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{contact!.firstName} {contact!.lastName}</h1>
                                {contact?.status === 'ARCHIVED' && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded uppercase tracking-wider">Archivé</span>
                                )}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div>
                                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Groupe</span>
                                    <span className="font-medium text-gray-900">{(contact.group as any)?.name || contact.group || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Email</span>
                                    <span className="font-medium text-[#008751]">{contact!.email}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Profils</span>
                                    <span className="font-medium text-gray-900">{formatClassifications(contact!.classifications)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 relative">
                        <div ref={moreMenuRef}>
                            <button
                                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                className={`px-3 py-1.5 border rounded text-sm font-medium transition-colors ${isMoreMenuOpen ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {isMoreMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={handleArchive}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Archive size={14} className="text-gray-400" />
                                        {contact?.status === 'ARCHIVED' ? 'Restaurer le contact' : 'Archiver le contact'}
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                    >
                                        <Trash2 size={14} />
                                        Supprimer le contact
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={handleEdit} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Edit2 size={16} /> Modifier
                        </button>
                        <button onClick={() => setShowAssignModal(true)} className="px-3 py-1.5 bg-[#008751] text-white rounded text-sm font-medium hover:bg-[#007043] flex items-center gap-2 shadow-sm">
                            <Plus size={16} /> Affecter un véhicule
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b border-gray-200 px-8">
                <div className="flex gap-6 overflow-x-auto">
                    {[
                        { id: 'Overview', label: "Vue d'ensemble", count: null, icon: <User size={16} /> },
                        { id: 'Vehicle Assignments', label: 'Affectations', count: contact?.assignments?.length || 0, icon: <Car size={16} /> },
                        { id: 'Issues', label: 'Problèmes', count: issues?.length || 0, icon: <AlertTriangle size={16} /> },
                        { id: 'Service Reminders', label: 'Rappels', count: reminders?.length || 0, icon: <Clock size={16} /> },
                        { id: 'Inspections', label: 'Inspections', count: inspections?.length || 0, icon: <ClipboardCheck size={16} /> },
                        { id: 'Work Orders', label: 'Ordres de travail', count: workOrders?.length || 0, icon: <Wrench size={16} /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.count !== null && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-[#008751] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-6 flex gap-6 items-start">
                <div className="flex-1 overflow-hidden">
                    {renderTabContent()}
                </div>
                <div className="shrink-0">
                    <EntitySidebar
                        entityType="contact"
                        entityId={contact!.id}
                        activePanel={activeSidebarPanel}
                        onPanelChange={setActiveSidebarPanel}

                        // Fake Comments
                        comments={[]}
                        commentsLoading={false}
                        onAddComment={async () => console.log('Add comment not impl')}
                        onUpdateComment={async () => { }}
                        onDeleteComment={async () => { }}
                        onRefreshComments={() => { }}

                        // Fake Photos for now
                        photos={contactPhotos}
                        photosLoading={photosLoading}
                        photosError={photosError}
                        onAddPhoto={addPhotoHandler}
                        onDeletePhoto={deletePhotoHandler}
                        onRefreshPhotos={() => { }}

                        // Real Documents
                        documents={contactDocuments}
                        documentsLoading={documentsLoading}
                        documentsError={documentsError}
                        onAddDocument={handleAddDocumentWrapper}
                        onDeleteDocument={async () => { }}
                        onDownloadDocument={async () => { }}
                        onRefreshDocuments={refreshDocuments}
                    />
                </div>
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
