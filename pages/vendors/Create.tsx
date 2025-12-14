import React from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface VendorCreateProps {
  onCancel: () => void;
  onSave: () => void;
  initialData?: any;
}

const VendorCreate: React.FC<VendorCreateProps> = ({ onCancel, onSave, initialData }) => {
  const isEdit = !!initialData;

  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             {!isEdit && (
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <ArrowLeft size={18} /> Vendors
                </button>
             )}
             {isEdit && <div className="text-sm text-gray-500">Vendors / {initialData.name}</div>}
             <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Vendor' : 'New Vendor'}</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Vendor</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>
             
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input type="text" defaultValue={initialData?.name} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                        <div className="absolute right-3 top-3 text-red-400"><MoreHorizontal size={16}/></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="text" defaultValue={initialData?.phone} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                         <input type="text" defaultValue={initialData?.website} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" defaultValue="2751 N Monroe St" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    <p className="mt-1 text-xs text-gray-500">Street address, P.O. box, etc.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    <p className="mt-1 text-xs text-gray-500">Suite, unit, building, floor, etc.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" defaultValue="Tallahassee" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province/Region</label>
                        <input type="text" defaultValue="FL" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                        <input type="text" defaultValue="32303" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                            <option>United States of America</option>
                        </select>
                     </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea rows={3} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"></textarea>
                </div>
             </div>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Person</h2>
             <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input type="text" defaultValue={initialData?.contactName} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="relative">
                            <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                            <div className="absolute right-3 top-3 text-red-400"><MoreHorizontal size={16}/></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Contact person's direct line or mobile number</p>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                         <input type="email" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>
             </div>
          </div>

          {/* Classification */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Classification</h2>
             <div className="space-y-3">
                 <label className="flex items-start gap-3">
                     <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                     <div>
                         <span className="block text-sm font-medium text-gray-900">Charging</span>
                         <span className="block text-xs text-gray-500">Charging classification allows vendor to be listed on Charging Entries</span>
                     </div>
                 </label>
                 <label className="flex items-start gap-3">
                     <input type="checkbox" defaultChecked className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                     <div>
                         <span className="block text-sm font-medium text-gray-900">Fuel</span>
                         <span className="block text-xs text-gray-500">Fuel classification allows vendor to be listed on Fuel Entries</span>
                     </div>
                 </label>
                 <label className="flex items-start gap-3">
                     <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                     <div>
                         <span className="block text-sm font-medium text-gray-900">Service</span>
                         <span className="block text-xs text-gray-500">Service classification allows vendor to be listed on Service Entries and Work Orders</span>
                     </div>
                 </label>
                 <label className="flex items-start gap-3">
                     <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                     <div>
                         <span className="block text-sm font-medium text-gray-900">Vehicle</span>
                         <span className="block text-xs text-gray-500">Vehicle classification allows vendor to be listed on Vehicle Acquisitions</span>
                     </div>
                 </label>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             {!isEdit && <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>}
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Vendor</button>
         </div>

       </div>
    </div>
  );
};

export default VendorCreate;