
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Calendar, Car, Search, MoreHorizontal, CheckCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useVendors } from '@/lib/hooks/useVendors';
import { vehiclesAPI } from '@/lib/services/vehicles-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function EditExpensePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast, toasts, removeToast } = useToast();
    const { vehicles, loading: vehiclesLoading } = useVehicles();
    const { vendors, loading: vendorsLoading } = useVendors();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        vehicleId: '',
        date: '',
        currency: 'MGA',
        type: '',
        vendor: '',
        vendorId: '',
        amount: 0,
        notes: '',
        source: 'Manually Entered',
        // Photos/Docs are managed in detail view
    });

    const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const vehicleDropdownRef = React.useRef<HTMLDivElement>(null);

    const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const vendorDropdownRef = React.useRef<HTMLDivElement>(null);

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

    // Fetch existing expense data
    useEffect(() => {
        const fetchExpense = async () => {
            try {
                setFetching(true);
                const expense = await vehiclesAPI.getExpense(params.id);

                // Format date to YYYY-MM-DD for input
                const dateStr = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';

                setFormData({
                    vehicleId: expense.vehicleId,
                    date: dateStr,
                    currency: expense.currency || 'MGA',
                    type: expense.type,
                    vendor: expense.vendorName || '',
                    vendorId: expense.vendorId || '',
                    amount: expense.amount,
                    notes: expense.notes || '',
                    source: expense.source || 'Manually Entered'
                });
            } catch (err) {
                console.error(err);
                toast.error('Failed to load expense details');
                // router.push('/vehicles/expense'); // Optional: redirect on error
            } finally {
                setFetching(false);
            }
        };

        if (params.id) {
            fetchExpense();
        }
    }, [params.id]);

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

    // If we have a vendorId, try to find it in loaded vendors. 
    // If not found (maybe pagination), we still have formData.vendor (name) to display if needed, but the dropdown usually relies on objects.
    // For now, simple matching.
    const selectedVendor = vendors.find(v => v.id === formData.vendorId);

    const validateForm = () => {
        if (!formData.vehicleId) {
            toast.error('Please select a vehicle');
            return false;
        }
        if (!formData.type) {
            toast.error('Please select an expense type');
            return false;
        }
        if (formData.amount <= 0) {
            toast.error('Please enter a valid amount');
            return false;
        }
        if (!formData.date) {
            toast.error('Please select a date');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            // Format date for API (ISO string)
            const dateObj = new Date(formData.date);
            const isoDate = dateObj.toISOString();

            await vehiclesAPI.updateExpense(params.id, {
                ...formData,
                date: isoDate
            });

            toast.success('Expense updated successfully');

            setTimeout(() => {
                router.push(`/vehicles/expense/${params.id}`);
            }, 1000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error updating expense';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) return;

        try {
            setLoading(true);
            await vehiclesAPI.deleteExpense(params.id);
            toast.success('Expense deleted successfully');
            setTimeout(() => {
                router.push('/vehicles/expense');
            }, 1000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error deleting expense';
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading expense details...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href={`/vehicles/expense/${params.id}`} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to details
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Expense Entry</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium border border-transparent rounded flex items-center gap-2"
                        disabled={loading}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                    <div className="w-px h-8 bg-gray-300 mx-2"></div>
                    <button
                        onClick={() => router.push(`/vehicles/expense/${params.id}`)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Details</h2>

                <div className="space-y-4 max-w-3xl">
                    <div className="relative" ref={vehicleDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>

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
                                        <span className="text-gray-500">{vehiclesLoading ? 'Loading...' : 'Select a vehicle...'}</span>
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
                                                placeholder="Search vehicle..."
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
                                                        <div className="text-xs text-gray-500">{v.licensePlate || 'No Plate'} • {v.type || 'Standard'}</div>
                                                    </div>
                                                    {formData.vehicleId === v.id && <div className="text-[#008751]"><CheckCircle size={14} /></div>}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-center text-xs text-gray-500 italic">No vehicles found</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type <span className="text-red-500">*</span></label>
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[#008751] focus:border-[#008751]"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="">Please select</option>
                            <option value="Fuel">Fuel</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Tolls">Tolls</option>
                            <option value="Vehicle Registration">Vehicle Registration</option>
                            <option value="Vehicle Registration and Taxes">Vehicle Registration and Taxes</option>
                            <option value="Telematics Device">Telematics Device</option>
                            <option value="Safety Technology">Safety Technology</option>
                        </select>
                    </div>

                    <div className="relative" ref={vendorDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
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
                                    ) : formData.vendor ? (
                                        <div>
                                            <span className="font-medium text-gray-900">{formData.vendor}</span>
                                            <span className="ml-2 text-xs text-gray-400">(Legacy/Manual)</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">{vendorsLoading ? 'Loading...' : 'Select a vendor...'}</span>
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
                                                placeholder="Search vendor..."
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
                                                <div className="text-xs text-gray-500 italic mb-2">No vendors found</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
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

                <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
                    <p>
                        Photos and documents can be managed on the <Link href={`/vehicles/expense/${params.id}`} className="text-[#008751] hover:underline">expense detail page</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
