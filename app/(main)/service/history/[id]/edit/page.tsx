'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft, Upload, Plus, Search, Calendar, Clock, AlertCircle, FileText, Camera, ChevronDown, ChevronRight, Info, MoreHorizontal, AlertTriangle, Settings2, SlidersHorizontal, ListFilter, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useIssues } from '@/lib/hooks/useIssues';
import { useVendors } from '@/lib/hooks/useVendors';
import { useServiceTasks } from '@/lib/hooks/useServiceTasks';
import { VehicleSelect } from '../../../../vehicles/components/VehicleSelect';
import { serviceAPI } from '@/lib/services/service-api';
import { authAPI } from '@/lib/auth-api';
import { useToast, ToastContainer } from '@/components/NotificationToast'; // Adjusted path based on grep results
// import type { Vehicle } from '../../../../vehicles/types'; // If needed
import { ServiceTaskSelect } from '../../../components/ServiceTaskSelect';
import { VendorSelect } from '@/app/(main)/vendors/components/VendorSelect';

export default function ServiceEntryEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // 1. Initial State
    const [formData, setFormData] = useState({
        vehicleId: '',
        repairPriority: '',
        odometer: '',
        isVoid: false,
        completionDate: new Date().toISOString().split('T')[0],
        completionTime: new Date().toTimeString().slice(0, 5),
        setStartDate: false,
        startDate: '',
        startTime: '',
        reference: '',
        vendorId: '',
        labels: [] as string[],
        generalNotes: '',
        comment: '',
        discountType: '%' as '%' | '€',
        discountValue: 0,
        taxType: '%' as '%' | '€',
        taxValue: 0,
    });

    const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [activeIssueTab, setActiveIssueTab] = useState<'open' | 'resolved' | 'closed'>('open');
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [docList, setDocList] = useState<{ id: string; name: string; type: 'photo' | 'document'; url?: string }[]>([]);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const { toast, toasts, removeToast } = useToast();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId && !(event.target as Element).closest('.line-item-menu')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    // Load existing data
    useEffect(() => {
        const fetchServiceEntry = async () => {
            try {
                setIsLoading(true);
                const response = await serviceAPI.getServiceEntry(params.id);

                if (response.success && response.data) {
                    const entry = response.data;

                    // Parse date and time
                    const dateObj = new Date(entry.date);
                    const completionDate = dateObj.toISOString().split('T')[0];
                    const completionTime = dateObj.toTimeString().slice(0, 5);

                    setFormData({
                        vehicleId: entry.vehicleId,
                        repairPriority: entry.priority || 'non-scheduled', // Default if missing
                        odometer: entry.meter ? entry.meter.toString() : '',
                        isVoid: false, // Not in interface?
                        completionDate,
                        completionTime,
                        setStartDate: false,
                        startDate: '',
                        startTime: '',
                        reference: '', // Not in interface?
                        vendorId: (typeof entry.vendor === 'object' ? entry.vendor?.id : entry.vendor) || '',
                        labels: [],
                        generalNotes: entry.notes || '',
                        comment: '',
                        discountType: '%',
                        discountValue: 0,
                        taxType: '%',
                        taxValue: 0,
                    });

                    // Map tasks to lineItems
                    if (entry.tasks && Array.isArray(entry.tasks)) {
                        const items = entry.tasks.map((t: any) => ({
                            id: Math.random().toString(36).substr(2, 9),
                            taskId: t.serviceTask.id,
                            name: t.serviceTask.name,
                            labor: 0,
                            parts: t.cost || 0, // Assuming cost is total, putting in parts for now
                            subtotal: t.cost || 0,
                            notes: t.notes || ''
                        }));
                        setLineItems(items);
                    }

                    // Load documents
                    if ((entry as any).documents && Array.isArray((entry as any).documents)) {
                        const docs = (entry as any).documents.map((d: any) => ({
                            id: d.id,
                            name: d.fileName,
                            type: d.labels && d.labels.includes('photo') ? 'photo' : 'document',
                            url: d.filePath
                        }));
                        setDocList(docs);
                    }
                }
            } catch (error) {
                console.error('Error fetching service entry:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchServiceEntry();
        }
    }, [params.id]);


    // 2. Memoized Options for Hooks
    const vehicleQuery = useMemo(() => ({ limit: 500 }), []);
    const vendorOptions = useMemo(() => ({}), []);
    const tasksOptions = useMemo(() => ({
        limit: 100,
    }), []);

    const issueFilters = useMemo(() => ({
        vehicleId: formData.vehicleId || undefined,
    }), [formData.vehicleId]);

    // 3. API Hooks
    const { vehicles, loading: vehiclesLoading } = useVehicles({ query: vehicleQuery as any });
    const { vendors, loading: vendorsLoading } = useVendors(vendorOptions);
    const { tasks: availableTasks, loading: tasksLoading } = useServiceTasks(tasksOptions);
    const { issues, loading: issuesLoading } = useIssues(issueFilters);

    // 4. Effects
    const filteredIssues = useMemo(() => {
        return {
            open: issues.filter(i => i.status === 'OPEN'),
            resolved: issues.filter(i => i.status === 'RESOLVED'),
            closed: issues.filter(i => i.status === 'CLOSED'),
        };
    }, [issues]);

    // 5. Handlers
    const handleBack = () => {
        router.back();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this service entry? This action cannot be undone.')) {
            try {
                await serviceAPI.deleteServiceEntry(params.id);
                router.push('/service/history');
            } catch (error) {
                console.error('Error deleting service entry:', error);
                alert('Failed to delete service entry');
            }
        }
    };

    const handleInputChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const toggleIssueSelection = (issueId: string) => {
        setSelectedIssueIds(prev =>
            prev.includes(issueId) ? prev.filter(id => id !== issueId) : [...prev, issueId]
        );
    };

    const toggleItemExpansion = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const addLineItem = (task: any) => {
        setLineItems(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                taskId: task.id,
                name: task.name,
                labor: 0,
                parts: 0,
                subtotal: 0,
            }
        ]);
    };

    const removeLineItem = (id: string) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    const updateLineItem = (id: string, field: string, value: any) => {
        setLineItems(prev => prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'labor' || field === 'parts') {
                    newItem.subtotal = (newItem.labor || 0) + (newItem.parts || 0);
                }
                return newItem;
            }
            return item;
        }));
    };

    const costSummary = useMemo(() => {
        const subtotalLabor = lineItems.reduce((acc, item) => acc + (item.labor || 0), 0);
        const subtotalParts = lineItems.reduce((acc, item) => acc + (item.parts || 0), 0);
        const subtotal = subtotalLabor + subtotalParts;

        let discount = 0;
        if (formData.discountType === '%') {
            discount = (subtotal * (formData.discountValue || 0)) / 100;
        } else {
            discount = (formData.discountValue || 0);
        }

        const afterDiscount = subtotal - discount;

        let tax = 0;
        if (formData.taxType === '%') {
            tax = (afterDiscount * (formData.taxValue || 0)) / 100;
        } else {
            tax = (formData.taxValue || 0);
        }

        const total = afterDiscount + tax;

        return {
            labor: subtotalLabor,
            parts: subtotalParts,
            subtotal,
            discount,
            tax,
            total
        };
    }, [lineItems, formData.discountType, formData.discountValue, formData.taxType, formData.taxValue]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadData = new FormData();
        Array.from(files).forEach(file => {
            uploadData.append('files', file);
        });
        uploadData.append('labels', type);
        uploadData.append('attachedTo', 'temp_service_entry');

        setIsUploading(true);
        try {
            const token = authAPI.getToken();
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: uploadData,
            });

            const data = await res.json();
            if (data.success) {
                const newDocs = data.data.successful.map((item: any) => ({
                    id: item.document.id,
                    name: item.document.fileName,
                    type: type,
                    url: item.document.filePath
                }));
                setDocList(prev => [...prev, ...newDocs]);
                toast.success(`${type === 'photo' ? 'Photos' : 'Documents'} uploaded successfully`);
            } else {
                toast.error('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Error uploading files');
        } finally {
            setIsUploading(false);
        }

        if (e.target) e.target.value = '';
    };

    const handleRemoveFile = (id: string) => {
        setDocList(prev => prev.filter(doc => doc.id !== id));
    };

    const handleSave = async () => {
        if (!formData.vehicleId) {
            toast.error('Please select a vehicle');
            return;
        }

        try {
            const payload = {
                vehicleId: formData.vehicleId,
                date: new Date(`${formData.completionDate}T${formData.completionTime}`).toISOString(),
                meter: formData.odometer ? parseInt(formData.odometer) : undefined,
                vendor: formData.vendorId || undefined,
                notes: formData.generalNotes,
                totalCost: costSummary.total,
                status: 'COMPLETED' as const,
                tasks: lineItems.map(item => ({
                    serviceTaskId: item.taskId,
                    cost: item.subtotal,
                    notes: item.notes
                })),
                documents: docList.map(d => d.id),
                resolvedIssueIds: selectedIssueIds,
            };

            await serviceAPI.updateServiceEntry(params.id, payload);
            router.push('/service/history');
        } catch (err) {
            console.error('Error saving service entry:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#008751] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading service entry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f9fafb] min-h-screen">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            {/* Sticky Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-3 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex flex-col">
                    <button onClick={handleBack} className="text-[#008751] hover:underline flex items-center gap-1 text-sm font-medium mb-1">
                        <ArrowLeft size={14} /> Service Entries
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Service Entry</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDelete} className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 bg-white transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                    </button>
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-50 rounded-md border border-gray-300 bg-white transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-md shadow-sm transition-all flex items-center gap-2">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto py-8 px-4 space-y-8">

                {/* Details Section */}
                <section className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 bg-[#fcfcfc] rounded-t-xl">
                        <h2 className="text-lg font-bold text-gray-900">Details</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle <span className="text-red-500">*</span></label>
                                <VehicleSelect
                                    vehicles={vehicles as any[]}
                                    selectedVehicleId={formData.vehicleId}
                                    onSelect={(id) => handleInputChange('vehicleId', id)}
                                    loading={vehiclesLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Repair Priority Class</label>
                                <div className="relative">
                                    <select
                                        value={formData.repairPriority}
                                        onChange={(e) => handleInputChange('repairPriority', e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] appearance-none"
                                    >
                                        <option value="">Please select</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="non-scheduled">Non-Scheduled</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <p className="mt-2 text-[11px] text-gray-500 leading-relaxed font-medium capitalize">Repair Priority Class (VMRS Code Key 16) is a simple way to classify whether a service or repair was scheduled, non-scheduled, or an emergency.</p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Odometer <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.odometer}
                                            onChange={(e) => handleInputChange('odometer', e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">mi</span>
                                    </div>
                                </div>
                                <div className="flex items-end pb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVoid}
                                            onChange={(e) => handleInputChange('isVoid', e.target.checked)}
                                            className="rounded border-gray-300 text-[#008751] focus:ring-[#008751] w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Void</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Completion Date <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            value={formData.completionDate}
                                            onChange={(e) => handleInputChange('completionDate', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="time"
                                            value={formData.completionTime}
                                            onChange={(e) => handleInputChange('completionTime', e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.setStartDate}
                                        onChange={(e) => handleInputChange('setStartDate', e.target.checked)}
                                        className="rounded border-gray-300 text-[#008751] focus:ring-[#008751] w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Set Start Date</span>
                                </label>
                            </div>

                            <div className="col-span-full border-t border-gray-100 pt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reference</label>
                                <input
                                    type="text"
                                    value={formData.reference}
                                    onChange={(e) => handleInputChange('reference', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fournisseur</label>
                                <VendorSelect
                                    vendors={vendors}
                                    selectedVendorId={formData.vendorId}
                                    onSelect={(id) => handleInputChange('vendorId', id)}
                                    loading={vendorsLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Labels</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] appearance-none"
                                    >
                                        <option value="">Please select</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Issues Section */}
                <section className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfcfc] rounded-t-xl">
                        <h2 className="text-lg font-bold text-gray-900">Issues</h2>
                        <button className="text-[#008751] font-bold text-sm flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded">
                            <Plus size={16} /> Add Issue
                        </button>
                    </div>

                    <div className="px-6 border-b border-gray-100 flex gap-6">
                        {(['open', 'resolved', 'closed'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveIssueTab(tab)}
                                className={`py-3 px-1 text-sm font-bold capitalize relative ${activeIssueTab === tab ? 'text-[#008751]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab}
                                {activeIssueTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008751]"></div>}
                            </button>
                        ))}
                    </div>

                    {!formData.vehicleId ? (
                        <div className="p-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-4 border border-gray-100"><AlertCircle className="text-yellow-500" size={24} /></div>
                            <p className="text-sm font-semibold text-gray-900">Select a vehicle first.</p>
                            <p className="text-xs text-gray-500 mt-1">Select a vehicle above to see issues associated with it.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="p-4 bg-gray-50/50 flex items-center gap-2 border-b border-gray-100">
                                <AlertCircle className="text-blue-500" size={16} />
                                <span className="text-xs font-medium text-gray-600">Select any issues that were resolved as part of this service.</span>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-white">
                                        <th className="px-6 py-3 w-10"></th>
                                        <th className="px-3 py-3 font-medium">Priority</th>
                                        <th className="px-3 py-3 font-medium">Issue</th>
                                        <th className="px-3 py-3 font-medium">Summary</th>
                                        <th className="px-3 py-3 font-medium">Status</th>
                                        <th className="px-3 py-3 font-medium text-right">Reported</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredIssues[activeIssueTab].map(issue => (
                                        <tr key={issue.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => toggleIssueSelection(issue.id)}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIssueIds.includes(issue.id)}
                                                    onChange={() => { }}
                                                    className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                                                />
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${issue.priority === 'CRITICAL' ? 'bg-red-500' :
                                                        issue.priority === 'HIGH' ? 'bg-orange-500' :
                                                            issue.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                                                        }`}></div>
                                                    <span className="text-xs font-bold text-gray-700">{issue.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 font-bold text-[#008751] text-xs underline decoration-transparent group-hover:decoration-[#008751]">#{issue.id.slice(-4)}</td>
                                            <td className="px-3 py-4 text-xs font-bold text-gray-800">{issue.summary}</td>
                                            <td className="px-3 py-4">
                                                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-sm uppercase tracking-tighter ring-1 ring-yellow-200">
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-[11px] text-gray-500 text-right font-medium">{new Date(issue.reportedDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {filteredIssues[activeIssueTab].length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-400 text-sm">No {activeIssueTab} issues found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Line Items Section */}
                <section className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfcfc] rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">Line Items</h2>
                            <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-1.5 py-0.5 rounded-full ring-1 ring-gray-200">{lineItems.length}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-[#008751] font-bold text-sm flex items-center gap-1.5 hover:bg-green-50 px-2 py-1 rounded transition-colors group">
                                View Service Reminders
                                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full inline-block transform transition-transform group-hover:scale-110">5</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="relative flex-1">
                                <ServiceTaskSelect
                                    tasks={availableTasks}
                                    onSelect={(taskId, taskName) => addLineItem({ id: taskId, name: taskName })}
                                    loading={tasksLoading}
                                    placeholder="Rechercher une tâche..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-4">
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"><ListFilter size={18} /></button>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"><Settings2 size={18} /></button>
                            </div>
                            <div className="hidden md:flex items-center gap-0 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                                <span className="w-28 px-2">Labor</span>
                                <span className="w-28 px-2">Parts</span>
                                <span className="w-32 px-2 mr-10">Subtotal</span>
                            </div>
                        </div>

                        {lineItems.length > 0 ? (
                            <div className="space-y-1">
                                {lineItems.map(item => {
                                    const isExpanded = expandedItems.includes(item.id);
                                    return (
                                        <div key={item.id} className="border border-gray-100 rounded-lg bg-white mb-2 shadow-sm">
                                            <div className="flex items-center p-4 hover:bg-gray-50/30 transition-colors">
                                                <button
                                                    onClick={() => toggleItemExpansion(item.id)}
                                                    className="p-1 mr-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                </button>

                                                <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                                    <span className="text-sm font-bold text-gray-900 truncate">{item.name}</span>
                                                    <Info size={14} className="text-gray-300 shrink-0 cursor-help" />
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    <div className="relative w-28">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">€</span>
                                                        <input
                                                            type="number"
                                                            value={item.labor || 0}
                                                            onChange={(e) => updateLineItem(item.id, 'labor', parseFloat(e.target.value) || 0)}
                                                            className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded text-sm font-medium focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none text-right transition-shadow"
                                                        />
                                                    </div>
                                                    <div className="relative w-28">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">€</span>
                                                        <input
                                                            type="number"
                                                            value={item.parts || 0}
                                                            onChange={(e) => updateLineItem(item.id, 'parts', parseFloat(e.target.value) || 0)}
                                                            className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded text-sm font-medium focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none text-right transition-shadow"
                                                        />
                                                    </div>
                                                    <div className="relative w-32">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">€</span>
                                                        <input
                                                            type="text"
                                                            disabled
                                                            value={(item.subtotal || 0).toFixed(2)}
                                                            className="w-full pl-6 pr-2 py-2 border border-gray-100 bg-gray-50/50 rounded text-sm font-bold text-gray-900 text-right opacity-80"
                                                        />
                                                    </div>
                                                    <div className="relative line-item-menu">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                                                            }}
                                                            className={`p-2 rounded-full transition-colors ml-2 ${openMenuId === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                        {openMenuId === item.id && (
                                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-32 py-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeLineItem(item.id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-14 pb-6 space-y-6 pt-2 border-t border-gray-50 bg-[#fefefe]">
                                                    <div className="flex items-center gap-6 text-[11px] font-medium text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-gray-400" />
                                                            Last Completed: <span className="text-gray-900">Never</span>
                                                        </div>
                                                        <button className="flex items-center gap-1.5 text-[#008751] hover:underline font-bold">
                                                            <Plus size={13} /> Add Service Reminder
                                                        </button>
                                                    </div>

                                                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 bg-white">
                                                        <AlertTriangle size={14} className="text-gray-400" /> Link Issues
                                                    </button>

                                                    <textarea
                                                        placeholder="Add notes or additional details"
                                                        value={item.notes || ''}
                                                        onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-md p-3 text-sm focus:ring-1 focus:ring-[#008751] outline-none h-24 placeholder:text-gray-300"
                                                    ></textarea>

                                                    <div className="space-y-4">
                                                        <button className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-700">
                                                            MAINTENANCE CATEGORIZATION <ChevronDown size={14} className="text-gray-400" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                            <div className="space-y-2">
                                                                <label className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                                                    Reason for Repair <Info size={12} className="text-gray-300 pointer-events-none" />
                                                                </label>
                                                                <div className="relative group/select">
                                                                    <select className="w-full p-2.5 border border-gray-200 rounded text-sm bg-white text-[#008751] font-medium appearance-none cursor-pointer group-hover/select:border-gray-300 transition-colors outline-none focus:border-[#008751]">
                                                                        <option>Select Reason for Repair</option>
                                                                    </select>
                                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                                                    Category / System / Assembly <Info size={12} className="text-gray-300 pointer-events-none" />
                                                                </label>
                                                                <div className="flex gap-2">
                                                                    <div className="flex-[0.8] relative group/select">
                                                                        <select className="w-full p-2.5 border border-gray-200 rounded text-sm bg-white font-medium appearance-none cursor-pointer group-hover/select:border-gray-300 transition-colors outline-none focus:border-[#008751]">
                                                                            <option>2 - Drive Train</option>
                                                                        </select>
                                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                                    </div>
                                                                    <div className="flex-1 relative group/select">
                                                                        <select className="w-full p-2.5 border border-gray-200 rounded text-sm bg-white font-medium appearance-none cursor-pointer group-hover/select:border-gray-300 transition-colors outline-none focus:border-[#008751] truncate pr-8">
                                                                            <option>027 - Transmission - A...</option>
                                                                        </select>
                                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                                    </div>
                                                                    <div className="flex-1 relative group/select">
                                                                        <select className="w-full p-2.5 border border-gray-200 rounded text-sm bg-white font-medium appearance-none cursor-pointer group-hover/select:border-gray-300 transition-colors outline-none focus:border-[#008751] truncate pr-8">
                                                                            <option>033 - Range Selector ...</option>
                                                                        </select>
                                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-sm font-medium text-gray-400">No line items added. Start by searching for a task above.</p>
                            </div>
                        )}

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-10">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-tighter">General Notes</h3>
                                <textarea
                                    value={formData.generalNotes}
                                    onChange={(e) => handleInputChange('generalNotes', e.target.value)}
                                    placeholder="Add notes or additional details"
                                    className="w-full h-40 border border-gray-300 rounded-md p-4 text-sm focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] resize-none"
                                ></textarea>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-tighter">Cost Summary</h3>
                                <div className="space-y-4 border-b border-gray-100 pb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                        <span className="text-gray-900 font-bold">€{costSummary.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium pl-4 border-l-2 border-gray-100">Labor</span>
                                        <span className="text-gray-500">€{costSummary.labor.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium pl-4 border-l-2 border-gray-100">Parts</span>
                                        <span className="text-gray-500">€{costSummary.parts.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm pt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-medium">Discount</span>
                                            <div className="flex rounded border border-gray-200 overflow-hidden">
                                                <button
                                                    onClick={() => handleInputChange('discountType', '%')}
                                                    className={`px-2 py-0.5 text-[10px] font-bold ${formData.discountType === '%' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                                                >%</button>
                                                <button
                                                    onClick={() => handleInputChange('discountType', '€')}
                                                    className={`px-2 py-0.5 text-[10px] font-bold border-l border-gray-200 ${formData.discountType === '€' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                                                >€</button>
                                            </div>
                                            <input
                                                type="number"
                                                value={formData.discountValue || 0}
                                                onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                                                className="w-16 h-7 border border-gray-200 rounded px-2 text-xs font-bold focus:border-[#008751] outline-none"
                                            />
                                        </div>
                                        <span className="text-gray-900 font-bold">€{costSummary.discount.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-medium">Tax</span>
                                            <div className="flex rounded border border-gray-200 overflow-hidden">
                                                <button
                                                    onClick={() => handleInputChange('taxType', '%')}
                                                    className={`px-2 py-0.5 text-[10px] font-bold ${formData.taxType === '%' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                                                >%</button>
                                                <button
                                                    onClick={() => handleInputChange('taxType', '€')}
                                                    className={`px-2 py-0.5 text-[10px] font-bold border-l border-gray-200 ${formData.taxType === '€' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                                                >€</button>
                                            </div>
                                            <input
                                                type="number"
                                                value={formData.taxValue || 0}
                                                onChange={(e) => handleInputChange('taxValue', parseFloat(e.target.value) || 0)}
                                                className="w-16 h-7 border border-gray-200 rounded px-2 text-xs font-bold focus:border-[#008751] outline-none"
                                            />
                                        </div>
                                        <span className="text-gray-900 font-bold">€{costSummary.tax.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-6">
                                    <span className="text-lg font-bold text-gray-900 uppercase">Total</span>
                                    <span className="text-2xl font-black text-gray-900 tracking-tight">€{costSummary.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Photos & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#fcfcfc] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Camera size={18} className="text-gray-400" /> Photos</h2>
                        </div>
                        <div className="p-8">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={photoInputRef}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'photo')}
                            />
                            <div
                                onClick={() => photoInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/50 hover:border-[#008751]/30 transition-all group mb-4"
                            >
                                <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-green-50 transition-colors">
                                    <Upload size={28} className="text-gray-400 group-hover:text-[#008751]" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Click to upload photos</p>
                                {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Uploading...</p>}
                            </div>

                            {/* Photos List */}
                            <div className="grid grid-cols-2 gap-4">
                                {docList.filter(d => d.type === 'photo').map(doc => (
                                    <div key={doc.id} className="relative group border border-gray-200 rounded-lg p-2 flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                                            <Camera size={16} />
                                        </div>
                                        <span className="text-xs font-medium truncate flex-1">{doc.name}</span>
                                        <button
                                            onClick={() => handleRemoveFile(doc.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#fcfcfc] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-gray-400" /> Documents</h2>
                        </div>
                        <div className="p-8">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                ref={documentInputRef}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'document')}
                            />
                            <div
                                onClick={() => documentInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/50 hover:border-[#008751]/30 transition-all group mb-4"
                            >
                                <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-green-50 transition-colors">
                                    <Upload size={28} className="text-gray-400 group-hover:text-[#008751]" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Click to upload documents</p>
                                {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Uploading...</p>}
                            </div>

                            {/* Documents List */}
                            <div className="space-y-2">
                                {docList.filter(d => d.type === 'document').map(doc => (
                                    <div key={doc.id} className="relative group border border-gray-200 rounded-lg p-2 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-xs font-medium truncate flex-1">{doc.name}</span>
                                        <button
                                            onClick={() => handleRemoveFile(doc.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Comments Section */}
                <section className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-[#fcfcfc]">
                        <h2 className="text-lg font-bold text-gray-900">Comments</h2>
                    </div>
                    <div className="p-8">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-[#008751] text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-green-100">FM</div>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all text-sm outline-none"
                                placeholder="Add an optional comment"
                                rows={4}
                            ></textarea>
                        </div>
                    </div>
                </section>

                {/* Bottom Actions */}
                <div className="flex justify-end gap-3 pt-4 pb-20">
                    <button onClick={handleDelete} className="px-6 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-md border border-gray-300 bg-white shadow-sm transition-all flex items-center gap-2 mr-auto">
                        <Trash2 size={16} /> Delete
                    </button>
                    <button onClick={handleBack} className="px-6 py-2.5 text-gray-700 font-bold hover:bg-gray-50 rounded-md border border-gray-300 bg-white shadow-sm transition-all">Cancel</button>
                    <button onClick={() => { }} className="px-6 py-2.5 text-gray-700 font-bold hover:bg-gray-50 rounded-md border border-gray-300 bg-white shadow-sm transition-all">Save & Copie</button>
                    <button onClick={handleSave} className="px-8 py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-black rounded-md shadow-lg transition-all active:scale-[0.98]">
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}
