import React, { useState } from 'react';
import { ArrowLeft, Edit2, MoreHorizontal, User, History, Car, AlertTriangle, ClipboardCheck, Clock, Plus, X, MessageSquare, Wrench } from 'lucide-react';
import { Contact } from '../../types';

interface ContactDetailProps {
  contact: Contact | null;
  onBack: () => void;
  onEdit: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onBack, onEdit }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);

  if (!contact) return <div>Contact not found</div>;

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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time</label>
                        <div className="flex gap-2">
                            <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md" />
                            <input type="time" defaultValue="15:06" className="w-full p-2.5 border border-gray-300 rounded-md" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">When assignment starts. Leave blank if assignment has always existed.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
                        <div className="flex gap-2">
                            <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md" />
                            <input type="time" defaultValue="15:06" className="w-full p-2.5 border border-gray-300 rounded-md" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">When does this assignment end? Can be past or future.</p>
                    </div>
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
             <button onClick={onBack} className="hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={16}/> Contacts</button>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-6">
                 {contact.image ? (
                     <img src={contact.image} alt="" className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm" />
                 ) : (
                     <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-white shadow-sm">
                         {contact.firstName[0]}{contact.lastName[0]}
                     </div>
                 )}
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
                 <button onClick={onEdit} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
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
                              <span className="text-gray-500">Middle Name</span>
                              <span className="col-span-2 text-gray-900">—</span>
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
                              <span className="col-span-2 text-gray-900 flex items-center justify-between">
                                  <span>{contact.group} <span className="text-gray-400 text-xs">Georgia /</span></span>
                                  <History size={14} className="text-[#008751]" />
                              </span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Operator</span>
                              <span className="col-span-2 text-gray-900">{contact.classifications.includes('Operator') ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Employee</span>
                              <span className="col-span-2 text-gray-900">{contact.classifications.includes('Employee') ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Technician</span>
                              <span className="col-span-2 text-gray-900">{contact.classifications.includes('Technician') ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Phone</span>
                              <span className="col-span-2 text-[#008751]">{contact.phone || '(404) 555-0123'} <span className="text-gray-500 text-xs ml-1 bg-gray-100 px-1 rounded">Mobile</span></span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Address</span>
                              <span className="col-span-2 text-gray-900">—</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Job Title</span>
                              <span className="col-span-2 text-gray-900">{contact.jobTitle || 'Driver'}</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Date of Birth</span>
                              <span className="col-span-2 text-gray-900 decoration-dotted underline underline-offset-4">05/26/1986</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Employee Number</span>
                              <span className="col-span-2 text-gray-900">D103</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Start Date</span>
                              <span className="col-span-2 text-gray-900 decoration-dotted underline underline-offset-4">11/14/2024</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Leave Date</span>
                              <span className="col-span-2 text-gray-900">—</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">License Number</span>
                              <span className="col-span-2 text-gray-900">74930284</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">License Class</span>
                              <span className="col-span-2 text-gray-900">A</span>
                          </div>
                          <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                              <span className="text-gray-500">License State/Province/Region</span>
                              <span className="col-span-2 text-gray-900">Georgia</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* User Access Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">User Access</h2>
                     <button className="text-[#008751] text-xs font-bold hover:underline">Edit</button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4 text-green-500">
                          <User size={32} />
                      </div>
                      <p className="text-sm text-gray-600 max-w-sm">
                          Granting this Contact user access lets them log in to FleetMada, manage data, and receive notifications for ONNO.
                      </p>
                  </div>
              </div>

              {/* Current Vehicle Assignments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Current Vehicle Assignments</h2>
                     <div className="flex gap-4">
                         <button 
                            onClick={() => setShowAssignModal(true)}
                            className="text-[#008751] text-xs font-bold hover:underline flex items-center gap-1"
                         >
                             <Plus size={14} /> Add Vehicle Assignment
                         </button>
                         <button className="text-[#008751] text-xs font-bold hover:underline">View All</button>
                     </div>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <Car size={48} className="text-gray-300 mb-2 stroke-1" />
                      <p className="text-sm text-gray-500">No currently active vehicle assignments</p>
                  </div>
              </div>

              {/* Renewal Reminders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Renewal Reminders</h2>
                     <div className="flex gap-4">
                         <button className="text-[#008751] text-xs font-bold hover:underline flex items-center gap-1"><Plus size={14} /> Add Renewal Reminder</button>
                         <button className="text-[#008751] text-xs font-bold hover:underline">View All</button>
                     </div>
                  </div>
                  <table className="min-w-full">
                      <thead>
                          <tr className="border-b border-gray-200">
                              <th className="text-left text-xs font-bold text-gray-900 p-4">Type</th>
                              <th className="text-left text-xs font-bold text-gray-900 p-4">Due Date</th>
                              <th className="text-left text-xs font-bold text-gray-900 p-4">Notifications Enabled</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr className="border-b border-gray-100">
                              <td className="p-4 text-sm text-gray-900">Certification</td>
                              <td className="p-4 text-sm">
                                  <div className="font-medium text-gray-900">Apr 7, 2026</div>
                                  <div className="text-xs text-gray-500">4 months from now</div>
                              </td>
                              <td className="p-4 text-sm">
                                  <span className="flex items-center gap-1.5 text-gray-900">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                  </span>
                              </td>
                          </tr>
                          <tr>
                              <td className="p-4 text-sm text-gray-900">License Renewal</td>
                              <td className="p-4 text-sm">
                                  <div className="font-medium text-gray-900">Feb 20, 2026</div>
                                  <div className="text-xs text-gray-500">2 months from now</div>
                              </td>
                              <td className="p-4 text-sm">
                                  <span className="flex items-center gap-1.5 text-gray-900">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                  </span>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              {/* Incomplete Work Order Assignments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                     <h2 className="text-lg font-bold text-gray-900">Incomplete Work Order Assignments</h2>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <ClipboardCheck size={48} className="text-gray-300 mb-2 stroke-1" />
                      <p className="text-sm text-gray-500">Contact must have technician classification to be assigned to work orders</p>
                  </div>
              </div>

              {/* Open Issue Assignments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Open Issue Assignments</h2>
                     <button className="text-[#008751] text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <MessageSquare size={48} className="text-gray-300 mb-2 stroke-1" />
                      <p className="text-sm text-gray-500">No open issues currently assigned</p>
                  </div>
              </div>

              {/* Service Reminder Assignments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-bold text-gray-900">Service Reminder Assignments</h2>
                     <button className="text-[#008751] text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                      <Wrench size={48} className="text-gray-300 mb-2 stroke-1" />
                      <p className="text-sm text-gray-500">No service reminders currently assigned</p>
                  </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 py-4">
                  Created 17 hours ago · Updated 17 hours ago
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
};

export default ContactDetail;