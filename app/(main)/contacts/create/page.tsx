'use client';

import React, { useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContactCreatePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const handleCancel = () => {
    router.push('/dashboard/contacts');
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save contact:', { firstName, lastName });
    router.push('/dashboard/contacts');
  };

  const handleSaveAndAddAnother = () => {
    // TODO: Implement save and add another functionality
    console.log('Save and add another:', { firstName, lastName });
    setFirstName('');
    setLastName('');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Contacts
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Contact</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Add Multiple Contacts</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Contact</button>
         </div>
       </div>

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
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                         <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    <p className="mt-1 text-xs text-gray-500">If this Contact is granted user access, email notifications will be sent here</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                        <option>Atlanta</option>
                        <option>Nashville</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                    <div className="flex gap-2">
                        <button className="bg-[#008751] text-white px-3 py-1.5 rounded text-sm font-medium">Pick File</button>
                        <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-sm border border-gray-300 border-dashed">Or drop file here</button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 italic">No file selected</p>
                </div>
             </div>

             <div className="mt-8 border-t border-gray-100 pt-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Classifications</h3>
                 <div className="grid grid-cols-2 gap-4">
                     <label className="flex items-start gap-3">
                         <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                         <div>
                             <span className="block text-sm font-medium text-gray-900">Operator</span>
                             <span className="block text-xs text-gray-500">Allow this Contact to be assigned to assets</span>
                         </div>
                     </label>
                     <label className="flex items-start gap-3">
                         <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                         <div>
                             <span className="block text-sm font-medium text-gray-900">Employee</span>
                             <span className="block text-xs text-gray-500">Current or former employee, for identification purposes only</span>
                         </div>
                     </label>
                     <label className="flex items-start gap-3">
                         <input type="checkbox" className="mt-1 text-[#008751] focus:ring-[#008751] rounded" />
                         <div>
                             <span className="block text-sm font-medium text-gray-900">Technician</span>
                             <span className="block text-xs text-gray-500">Allow this Contact to be selected in labor line items on work orders</span>
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
                    <input type="text" placeholder="404-555-0123" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone Number</label>
                    <input type="text" placeholder="e.g. 555-212-3212" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone Number</label>
                    <input type="text" placeholder="e.g. 555-212-3212" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Phone Number</label>
                    <input type="text" placeholder="e.g. 555-212-3212" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
             </div>
             
             <div className="mt-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
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
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province/Region</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                            <option></option>
                        </select>
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
                    <input type="text" placeholder="e.g. Assistant to the Regional Manager" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Date</label>
                        <input type="date" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Class</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License State/Province/Region</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Labor Rate</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">Ar</span>
                        <input type="number" className="w-full pl-8 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                 </div>
             </div>
          </div>

          {/* SAML */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">SAML</h2>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAML ID</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                <p className="mt-1 text-xs text-gray-500">This feature links a Contact with a given SAML ID</p>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Contact</button>
         </div>

       </div>
    </div>
  );
}