'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, User, History, Car, AlertTriangle, ClipboardCheck, Clock, Plus, X, MessageSquare, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/types';

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Mock contact data - in real app, this would come from API/database
  const contact: Contact = {
    id: params.id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    status: 'ACTIVE',
    classifications: ['Employee', 'Operator'],
    group: 'Atlanta',
    phone: '(404) 555-0123',
    jobTitle: 'Driver',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleBack = () => {
    router.push('/dashboard/contacts');
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page
    console.log('Edit contact:', contact.id);
  };

  const AssignVehicleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Add Vehicle Assignment For {contact.firstName} {contact.lastName}</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Vehicle <span className="text-red-500">*</span></label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                        <option>AC101 - 2018 Ford F-150</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Operator <span className="text-red-500">*</span></label>
                    <input type="text" value={`${contact.firstName} ${contact.lastName}`} disabled className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500" />
                </div>
                <div>
                    <textarea placeholder="Add an optional comment" className="w-full p-2.5 border border-gray-300 rounded-md h-24"></textarea>
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                <button onClick={() => setShowAssignModal(false)} className="text-[#008751] font-medium hover:underline">Cancel</button>
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-gray-200 text-gray-400 font-bold rounded cursor-not-allowed">Save Assignment</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
       {showAssignModal && <AssignVehicleModal />}
       
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
             <button onClick={handleBack} className="hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={16}/> Contacts</button>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-6">
                 <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-white shadow-sm">
                     {contact.firstName[0]}{contact.lastName[0]}
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{contact.firstName} {contact.lastName}</h1>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div>
                            <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Group</span>
                            <span className="font-medium text-gray-900">{contact.group || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Email</span>
                            <span className="font-medium text-[#008751]">{contact.email}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400">Classifications</span>
                            <span className="font-medium text-gray-900">{contact.classifications.join(', ')}</span>
                        </div>
                    </div>
                 </div>
             </div>
             <div className="flex gap-2">
                 <button className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <MoreHorizontal size={16} />
                </button>
                 <button onClick={handleEdit} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit2 size={16} /> Edit
                </button>
                 <button onClick={() => setShowAssignModal(true)} className="px-3 py-1.5 bg-[#008751] text-white rounded text-sm font-medium hover:bg-[#007043] flex items-center gap-2 shadow-sm">
                    <Plus size={16} /> Add
                </button>
             </div>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white border-b border-gray-200 px-8">
           <div className="flex gap-6 overflow-x-auto">
               {['Overview', 'Vehicle Assignments', 'Renewal Reminders', 'Issues', 'Service Reminders', 'Inspections', 'Location History'].map((tab, idx) => (
                   <button 
                    key={tab}
                    className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${idx === 0 ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                       {tab}
                   </button>
               ))}
           </div>
       </div>

       <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3">
                  <div className="text-blue-500 mt-0.5"><User size={16} /></div>
                  <div className="text-sm text-blue-900">This Contact doesn't have user access.</div>
              </div>

              {/* Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                     <h2 className="text-lg font-bold text-gray-900">Details</h2>
                  </div>
                  <div className="p-6">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">All Fields</h3>
                      <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">First Name</span>
                              <span className="col-span-2 font-medium text-gray-900">{contact.firstName}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Last Name</span>
                              <span className="col-span-2 font-medium text-gray-900">{contact.lastName}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Email</span>
                              <span className="col-span-2 text-[#008751]">{contact.email}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Group</span>
                              <span className="col-span-2 text-gray-900">{contact.group}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Job Title</span>
                              <span className="col-span-2 text-gray-900">{contact.jobTitle || '—'}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Current Vehicle Assignments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Current Vehicle Assignments</h2>
                     <button 
                        onClick={() => setShowAssignModal(true)}
                        className="text-[#008751] text-xs font-bold hover:underline flex items-center gap-1"
                     >
                         <Plus size={14} /> Add Vehicle Assignment
                     </button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <Car size={48} className="text-gray-300 mb-2 stroke-1" />
                      <p className="text-sm text-gray-500">No currently active vehicle assignments</p>
                  </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 py-4">
                  Created recently · Updated recently
              </div>

          </div>

          {/* Right Column - Comments */}
          <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[400px] flex flex-col">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Comments</h2>
                 </div>
                 <div className="p-8 flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                     <MessageSquare size={48} className="text-gray-300 mb-4 stroke-1" />
                     <p className="text-sm">Start a conversation or leave a note by adding a comment below.</p>
                 </div>
                 <div className="p-4 border-t border-gray-200 flex gap-3">
                     <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">HR</div>
                     <div className="flex-1">
                         <input 
                           type="text" 
                           placeholder="Add a Comment" 
                           className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                         />
                     </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}